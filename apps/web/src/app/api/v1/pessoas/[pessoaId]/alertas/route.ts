import { lerAlertas } from "@/lib/historico"
import { erro, quemChama, responder, type Contexto } from "@/lib/rota-v1"

/**
 * GET /v1/pessoas/{pessoaId}/alertas?lido=true|false: do mais recente para o
 * mais antigo. Sem `lido`, todos; `lido=false` são os que ninguém da família
 * marcou como vistos ainda.
 *
 * Os alertas nascem no servidor quando chegam dias novos (cartão 6.1). Até lá
 * a lista volta vazia.
 */

export const dynamic = "force-dynamic"

export async function GET(requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId } = await params

  const filtro = new URL(requisicao.url).searchParams.get("lido")
  if (filtro !== null && filtro !== "true" && filtro !== "false") {
    return erro(422, "Use lido=true ou lido=false.", "invalido")
  }
  const lido = filtro === null ? undefined : filtro === "true"

  return responder(() => lerAlertas(chamada.sessao.id, pessoaId, lido))
}
