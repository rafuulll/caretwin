import { marcarSincronizacao, receberDaPulseira } from "@/lib/dispositivo"
import { ENVIO_DA_NOITE } from "../esquemas"

/**
 * POST /v1/device/nights: a janela da noite, 840 minutos das 20h às 10h, uma
 * noite por envio (cerca de 4 KB cada).
 *
 * Atenção à data. Para a pulseira, `night_date` é o dia em que a noite COMEÇA
 * (às 20h). No site, a noite aparece no dia em que ela TERMINA, junto com a
 * manhã em que a pessoa acordou. Por isso a linha é gravada em night_date mais
 * um dia: a noite de 20/10 aparece no dia 21/10. A resposta devolve o
 * night_date original, que é o que o firmware procura para tirar da fila.
 */

export const dynamic = "force-dynamic"

export async function POST(requisicao: Request) {
  return receberDaPulseira(requisicao, ENVIO_DA_NOITE, async (tx, pulseira, noite) => {
    if (pulseira.encerrada) return { accepted: [], rejected: [noite.night_date] }

    // Os passos do mesmo dia podem ter chegado antes pelo resumo diário: o
    // update mexe só na noite.
    await tx`
      insert into dias (pulseira_id, pessoa_id, data, noite)
      values (
        ${pulseira.id},
        ${pulseira.pessoaId},
        ${noite.night_date}::date + 1,
        ${tx.json({ inicio: noite.window_start, contagens: noite.counts })}
      )
      on conflict (pulseira_id, data) do update set
        noite = excluded.noite,
        pessoa_id = coalesce(dias.pessoa_id, excluded.pessoa_id)
    `

    await marcarSincronizacao(tx, pulseira)
    return { accepted: [noite.night_date], rejected: [] }
  })
}
