// Testes do cartão 8.3. Rodam com `npm test` (Node 22.18 ou mais novo, que lê TypeScript sozinho).
import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { test } from "node:test"

process.env.AUTH_SECRET = "segredo-so-do-teste-com-mais-de-32-caracteres"
const { resumoDaFalha } = await import("../src/lib/registro.ts")
const { lerCookieDeSessao } = await import("../src/lib/sessao-servidor.ts")

test("o log de um erro do Postgres não leva os valores da linha", () => {
  // O mesmo formato do erro que o postgres.js entrega numa regra violada.
  const falha = Object.assign(new Error('new row for relation "dias" violates check constraint "dias_passos_check"'), {
    severity: "ERROR",
    code: "23514",
    detail: "Failing row contains (5f1c, 2026-10-21, 70000, 666).",
    table_name: "dias",
    constraint_name: "dias_passos_check",
  })
  const linha = JSON.stringify(resumoDaFalha(falha))
  assert.equal(linha, '{"tipo":"postgres","codigo":"23514","tabela":"dias","regra":"dias_passos_check"}')
  assert.ok(!linha.includes("70000") && !linha.includes("2026-10-21"))
})

test("a sessão vale 30 dias a partir da entrada, contados no servidor", () => {
  const cookie = (entrouEm) => {
    const corpo = Buffer.from(JSON.stringify({ nome: "Ana", email: "ana@teste.com", entrouEm })).toString("base64url")
    return `${corpo}.${createHmac("sha256", process.env.AUTH_SECRET).update(corpo).digest("base64url")}`
  }
  const dias = (n) => new Date(Date.now() - n * 86_400_000).toISOString()
  assert.ok(lerCookieDeSessao(cookie(dias(0))))
  assert.ok(lerCookieDeSessao(cookie(dias(29))))
  assert.equal(lerCookieDeSessao(cookie(dias(31))), null)
  assert.equal(lerCookieDeSessao(cookie(dias(-1))), null)
  assert.equal(lerCookieDeSessao(cookie(undefined)), null)
})
