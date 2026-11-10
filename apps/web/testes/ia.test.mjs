// Testes dos cartões 6.2 (verificador) e 6.3 (explicação). Rodam com `npm test`.
// O código é TypeScript com imports sem extensão, que o Node puro não resolve:
// o esbuild (já instalado pelo Storybook) junta tudo num arquivo só antes do teste.
import assert from "node:assert/strict"
import { test } from "node:test"
import { mkdirSync, writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { build } from "esbuild"

async function carregar(entrada) {
  const { outputFiles } = await build({
    entryPoints: [entrada],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  })
  const codigo = Buffer.from(outputFiles[0].text).toString("base64")
  return import(`data:text/javascript;base64,${codigo}`)
}

const { verificarTexto, verificarResumo } = await carregar("src/lib/ia/verificador.ts")
const { explicarAlerta, pedidoDoAlerta, resumirDia, pedidoDoResumo } = await carregar("src/lib/ia/explicar.ts")
const { configDoOllama } = await carregar("src/lib/ia/ollama.ts")
const { textosDoAlerta, RESUMOS_DO_DIA } = await carregar("src/lib/respostas-ia.ts")

const PASSOS_ABAIXO = { nome: "Ana", metrica: "passos", direcao: "abaixo", valor: 3200, normal: 5400, desvio: 41 }
const PASSOS_ACIMA = { nome: "Ana", metrica: "passos", direcao: "acima", valor: 8200, normal: 6000, desvio: 37 }
const SONO_ABAIXO = { nome: "Ana", metrica: "sono", direcao: "abaixo", valor: 330, normal: 420, desvio: 21 }
const BPM_ACIMA = { nome: "Ana", metrica: "batimentos", direcao: "acima", valor: 92, normal: 74, desvio: 24 }
const TODOS = [PASSOS_ABAIXO, PASSOS_ACIMA, SONO_ABAIXO, BPM_ACIMA]

const BOM_ABAIXO =
  "Ana andou menos nos últimos dias: foram 3.200 passos no dia mais recente, e o normal dela fica perto de 5.400. Vale observar os próximos dias com calma."

function bloqueia(texto, fatos, motivo) {
  const v = verificarTexto(texto, fatos)
  assert.equal(v.ok, false, `deveria bloquear: ${texto}`)
  assert.ok(v.motivos.includes(motivo), `motivos ${v.motivos} sem ${motivo}`)
}

test("um texto correto passa", () => {
  assert.deepEqual(verificarTexto(BOM_ABAIXO, PASSOS_ABAIXO), { ok: true })
})

test("os textos de regra, que são a reserva, passam no próprio verificador", () => {
  for (const fatos of TODOS) {
    for (const escrever of textosDoAlerta(fatos.metrica, fatos.direcao)) {
      const texto = escrever(fatos)
      const v = verificarTexto(texto, fatos)
      assert.deepEqual(v, { ok: true }, `reserva reprovada (${fatos.metrica} ${fatos.direcao}): ${texto}`)
    }
  }
})

test("texto que contradiz o resultado do baseline é bloqueado", () => {
  bloqueia(
    "Ana ficou acima do normal nos passos: foram 3.200 passos, quando o normal dela fica perto de 5.400.",
    PASSOS_ABAIXO,
    "contradiz_a_direcao"
  )
  bloqueia(
    "Ana teve menos passos nos últimos dias: foram 8.200 passos, e o normal dela fica perto de 6.000.",
    PASSOS_ACIMA,
    "contradiz_a_direcao"
  )
  bloqueia(
    "Ótima notícia, Ana dormiu menos que o normal: cerca de 5 horas e 30 minutos contra 7 horas de costume.",
    SONO_ABAIXO,
    "contradiz_a_direcao"
  )
})

test("número que não veio da regra é bloqueado", () => {
  bloqueia(
    "Ana andou menos nos últimos dias: foram 1.800 passos no dia mais recente, e o normal dela fica perto de 5.400.",
    PASSOS_ABAIXO,
    "numero_inventado"
  )
  bloqueia(
    "Ana andou menos nos últimos dias: cerca de 63% abaixo do normal, com 3.200 passos no dia mais recente.",
    PASSOS_ABAIXO,
    "numero_inventado"
  )
})

test("arredondar um número da regra não é inventar", () => {
  const v = verificarTexto(
    "Ana andou menos nos últimos dias: perto de 3.190 passos no dia mais recente, e o de costume é perto de 5.400.",
    PASSOS_ABAIXO
  )
  assert.deepEqual(v, { ok: true })
})

test("diagnóstico, remédio e médico são bloqueados, mas 'não é diagnóstico' pode", () => {
  bloqueia(
    "Ana andou menos: 3.200 passos contra 5.400 de costume. Isso pode indicar depressão ou uma doença.",
    PASSOS_ABAIXO,
    "diagnostico"
  )
  bloqueia(
    "Ana andou menos: 3.200 passos contra 5.400 de costume. Fale com o médico sobre o remédio dela.",
    PASSOS_ABAIXO,
    "diagnostico"
  )
  const ok = verificarTexto(
    "Ana andou menos: 3.200 passos contra 5.400 de costume. Isso não é diagnóstico, é só o dia comparado com o jeito de sempre dela.",
    PASSOS_ABAIXO
  )
  assert.deepEqual(ok, { ok: true })
})

test("mandar a pessoa fazer algo é bloqueado", () => {
  bloqueia(
    "Ana andou menos: 3.200 passos contra 5.400 de costume. Você precisa levar ela ao pronto-socorro agora.",
    PASSOS_ABAIXO,
    "ordem_ao_usuario"
  )
  bloqueia(
    "Ana andou menos: 3.200 passos contra 5.400 de costume. Procure ajuda e ligue para alguém hoje.",
    PASSOS_ABAIXO,
    "ordem_ao_usuario"
  )
})

test("tom de alarme é bloqueado", () => {
  bloqueia(
    "Atenção urgente: Ana teve uma queda grave nos passos, 3.200 contra 5.400 de costume!!",
    PASSOS_ABAIXO,
    "tom_de_alarme"
  )
})

test("formato fora do padrão é bloqueado", () => {
  bloqueia("Ana andou menos.", PASSOS_ABAIXO, "vazio_ou_curto")
  bloqueia(
    "- Ana andou menos nos últimos dias\n- foram 3.200 passos, o normal é 5.400, de costume",
    PASSOS_ABAIXO,
    "formato_estranho"
  )
  bloqueia(
    "Como uma IA, posso dizer que Ana andou menos: 3.200 passos no dia mais recente, contra 5.400 de costume.",
    PASSOS_ABAIXO,
    "fala_de_modelo"
  )
  bloqueia("x".repeat(700), PASSOS_ABAIXO, "longo_demais")
})

test("sono é conferido em horas e minutos", () => {
  const bom = verificarTexto(
    "A noite de Ana teve cerca de 5 horas e 30 minutos de sono, menos que as 7 horas de costume, uns 21% abaixo do normal.",
    SONO_ABAIXO
  )
  assert.deepEqual(bom, { ok: true })
  bloqueia(
    "A noite de Ana teve cerca de 4 horas de sono, menos que as 7 horas de costume, uns 21% abaixo do normal.",
    SONO_ABAIXO,
    "numero_inventado"
  )
})

test("o pedido ao modelo leva só os fatos da regra", () => {
  const pedido = pedidoDoAlerta(PASSOS_ABAIXO)
  assert.match(pedido, /Ana/)
  assert.match(pedido, /abaixo/)
  assert.match(pedido, /3\.200/)
  assert.match(pedido, /41%/)
})

const CONFIG = { url: "http://modelo.local", modelo: "teste", tempoMs: 1000 }

test("sem modelo configurado, vale o texto de regra", async () => {
  const r = await explicarAlerta(PASSOS_ABAIXO, "alerta-1", { config: null })
  assert.equal(r.origem, "regra")
  assert.equal(r.motivo, "sem_modelo")
  assert.deepEqual(verificarTexto(r.texto, PASSOS_ABAIXO), { ok: true })
})

test("modelo fora do ar: texto de regra, sem erro para quem chama", async () => {
  const r = await explicarAlerta(PASSOS_ABAIXO, "alerta-1", {
    config: CONFIG,
    pedir: async () => {
      throw new Error("ECONNREFUSED")
    },
  })
  assert.equal(r.origem, "regra")
  assert.equal(r.motivo, "modelo_falhou")
})

test("saída incorreta gerada de propósito é bloqueada e cai no texto de regra", async () => {
  let chamadas = 0
  const r = await explicarAlerta(PASSOS_ABAIXO, "alerta-1", {
    config: CONFIG,
    pedir: async () => {
      chamadas++
      return "Ana ficou acima do normal, com 9.999 passos. Procure um médico, pode ser uma doença grave!"
    },
  })
  assert.equal(chamadas, 2)
  assert.equal(r.origem, "regra")
  assert.equal(r.motivo, "reprovado")
  assert.ok(r.bloqueios.includes("diagnostico") && r.bloqueios.includes("numero_inventado"))
  assert.deepEqual(verificarTexto(r.texto, PASSOS_ABAIXO), { ok: true })
})

test("a segunda tentativa pode salvar a resposta da IA", async () => {
  const respostas = ["Ana andou muito mais, 9.999 passos.", BOM_ABAIXO]
  const r = await explicarAlerta(PASSOS_ABAIXO, "alerta-1", { config: CONFIG, pedir: async () => respostas.shift() })
  assert.equal(r.origem, "ia")
  assert.equal(r.texto, BOM_ABAIXO)
  assert.equal(r.modelo, "teste")
})

test("o mesmo alerta ganha sempre o mesmo texto de reserva", async () => {
  const a = await explicarAlerta(SONO_ABAIXO, "alerta-2", { config: null })
  const b = await explicarAlerta(SONO_ABAIXO, "alerta-2", { config: null })
  assert.equal(a.texto, b.texto)
})

test("a configuração do Ollama vem do ambiente e é opcional", () => {
  assert.equal(configDoOllama({}), null)
  assert.equal(configDoOllama({ OLLAMA_URL: "  " }), null)
  assert.deepEqual(configDoOllama({ OLLAMA_URL: "http://192.168.0.10:11434/" }), {
    url: "http://192.168.0.10:11434",
    modelo: "llama3.2:3b",
    tempoMs: 8000,
  })
  assert.equal(configDoOllama({ OLLAMA_URL: "http://x", OLLAMA_MODELO: "qwen2.5:7b", OLLAMA_TEMPO_MS: "15000" }).tempoMs, 15000)
})

// O resumo do dia (cartão 6.3 estendido): mesmo fluxo, com os números do dia.
const DIA = {
  nome: "Seu Jorge",
  passos: 3914,
  normalDePassos: 4100,
  situacaoPassos: "dentro",
  sono: 268,
  situacaoSono: "abaixo",
  ultimoBpm: 63,
  alertasNovos: 1,
}
const BOM_RESUMO =
  "Hoje Seu Jorge está com 3.914 passos até agora, dentro do que costuma ter neste horário. A noite teve cerca de 4 horas e 28 minutos de sono, menos do que costuma. Tem um alerta novo logo abaixo."

test("os resumos de reserva passam no verificador do resumo", () => {
  const variacoes = [
    DIA,
    { ...DIA, situacaoPassos: "abaixo", situacaoSono: "dentro", alertasNovos: 0 },
    { ...DIA, passos: null, normalDePassos: null, sono: null, situacaoSono: "aprendendo", ultimoBpm: null, situacaoPassos: "aprendendo" },
  ]
  for (const fatos of variacoes) {
    for (const escrever of RESUMOS_DO_DIA) {
      const texto = escrever(fatos)
      assert.deepEqual(verificarResumo(texto, fatos), { ok: true }, `reserva reprovada: ${texto}`)
    }
  }
})

test("o resumo da IA é conferido contra os números do dia", () => {
  assert.deepEqual(verificarResumo(BOM_RESUMO, DIA), { ok: true })
  const bloqueia = (texto, motivo) => {
    const v = verificarResumo(texto, DIA)
    assert.equal(v.ok, false, `deveria bloquear: ${texto}`)
    assert.ok(v.motivos.includes(motivo), `motivos ${v.motivos} sem ${motivo}`)
  }
  bloqueia(BOM_RESUMO.replace("3.914", "9.999"), "numero_inventado")
  bloqueia("Hoje Seu Jorge andou menos do que de costume, com 3.914 passos até agora. A noite teve 4 horas e 28 minutos.", "contradiz_a_direcao")
  bloqueia("Hoje Seu Jorge dormiu mais do que costuma, cerca de 4 horas e 28 minutos de sono, e fez 3.914 passos.", "contradiz_a_direcao")
  bloqueia(BOM_RESUMO + " Vale consultar o médico por causa disso.", "diagnostico")
})

test("o resumo do dia cai no texto de regra sem modelo, e usa a IA quando o texto passa", async () => {
  const sem = await resumirDia(DIA, "pessoa-jorge:2026-11-10:0", { config: null })
  assert.equal(sem.origem, "regra")
  assert.deepEqual(verificarResumo(sem.texto, DIA), { ok: true })
  const com = await resumirDia(DIA, "x", { config: CONFIG, pedir: async () => BOM_RESUMO })
  assert.equal(com.origem, "ia")
  assert.equal(com.texto, BOM_RESUMO)
  const ruim = await resumirDia(DIA, "x", { config: CONFIG, pedir: async () => "Hoje foram 12.345 passos e o médico deve ser chamado." })
  assert.equal(ruim.origem, "regra")
  assert.equal(ruim.motivo, "reprovado")
})

test("o pedido do resumo leva só os fatos do dia", () => {
  const pedido = pedidoDoResumo(DIA)
  assert.match(pedido, /3\.914/)
  assert.match(pedido, /4 horas e 28 minutos/)
  assert.match(pedido, /Alertas novos: 1/)
  assert.doesNotMatch(pedido, /diagn/i)
})

// A rota da demonstração (modo sem conta). Importa o Next, então o pacote não
// pode ir para dentro do bundle: o arquivo é gravado em node_modules/.cache e
// importado de lá, onde o Node acha as dependências.
async function carregarRota(entrada, nome = "rota-demo") {
  const { outputFiles } = await build({
    entryPoints: [entrada],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    packages: "external",
    logLevel: "silent",
    plugins: [
      {
        // O Node puro não resolve `next/server` sem a extensão; o Next resolve sozinho.
        name: "next-com-extensao",
        setup(b) {
          b.onResolve({ filter: /^next\/[a-z-]+$/ }, (a) => ({ path: `${a.path}.js`, external: true }))
        },
      },
    ],
  })
  mkdirSync("node_modules/.cache/caretwin-testes", { recursive: true })
  const arquivo = `node_modules/.cache/caretwin-testes/${nome}.mjs`
  writeFileSync(arquivo, outputFiles[0].text)
  return import(`${pathToFileURL(arquivo).href}?t=${Date.now()}`)
}

const { POST: explicarDemo } = await carregarRota("src/app/api/v1/ia/explicar/route.ts")
const { POST: resumoDemo } = await carregarRota("src/app/api/v1/ia/resumo/route.ts", "rota-resumo")

function pedido(corpo, tipo = "application/json") {
  return new Request("http://localhost/api/v1/ia/explicar", {
    method: "POST",
    headers: { "Content-Type": tipo },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  })
}

test("a rota da demonstração devolve o texto de regra quando não há modelo", async () => {
  delete process.env.OLLAMA_URL
  const r = await explicarDemo(pedido({ ...PASSOS_ABAIXO, chave: "alerta-demo-1" }))
  assert.equal(r.status, 200)
  const corpo = await r.json()
  assert.equal(corpo.alertaId, "alerta-demo-1")
  assert.equal(corpo.origem, "regra")
  assert.deepEqual(verificarTexto(corpo.texto, PASSOS_ABAIXO), { ok: true })
})

test("a rota da demonstração recusa pedido fora do formato", async () => {
  const ruins = [
    pedido("isso nao e json"),
    pedido({ ...PASSOS_ABAIXO, chave: "x", metrica: "pressao" }),
    pedido({ ...PASSOS_ABAIXO, chave: "x", valor: -5 }),
    pedido({ ...PASSOS_ABAIXO, nome: "", chave: "x" }),
    pedido({ ...PASSOS_ABAIXO, chave: "x" }, "text/plain"),
  ]
  for (const req of ruins) assert.equal((await explicarDemo(req)).status, 400)
})

test("a rota do resumo devolve o texto de regra sem modelo e recusa pedido ruim", async () => {
  delete process.env.OLLAMA_URL
  const bom = await resumoDemo(pedido({ ...DIA, chave: "pessoa-jorge:2026-11-10:0" }))
  assert.equal(bom.status, 200)
  const corpo = await bom.json()
  assert.equal(corpo.origem, "regra")
  assert.deepEqual(verificarResumo(corpo.texto, DIA), { ok: true })
  for (const req of [
    pedido("isso nao e json"),
    pedido({ ...DIA, chave: "x", situacaoSono: "muito" }),
    pedido({ ...DIA, chave: "x", alertasNovos: -1 }),
    pedido({ ...DIA, chave: "x" }, "text/plain"),
  ]) {
    assert.equal((await resumoDemo(req)).status, 400)
  }
})
