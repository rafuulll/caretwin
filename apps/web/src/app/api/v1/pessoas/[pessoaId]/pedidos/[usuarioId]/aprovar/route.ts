import { aprovarPedido } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/** POST /v1/pessoas/{pessoaId}/pedidos/{usuarioId}/aprovar: o pedido vira membro. */

export const dynamic = "force-dynamic"

export async function POST(
  _requisicao: Request,
  { params }: Contexto<{ pessoaId: string; usuarioId: string }>
) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId, usuarioId } = await params
  return responder(() => aprovarPedido(chamada.sessao.id, pessoaId, usuarioId))
}
