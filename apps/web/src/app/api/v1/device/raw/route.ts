import { gravarLote } from "@/lib/ao-vivo"
import { ENVIO_AO_VIVO_BRUTO } from "@/lib/ao-vivo-esquema"
import { receberDaPulseira } from "@/lib/dispositivo"

/**
 * POST /v1/device/raw: o modo ao vivo mandando os dados brutos dos sensores,
 * um lote por segundo (até 100 leituras do acelerômetro e do giroscópio, mais o
 * infravermelho do sensor de batimentos), para a página /ao-vivo.
 *
 * Como o /v1/device/live, não cria dia nenhum nem mexe no histórico: o lote só
 * fica numa janela de 10 minutos (`ao_vivo_lotes`). A hora de sinal da pulseira
 * é atualizada, mas no máximo a cada 10 segundos, para um lote por segundo não
 * virar uma escrita por segundo na linha dela.
 */

export const dynamic = "force-dynamic"

export async function POST(requisicao: Request) {
  return receberDaPulseira(requisicao, ENVIO_AO_VIVO_BRUTO, async (tx, pulseira, envio) => {
    const recebido = envio.ts ? [envio.ts] : []
    if (pulseira.encerrada) return { accepted: [], rejected: recebido }

    await gravarLote(tx, pulseira.id, envio)
    await tx`
      update pulseiras set ultima_sincronizacao = now()
      where id = ${pulseira.id}
        and (ultima_sincronizacao is null or ultima_sincronizacao < now() - interval '10 seconds')
    `
    return { accepted: recebido, rejected: [] }
  })
}
