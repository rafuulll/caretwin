import { marcarSincronizacao, receberDaPulseira } from "@/lib/dispositivo"
import { ENVIO_AO_VIVO } from "../esquemas"

/**
 * POST /v1/device/live: o modo ao vivo, os passos de hoje a cada poucos
 * segundos, para a demonstração.
 *
 * Não cria dia nenhum (cartão 5.5): os passos de hoje entram pelo resumo
 * diário quando o dia fecha. Gravar cada envio deixaria o dia de hoje mudando
 * de valor a cada cinco segundos e brigando com o resumo. Aqui só fica a hora
 * em que a pulseira deu sinal, que o site usa para dizer se o dado está em dia.
 */

export const dynamic = "force-dynamic"

export async function POST(requisicao: Request) {
  return receberDaPulseira(requisicao, ENVIO_AO_VIVO, async (tx, pulseira, envio) => {
    const recebido = envio.ts ? [envio.ts] : []
    if (pulseira.encerrada) return { accepted: [], rejected: recebido }

    await marcarSincronizacao(tx, pulseira)
    return { accepted: recebido, rejected: [] }
  })
}
