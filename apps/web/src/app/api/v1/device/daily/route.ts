import type { z } from "zod"
import { marcarSincronizacao, receberDaPulseira } from "@/lib/dispositivo"
import { BATERIA, DIA, ENVIO_DIARIO, rotuloDoDia } from "../esquemas"

/**
 * POST /v1/device/daily: a pulseira manda os passos e os minutos ativos dos
 * dias que estão na fila dela (até 7, se ficou sem Wi-Fi).
 *
 * Cada dia é conferido sozinho: os certos entram em `accepted` e saem da fila
 * da pulseira, os errados vão para `rejected` e nunca são gravados (cartão 5.5).
 * Mandar o mesmo dia de novo atualiza a linha, não cria outra.
 *
 * O alerta ainda não nasce aqui. A regra do normal está em `src/lib/normal.ts`,
 * escrita para as telas; virar um serviço sobre o banco é o cartão 6.1.
 */

export const dynamic = "force-dynamic"

export async function POST(requisicao: Request) {
  return receberDaPulseira(requisicao, ENVIO_DIARIO, async (tx, pulseira, envio) => {
    // Pessoa encerrada: a pulseira está travada por 30 dias e nada dela é
    // gravado. Os dias vão para rejected para o firmware não reenviar.
    if (pulseira.encerrada) return { accepted: [], rejected: envio.days.map(rotuloDoDia) }

    // Pelo Map, o mesmo dia repetido no envio vira uma linha só, a última.
    const validos = new Map<string, z.infer<typeof DIA>>()
    const rejected: string[] = []
    for (const bruto of envio.days) {
      const dia = DIA.safeParse(bruto)
      if (dia.success) validos.set(dia.data.date, dia.data)
      else rejected.push(rotuloDoDia(bruto))
    }

    for (const dia of validos.values()) {
      // A noite do mesmo dia pode ter chegado antes pela outra rota: o update
      // mexe só nos passos, e a pessoa, uma vez ligada, não é trocada.
      await tx`
        insert into dias (pulseira_id, pessoa_id, data, passos, minutos_ativos)
        values (${pulseira.id}, ${pulseira.pessoaId}, ${dia.date}, ${dia.steps}, ${dia.active_minutes})
        on conflict (pulseira_id, data) do update set
          passos = excluded.passos,
          minutos_ativos = excluded.minutos_ativos,
          pessoa_id = coalesce(dias.pessoa_id, excluded.pessoa_id)
      `
    }

    const bateria = BATERIA.safeParse(envio.battery_pct)
    await marcarSincronizacao(tx, pulseira, bateria.success ? bateria.data : undefined)
    return { accepted: [...validos.keys()], rejected }
  })
}
