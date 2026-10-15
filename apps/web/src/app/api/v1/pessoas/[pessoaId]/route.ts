import { lerPessoa } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/** GET /v1/pessoas/{pessoaId}: sem vínculo aprovado, 404, para não revelar que o id existe. */

export const dynamic = "force-dynamic"

export async function GET(_requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId } = await params
  return responder(() => lerPessoa(chamada.sessao.id, pessoaId))
}
