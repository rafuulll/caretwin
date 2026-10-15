import { z } from "zod"
import { lerCorpo } from "@/lib/conta"
import { encerrar } from "@/lib/familia"
import { erro, quemChama, responder, type Contexto } from "@/lib/rota-v1"

/**
 * POST /v1/pessoas/{pessoaId}/encerrar: o último membro encerra o
 * acompanhamento escrevendo "Encerrar o acompanhamento de <nome>". A frase é
 * conferida aqui, no servidor: a da tela é só ajuda, e não dá para pular.
 */

export const dynamic = "force-dynamic"

export async function POST(requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa

  const corpo = await lerCorpo(requisicao, z.object({ confirmacao: z.string().max(200) }))
  if (!corpo) return erro(422, "A frase de confirmação não confere.", "confirmacao_errada")

  const { pessoaId } = await params
  return responder(() => encerrar(chamada.sessao.id, pessoaId, corpo.confirmacao))
}
