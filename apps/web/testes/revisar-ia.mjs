// Gera a amostra de explicações para a revisão de qualidade (cartão 6.5).
// Rode com o Ollama ligado: `npm run revisar-ia`. O relatório sai em docs/revisao-ia.md,
// com uma linha por explicação para quem revisa marcar. Sem OLLAMA_URL, só o texto de regra aparece.
import { writeFileSync } from "node:fs"
import { build } from "esbuild"

// A primeira chamada carrega o modelo na memória e pode levar bem mais que os 8 segundos do dia a dia.
process.env.OLLAMA_TEMPO_MS ||= "90000"

const { outputFiles } = await build({
  entryPoints: ["src/lib/ia/explicar.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  logLevel: "silent",
})
const { explicarAlerta } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`)
const { configDoOllama } = await import(
  `data:text/javascript;base64,${Buffer.from(
    (await build({ entryPoints: ["src/lib/ia/ollama.ts"], bundle: true, write: false, format: "esm", platform: "node" })).outputFiles[0].text
  ).toString("base64")}`
)

const NOMES = ["Dona Lúcia", "Seu Antônio", "Maria", "Seu João"]
const NORMAIS = {
  passos: [4200, 5400, 6100, 7300],
  sono: [400, 420, 440, 390],
  batimentos: [68, 72, 76, 80],
}
const FOLGAS = [0.25, 0.3, 0.38, 0.45]

const casos = []
for (const metrica of ["passos", "sono", "batimentos"]) {
  for (const direcao of ["abaixo", "acima"]) {
    for (let i = 0; i < 4; i++) {
      const normal = NORMAIS[metrica][i]
      const valor = Math.round(normal * (direcao === "abaixo" ? 1 - FOLGAS[i] : 1 + FOLGAS[i]))
      casos.push({
        nome: NOMES[i],
        metrica,
        direcao,
        valor,
        normal,
        desvio: Math.round((Math.abs(valor - normal) / normal) * 100),
      })
    }
  }
}

const config = configDoOllama()

// Antes de gastar 24 chamadas, descobre por que o modelo não responde, se for o caso.
if (config) {
  try {
    const resposta = await fetch(`${config.url}/api/tags`, { signal: AbortSignal.timeout(5000) })
    const { models = [] } = await resposta.json()
    const nomes = models.map((m) => m.name)
    if (!nomes.some((nome) => nome === config.modelo || nome.startsWith(`${config.modelo}:`))) {
      console.log(`O Ollama está de pé, mas o modelo "${config.modelo}" não está instalado.`)
      console.log(`Rode: ollama pull ${config.modelo}`)
      console.log(`Instalados agora: ${nomes.length ? nomes.join(", ") : "nenhum"}`)
      process.exit(1)
    }
    console.log(`Ollama ok em ${config.url}, modelo ${config.modelo}. A primeira resposta demora mais.`)
  } catch (falha) {
    console.log(`Não consegui falar com o Ollama em ${config.url} (${falha?.cause?.code ?? falha?.name ?? "erro"}).`)
    console.log("Confira se o Ollama está aberto (ícone perto do relógio) e se o OLLAMA_URL do .env.local está certo.")
    console.log("O endereço normal é http://localhost:11434, sem nada depois.")
    process.exit(1)
  }
} else {
  console.log("OLLAMA_URL está vazio no .env.local: só vai aparecer o texto de regra.")
}
const linhas = []
const contagem = { ia: 0, regra: 0 }
const bloqueios = {}
let n = 0
for (const fatos of casos) {
  n++
  const r = await explicarAlerta(fatos, `revisao-${n}`)
  contagem[r.origem]++
  for (const b of r.bloqueios ?? []) bloqueios[b] = (bloqueios[b] ?? 0) + 1
  const origem = r.origem === "ia" ? `IA (${r.modelo})` : `regra (${r.motivo})`
  linhas.push(`| ${n} | ${fatos.metrica}, ${fatos.direcao} | ${origem} | ${r.texto.replace(/\|/g, "/")} | [ ] |`)
  process.stdout.write(`${n}/${casos.length} ${origem}\n`)
}

const hoje = new Date().toISOString().slice(0, 10)
const relatorio = `# Revisão de qualidade das explicações (cartão 6.5)

Gerado em ${hoje}. Modelo: ${config ? config.modelo : "nenhum (só texto de regra)"}.

Escritas pela IA e aprovadas pelo verificador: ${contagem.ia} de ${casos.length}.
Trocadas pelo texto de regra: ${contagem.regra} de ${casos.length}.
Bloqueios do verificador: ${Object.keys(bloqueios).length ? Object.entries(bloqueios).map(([k, v]) => `${k} (${v})`).join(", ") : "nenhum"}.

## Como revisar

Leia cada explicação e marque [x] quando estiver boa. Uma explicação NÃO é boa se tiver linguagem de diagnóstico, mandar a pessoa fazer algo, soar como alarme, errar para que lado o dia fugiu ou citar um número que não é do dia. Anote abaixo o que encontrar.

| # | O que mudou | Quem escreveu | Texto | Boa? |
| --- | --- | --- | --- | --- |
${linhas.join("\n")}

## Resultado da revisão

- Explicações revisadas: ____ de ${casos.length}
- Com linguagem de diagnóstico ou decisão automática: ____ (precisa ser zero)
- Problemas encontrados e o que foi mudado:
- Revisado por e em:
`
writeFileSync("docs/revisao-ia.md", relatorio)
console.log("Relatório em docs/revisao-ia.md")
