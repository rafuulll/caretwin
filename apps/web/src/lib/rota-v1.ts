import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { bancoConfigurado } from "./banco"
import { ehUuid, type Resultado } from "./familia"
import { COOKIE_SESSAO, lerCookieDeSessao } from "./sessao-servidor"
import type { Sessao } from "./types"

/**
 * O que toda rota de `src/app/api/v1` faz igual: descobrir quem chama,
 * transformar o resultado de `familia.ts` em resposta HTTP e nunca deixar um
 * erro do banco vazar para quem chamou.
 */

/** Contexto das rotas com parâmetros. No Next 16, `params` chega como promessa. */
export type Contexto<P extends Record<string, string>> = { params: Promise<P> }

export function erro(status: number, texto: string, codigo?: string, quando?: string) {
  return NextResponse.json(
    { erro: texto, ...(codigo ? { codigo } : {}), ...(quando ? { quando } : {}) },
    { status }
  )
}

type Chamada = { sessao: Sessao & { id: string } } | { recusa: NextResponse }

/**
 * Quem está chamando. As rotas do site exigem a sessão assinada E o id da conta
 * no Supabase Auth: o login com Google feito à mão não tem conta no banco, e
 * sem conta não existe vínculo para conferir.
 */
export async function quemChama(): Promise<Chamada> {
  if (!bancoConfigurado()) return { recusa: erro(503, "O banco não está ligado neste ambiente.") }
  const pote = await cookies()
  const sessao = lerCookieDeSessao(pote.get(COOKIE_SESSAO)?.value)
  if (!sessao) return { recusa: erro(401, "Entre na sua conta para continuar.") }
  if (!sessao.id || !ehUuid(sessao.id)) {
    return { recusa: erro(403, "Esta rota precisa de uma conta com e-mail e senha.", "sem_conta") }
  }
  return { sessao: { ...sessao, id: sessao.id } }
}

/**
 * Roda a regra e responde. Qualquer erro inesperado vira 500 com uma frase
 * genérica: o detalhe do banco ajuda quem está sondando, não quem está usando.
 */
export async function responder<T>(executar: () => Promise<Resultado<T>>) {
  try {
    const resultado = await executar()
    if (!resultado.ok) return erro(resultado.status, resultado.erro, resultado.codigo, resultado.quando)
    if (resultado.status === 204) return new NextResponse(null, { status: 204 })
    return NextResponse.json(resultado.corpo, { status: resultado.status })
  } catch (falha) {
    console.error("[api/v1]", falha)
    return erro(500, "Não deu certo agora. Tente de novo em alguns minutos.")
  }
}
