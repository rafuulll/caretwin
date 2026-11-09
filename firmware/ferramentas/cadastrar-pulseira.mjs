// Cadastra uma pulseira real (cartao 5.7).
//
// Rode dentro da pasta firmware:
//   node ferramentas/cadastrar-pulseira.mjs                     pulseira nova, codigo sorteado
//   node ferramentas/cadastrar-pulseira.mjs --codigo CT-AB12    pulseira nova, codigo escolhido
//   node ferramentas/cadastrar-pulseira.mjs --codigo CT-AB12 --trocar-token
//                                                               token novo para uma pulseira ja cadastrada
//
// O que ele faz:
//  1. Gera um token aleatorio (a senha que a pulseira manda para a API).
//  2. Grava o token em include/segredos.h, que NAO vai para o git. O token nao aparece na tela.
//  3. Mostra o SQL para rodar no SQL Editor do Supabase. O banco guarda so o sha256 do token,
//     igual a apps/web/src/lib/dispositivo.ts (hashDoToken).
// Depois: grave a pulseira (pio run -e real -t upload) e ligue ela no site pelo codigo.
import { createHash, randomBytes, randomInt } from "node:crypto"
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const pastaFirmware = join(dirname(fileURLToPath(import.meta.url)), "..")
const segredos = join(pastaFirmware, "include", "segredos.h")
const modelo = join(pastaFirmware, "include", "segredos.exemplo.h")

function sair(mensagem) {
  console.error(`\nERRO: ${mensagem}\n`)
  process.exit(1)
}

const args = process.argv.slice(2)
const trocarToken = args.includes("--trocar-token")
const iCodigo = args.indexOf("--codigo")
let codigo = iCodigo >= 0 ? String(args[iCodigo + 1] ?? "").toUpperCase() : ""

// Mesmo formato que o banco e o site aceitam: CT- e 4 letras ou numeros.
if (codigo && !/^CT-[A-Z0-9]{4}$/.test(codigo)) sair(`codigo invalido: "${codigo}". Use o formato CT-AB12.`)
if (trocarToken && !codigo) sair("para trocar o token, diga qual pulseira: --codigo CT-AB12")
if (!codigo) {
  // Sem letras e numeros que se confundem (0 e O, 1 e I), porque o codigo vai impresso na pulseira.
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  codigo = "CT-" + Array.from({ length: 4 }, () => letras[randomInt(letras.length)]).join("")
}

// Seguranca: so continua se o git estiver ignorando o segredos.h.
try {
  execFileSync("git", ["check-ignore", "-q", "include/segredos.h"], { cwd: pastaFirmware, stdio: "ignore" })
} catch (falha) {
  if (falha.code === "ENOENT") console.warn("Aviso: git nao encontrado, nao deu para conferir o .gitignore.")
  else sair("o git NAO esta ignorando include/segredos.h. Confira o .gitignore antes de gerar um token.")
}

let texto = existsSync(segredos) ? readFileSync(segredos, "utf8") : readFileSync(modelo, "utf8")
const jaTemToken = /^#define\s+DEVICE_TOKEN\s+"(?!troque-pelo-token-gerado")[^"]+"/m.test(texto)
if (existsSync(segredos) && jaTemToken && !trocarToken) {
  sair(
    "include/segredos.h ja tem um token. Se ele ja esta cadastrado no Supabase, nao gere outro.\n" +
      "Para trocar o token de uma pulseira ja cadastrada: --codigo CT-XXXX --trocar-token",
  )
}

const token = randomBytes(32).toString("base64url")
const hash = createHash("sha256").update(token, "utf8").digest("hex")

const linha = `#define DEVICE_TOKEN "${token}"  // pulseira ${codigo}`
texto = /^#define\s+DEVICE_TOKEN\s+.*$/m.test(texto)
  ? texto.replace(/^#define\s+DEVICE_TOKEN\s+.*$/m, linha)
  : texto.trimEnd() + "\n" + linha + "\n"
if (!existsSync(segredos)) {
  texto = texto.replace(/^\/\/ Modelo do include\/segredos\.h\..*$/m, "// Segredos desta pulseira. NAO vai para o git (esta no .gitignore).")
}
writeFileSync(segredos, texto, "utf8")

const sql = trocarToken
  ? `update pulseiras set token_hash = '${hash}' where codigo = '${codigo}';`
  : `insert into pulseiras (codigo, token_hash) values ('${codigo}', '${hash}');`

console.log(`
Pulseira: ${codigo}
Token gravado em include/segredos.h (ele nao aparece aqui de proposito).

1. Abra include/segredos.h e troque o nome e a senha do Wi-Fi, se ainda nao trocou.
2. No Supabase, SQL Editor, rode:

${sql}

3. Grave a pulseira:  pio run -e real -t upload
4. No site, ligue a pulseira pelo codigo ${codigo}.
`)
