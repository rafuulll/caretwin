import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import type postgres from "postgres"
import type { z } from "zod"
import { conexao } from "./banco"
import { lerCorpo } from "./conta"
import { erro } from "./rota-v1"

/**
 * O que as rotas de `src/app/api/v1/device` fazem igual: descobrir qual
 * pulseira está falando pelo token dela e devolver `{ accepted, rejected }`,
 * o formato que o firmware usa para tirar os dados da fila.
 *
 * A pulseira não tem conta nem cookie. Ela manda `Authorization: Device
 * <token>`, e o banco guarda só o sha256 do token (`pulseiras.token_hash`).
 * Quem lê o banco não consegue se passar por uma pulseira. O token em si é
 * gravado no firmware (`include/config.h`) quando a pulseira é montada.
 */

export type Pulseira = {
  id: string
  /** null enquanto a família não digitou o código da pulseira. */
  pessoaId: string | null
  /** A pessoa foi encerrada e está nos 30 dias de recuperação. */
  encerrada: boolean
}

export type AceitosRecusados = { accepted: string[]; rejected: string[] }

type Sql = postgres.TransactionSql

// Token sem espaço e com tamanho limitado: ninguém faz o servidor calcular o
// hash de um cabeçalho de um megabyte.
const CABECALHO = /^Device\s+(\S{1,256})$/

export function hashDoToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

function tokenDaRequisicao(requisicao: Request) {
  return requisicao.headers.get("authorization")?.trim().match(CABECALHO)?.[1] ?? null
}

/**
 * Recebe um envio da pulseira: confere o token, depois o corpo, e roda a
 * gravação numa transação com a linha da pulseira travada.
 *
 * A trava importa: se a família digitar o código no mesmo instante em que a
 * pulseira manda um dia, o dia ou já nasce com a pessoa, ou nasce sem ela e é
 * ligado pelo `digitarCodigo` logo depois. Nunca fica perdido no meio.
 */
export async function receberDaPulseira<S extends z.ZodType>(
  requisicao: Request,
  esquema: S,
  gravar: (tx: Sql, pulseira: Pulseira, corpo: z.infer<S>) => Promise<AceitosRecusados>
) {
  const sql = conexao()
  if (!sql) return erro(503, "O banco não está ligado neste ambiente.")

  const token = tokenDaRequisicao(requisicao)
  if (!token) return erro(401, "Falta o token da pulseira.", "sem_token")

  try {
    const hash = hashDoToken(token)
    // O token vem antes do corpo: quem não é pulseira não descobre nada sobre
    // o formato que a API espera.
    const [existe] = await sql`select 1 from pulseiras where token_hash = ${hash}`
    if (!existe) return erro(401, "Token de pulseira inválido.", "token_invalido")

    const corpo = await lerCorpo(requisicao, esquema)
    if (corpo === null) return erro(422, "O envio está fora do formato do contrato.", "invalido")

    const resposta = await sql.begin(async (tx) => {
      const [linha] = await tx<{ id: string; pessoa_id: string | null; encerrado_em: Date | null }[]>`
        select pu.id, pu.pessoa_id, p.encerrado_em
        from pulseiras pu
        left join pessoas p on p.id = pu.pessoa_id
        where pu.token_hash = ${hash}
        for update of pu
      `
      if (!linha) return null
      return gravar(tx, { id: linha.id, pessoaId: linha.pessoa_id, encerrada: linha.encerrado_em !== null }, corpo)
    })
    if (!resposta) return erro(401, "Token de pulseira inválido.", "token_invalido")
    return NextResponse.json(resposta)
  } catch (falha) {
    console.error("[api/v1/device]", falha)
    return erro(500, "Não deu certo agora. Tente de novo em alguns minutos.")
  }
}

/** A pulseira deu sinal de vida: guarda a hora e, se veio, a bateria. */
export async function marcarSincronizacao(tx: Sql, pulseira: Pulseira, bateria?: number) {
  if (bateria === undefined) {
    await tx`update pulseiras set ultima_sincronizacao = now() where id = ${pulseira.id}`
  } else {
    await tx`update pulseiras set ultima_sincronizacao = now(), bateria = ${bateria} where id = ${pulseira.id}`
  }
}
