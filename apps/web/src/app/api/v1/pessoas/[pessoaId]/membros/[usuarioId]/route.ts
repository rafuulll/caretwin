import { removerMembro } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/** DELETE /v1/pessoas/{pessoaId}/membros/{usuarioId}: quem administra remove um cuidador. */

export const dynamic = "force-dynamic"

export async function DELETE(
  _requisicao: Request,
  { params }: Contexto<{ pessoaId: string; usuarioId: string }>
) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId, usuarioId } = await params
  return responder(() => removerMembro(chamada.sessao.id, pessoaId, usuarioId))
}
