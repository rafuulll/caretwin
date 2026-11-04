/**
 * O que vai para o log do servidor quando uma rota falha (cartão 8.3).
 *
 * `console.error(falha)` imprime o erro inteiro, e o erro do Postgres carrega o
 * campo `detail`. Numa regra violada, ele traz a linha toda: "Failing row
 * contains (..., 2026-10-21, 70000, ...)", com a data e os passos de alguém. Os
 * logs da Vercel são lidos por quem tem acesso ao projeto, e dado de saúde não
 * pode ir parar ali.
 *
 * Por isso o log guarda só o que ajuda a achar o problema sem contar nada de
 * ninguém: o tipo do erro, o código e, no Postgres, a tabela e o nome da regra.
 * A mensagem do Postgres fica de fora porque algumas repetem o valor recebido
 * ("invalid input syntax for type uuid: ..."); o código diz o mesmo sem o valor.
 */

type ErroDoPostgres = {
  severity?: unknown
  code?: unknown
  table_name?: unknown
  constraint_name?: unknown
  routine?: unknown
}

const LIMITE_DA_MENSAGEM = 200

function texto(valor: unknown): string | undefined {
  return typeof valor === "string" && valor ? valor : undefined
}

/** O resumo que vai para o log. Separado para os testes conferirem o que sai. */
export function resumoDaFalha(falha: unknown): Record<string, string> {
  if (typeof falha !== "object" || falha === null) return { tipo: typeof falha }

  const pg = falha as ErroDoPostgres
  // Só o erro que veio do servidor do Postgres tem `severity`.
  if (texto(pg.severity)) {
    const resumo: Record<string, string> = { tipo: "postgres" }
    const campos: Array<[string, unknown]> = [
      ["codigo", pg.code],
      ["tabela", pg.table_name],
      ["regra", pg.constraint_name],
      ["rotina", pg.routine],
    ]
    for (const [nome, valor] of campos) {
      const lido = texto(valor)
      if (lido) resumo[nome] = lido
    }
    return resumo
  }

  // Erros do Node e da rede: o nome, o código (ECONNREFUSED, por exemplo) e a
  // mensagem cortada, que nesses casos fala da conexão e não de pessoas.
  const erro = falha as { name?: unknown; code?: unknown; message?: unknown }
  const resumo: Record<string, string> = { tipo: texto(erro.name) ?? "Error" }
  const codigo = texto(erro.code)
  if (codigo) resumo.codigo = codigo
  const mensagem = texto(erro.message)
  if (mensagem) resumo.mensagem = mensagem.slice(0, LIMITE_DA_MENSAGEM)
  return resumo
}

/** Registra a falha de uma rota sem levar dado de ninguém para o log. */
export function registrarFalha(onde: string, falha: unknown) {
  console.error(`[${onde}]`, JSON.stringify(resumoDaFalha(falha)))
}
