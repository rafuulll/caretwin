import { listarPessoas } from "@/lib/familia"
import { quemChama, responder } from "@/lib/rota-v1"

/** GET /v1/pessoas: só as pessoas com vínculo aprovado. Pedido pendente não entra. */

export const dynamic = "force-dynamic"

export async function GET() {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  return responder(() => listarPessoas(chamada.sessao.id))
}
