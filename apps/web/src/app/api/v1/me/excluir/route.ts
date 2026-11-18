import { z } from "zod"
import { lerCorpo } from "@/lib/conta"
import { excluirConta } from "@/lib/familia"
import { erro, quemChama, responder } from "@/lib/rota-v1"
import { COOKIE_SESSAO, opcoesDoCookie } from "@/lib/sessao-servidor"

/**
 * POST /v1/me/excluir: a própria conta pede para ser excluída, escrevendo
 * "Excluir minha conta". A frase é conferida aqui, no servidor.
 *
 * A conta sai de todas as famílias (e encerra as que ficariam sem ninguém) e
 * tem 30 dias para ser recuperada ao entrar de novo com o e-mail e a senha.
 * Depois disso, a tarefa da migração 0007 apaga o login de vez.
 *
 * Dando certo, o cookie da sessão cai na mesma resposta: a conta excluída já
 * não está dentro do app.
 */

export const dynamic = "force-dynamic"

export async function POST(requisicao: Request) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa

  const corpo = await lerCorpo(requisicao, z.object({ confirmacao: z.string().max(200) }))
  if (!corpo) return erro(422, "A frase de confirmação não confere.", "confirmacao_errada")

  const resposta = await responder(() => excluirConta(chamada.sessao.id, corpo.confirmacao))
  if (resposta.ok) resposta.cookies.set(COOKIE_SESSAO, "", opcoesDoCookie(0))
  return resposta
}
