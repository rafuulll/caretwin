import { explicarAlertaDaFamilia } from "@/lib/historico"
import { quemChama, responder, type Contexto } from "@/lib/rota-v1"

/**
 * GET /v1/alertas/{alertaId}/explicacao: a explicação do alerta em linguagem
 * natural (cartão 6.3), escrita pela IA local e conferida antes de sair (6.2).
 * Se o modelo não está ligado, não responde ou escreve algo que o verificador
 * reprova, a resposta traz o texto de regra, com `origem: "regra"`. Sempre é
 * 200 com um texto bom; só falta acesso (404) ou sessão (401).
 */

export const dynamic = "force-dynamic"

// O modelo local pode levar alguns segundos, e a rota espera até a segunda tentativa.
export const maxDuration = 30

export async function GET(_requisicao: Request, { params }: Contexto<{ alertaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { alertaId } = await params
  return responder(() => explicarAlertaDaFamilia(chamada.sessao.id, alertaId))
}
