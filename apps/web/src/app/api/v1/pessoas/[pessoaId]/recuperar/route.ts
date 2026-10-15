import { recuperar } from "@/lib/familia"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/** POST /v1/pessoas/{pessoaId}/recuperar: quem encerrou volta atrás, em até 30 dias. */

export const dynamic = "force-dynamic"

export async function POST(_requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId } = await params
  return responder(() => recuperar(chamada.sessao.id, pessoaId))
}
