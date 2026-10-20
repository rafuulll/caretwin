import { z } from "zod"
import { lerCorpo } from "@/lib/conta"
import { marcarAlerta } from "@/lib/historico"
import { erro, quemChama, responder, type Contexto } from "@/lib/rota-v1"

/**
 * PATCH /v1/alertas/{alertaId} com { "lido": true }: marca o alerta como visto
 * para a família toda, ou { "lido": false } para voltar a ser novo. Devolve o
 * alerta como ficou. Sem vínculo com a pessoa do alerta, 404.
 */

export const dynamic = "force-dynamic"

const ENTRADA = z.object({ lido: z.boolean() })

export async function PATCH(requisicao: Request, { params }: Contexto<{ alertaId: string }>) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  const { alertaId } = await params

  const corpo = await lerCorpo(requisicao, ENTRADA)
  if (!corpo) return erro(422, "Mande { \"lido\": true } ou { \"lido\": false }.", "invalido")

  return responder(() => marcarAlerta(chamada.sessao.id, alertaId, corpo.lido))
}
