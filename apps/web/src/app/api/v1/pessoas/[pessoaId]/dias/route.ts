import { lerDias } from "@/lib/historico"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/**
 * GET /v1/pessoas/{pessoaId}/dias?de=AAAA-MM-DD&ate=AAAA-MM-DD: os dias que a
 * pulseira mandou, do mais antigo para o mais novo. Sem filtros, os últimos
 * 30 dias até hoje no horário de Brasília. A noite aparece no dia em que ela
 * termina (a rota da pulseira já grava assim).
 */

export const dynamic = "force-dynamic"

export async function GET(requisicao: Request, { params }: Contexto<{ pessoaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { pessoaId } = await params

  // Parâmetro vazio (?de=) conta como ausente, do jeito que um formulário manda.
  const busca = new URL(requisicao.url).searchParams
  const de = busca.get("de") || undefined
  const ate = busca.get("ate") || undefined

  return responder(() => lerDias(chamada.sessao.id, pessoaId, { de, ate }))
}
