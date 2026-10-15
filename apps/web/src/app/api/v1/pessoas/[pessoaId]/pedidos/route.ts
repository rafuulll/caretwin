import { listarPedidos } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/** GET /v1/pessoas/{pessoaId}/pedidos: só quem administra vê os pedidos de entrada. */

export const dynamic = "force-dynamic"

export async function GET(_requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId } = await params
  return responder(() => listarPedidos(chamada.sessao.id, pessoaId))
}
