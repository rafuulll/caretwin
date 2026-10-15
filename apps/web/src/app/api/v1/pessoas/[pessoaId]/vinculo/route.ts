import { sair } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/**
 * DELETE /v1/pessoas/{pessoaId}/vinculo: sair da família, ou desistir de um
 * pedido. O último membro aprovado recebe 409 (ultimo_membro): para ele, o
 * caminho é encerrar o acompanhamento.
 */

export const dynamic = "force-dynamic"

export async function DELETE(_requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId } = await params
  return responder(() => sair(chamada.sessao.id, pessoaId))
}
