// Testes das páginas abertas (/demo e /ao-vivo) e do envio bruto da pulseira. Rodam com `npm test`.
// Mesmo jeito do ia.test.mjs: o esbuild junta o TypeScript antes de o Node ler.
import assert from "node:assert/strict"
import { test } from "node:test"
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

const { ENVIO_AO_VIVO_BRUTO, LOTE_AO_VIVO } = await carregar("src/lib/ao-vivo-esquema.ts")
const { codigosPublicos, pulseiraPedida, passouDoLimiteDeLeitura, LIMITE_DE_LEITURA } = await carregar("src/lib/publico.ts")

/** Um segundo de leitura a 50 Hz, parado: 1 g no eixo z, giroscópio quieto. */
function lote(sobrescrever = {}) {
  const imu = Array.from({ length: 50 }, (_, i) => [3, -2, 1000 + (i % 3), 1, 0, -1])
  return {
    rate_hz: 50,
    ts: "2026-11-18T14:30:00-03:00",
    steps_today: 4210,
    bpm: 72,
    imu,
    ir: Array.from({ length: 50 }, (_, i) => 120000 + i * 40),
    ...sobrescrever,
  }
}

test("um lote de um segundo no formato do contrato é aceito", () => {
  assert.equal(ENVIO_AO_VIVO_BRUTO.safeParse(lote()).success, true)
})

test("sem dedo no sensor, bpm, ir e hora podem faltar", () => {
  const semIr = lote({ bpm: null, ts: null, steps_today: null, ir: undefined })
  assert.equal("ir" in semIr && semIr.ir !== undefined, false)
  assert.equal(ENVIO_AO_VIVO_BRUTO.safeParse(semIr).success, true)
})

test("o lote recusa o que o sensor não pode medir", () => {
  const recusa = (corpo, porque) => assert.equal(ENVIO_AO_VIVO_BRUTO.safeParse(corpo).success, false, porque)
  recusa(lote({ imu: [] }), "lote vazio")
  recusa(lote({ imu: Array.from({ length: LOTE_AO_VIVO.leituras + 1 }, () => [0, 0, 1000, 0, 0, 0]), ir: undefined }), "lote grande demais")
  recusa(lote({ imu: [[0, 0, 1000, 0, 0]], ir: undefined }), "faltou um eixo")
  recusa(lote({ imu: [[0, 0, 1000.5, 0, 0, 0]], ir: undefined }), "número quebrado: o contrato manda inteiro")
  recusa(lote({ imu: [[0, 0, LOTE_AO_VIVO.aceleracaoMax + 1, 0, 0, 0]], ir: undefined }), "aceleração além do teto")
  recusa(lote({ imu: [[0, 0, 0, 0, 0, LOTE_AO_VIVO.giroscopioMax + 1]], ir: undefined }), "giroscópio além do teto")
  recusa(lote({ ir: [1, 2, 3] }), "ir com tamanho diferente do imu")
  recusa(lote({ bpm: 400 }), "batimento impossível")
  recusa(lote({ steps_today: 70000 }), "passos além do teto do contrato")
  recusa(lote({ rate_hz: 0 }), "taxa zero")
  recusa(lote({ ts: "ontem" }), "hora fora do formato")
})

test("a lista de pulseiras públicas só aceita códigos CT-XXXX, sem repetir", () => {
  assert.deepEqual(codigosPublicos({}), [])
  assert.deepEqual(codigosPublicos({ PULSEIRAS_PUBLICAS: "" }), [])
  assert.deepEqual(codigosPublicos({ PULSEIRAS_PUBLICAS: " ct-dm01 , CT-4F7K,CT-DM01, lixo, CT-12345 " }), ["CT-DM01", "CT-4F7K"])
})

test("sem a lista, a página fica desligada; com ela, só os códigos dela aparecem", () => {
  const env = { PULSEIRAS_PUBLICAS: "CT-DM01,CT-4F7K" }
  assert.equal(pulseiraPedida(null, {}), null)
  assert.equal(pulseiraPedida("CT-DM01", {}), null)
  assert.equal(pulseiraPedida(null, env), "CT-DM01", "sem pedido, a primeira da lista")
  assert.equal(pulseiraPedida("", env), "CT-DM01")
  assert.equal(pulseiraPedida("ct-4f7k", env), "CT-4F7K")
  assert.equal(pulseiraPedida("CT-9999", env), null, "um código que não está na lista é como se não existisse")
})

test("cada endereço tem um limite de pedidos por minuto", () => {
  const pedido = (endereco) => new Request("https://x.test/api/publico/ao-vivo", { headers: { "x-forwarded-for": `${endereco}, 10.0.0.1` } })
  const agora = 1_000_000
  for (let i = 0; i < LIMITE_DE_LEITURA.maximo; i++) {
    assert.equal(passouDoLimiteDeLeitura(pedido("203.0.113.7"), agora + i), false, `pedido ${i + 1} cabe`)
  }
  assert.equal(passouDoLimiteDeLeitura(pedido("203.0.113.7"), agora + 500), true, "o seguinte passa do limite")
  assert.equal(passouDoLimiteDeLeitura(pedido("203.0.113.8"), agora + 500), false, "outro endereço não é afetado")
  assert.equal(passouDoLimiteDeLeitura(pedido("203.0.113.7"), agora + LIMITE_DE_LEITURA.janelaMs + 1000), false, "passada a janela, volta")
})
