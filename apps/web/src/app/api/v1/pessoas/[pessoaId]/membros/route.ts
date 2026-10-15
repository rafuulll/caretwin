import { listarMembros } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/** GET /v1/pessoas/{pessoaId}/membros: qualquer membro aprovado vê quem mais está na família. */

export const dynamic = "force-dynamic"

export async function GET(_requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId } = await params
  return responder(() => listarMembros(chamada.sessao.id, pessoaId))
}
