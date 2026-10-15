import { recusarPedido } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/** DELETE /v1/pessoas/{pessoaId}/pedidos/{usuarioId}: recusar. Quem pediu pode pedir de novo. */

export const dynamic = "force-dynamic"

export async function DELETE(
  _requisicao: Request,
  { params }: Contexto<{ pessoaId: string; usuarioId: string }>
) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId, usuarioId } = await params
  return responder(() => recusarPedido(chamada.sessao.id, pessoaId, usuarioId))
}
