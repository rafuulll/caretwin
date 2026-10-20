import { z } from "zod"
import { LIMITES_DA_PULSEIRA as LIMITES, NOITE } from "@/lib/modelo"

/**
 * O formato do que a pulseira manda, igual a `docs/openapi.yaml` v0.2. Os
 * nomes ficam em snake_case porque é o JSON do firmware desde a v0.1.
 *
 * Duas camadas de propósito: o envelope errado devolve 422 (a pulseira está
 * mandando outra coisa), mas um dia errado dentro de um envelope certo só vai
 * para `rejected`. Assim um dia com passos impossíveis não impede os outros
 * seis da fila de entrarem.
 */

const AAAA_MM_DD = /^\d{4}-\d{2}-\d{2}$/

/** Data local da pulseira que existe no calendário e não é impossível. */
export function dataPlausivel(texto: string, agora = new Date()) {
  if (!AAAA_MM_DD.test(texto)) return false
  const dia = new Date(`${texto}T00:00:00Z`)
  // "2026-02-31" vira 3 de março no Date; comparar de volta pega isso.
  if (Number.isNaN(dia.getTime()) || dia.toISOString().slice(0, 10) !== texto) return false
  const limite = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()))
  limite.setUTCDate(limite.getUTCDate() + LIMITES.diasNoFuturo)
  return texto >= LIMITES.primeiroDia && dia <= limite
}

const DATA = z.string().refine((texto) => dataPlausivel(texto))

/** Horário com fuso, do jeito que o firmware escreve: 2026-10-20T20:00:00-03:00. */
const HORARIO = z.iso.datetime({ offset: true })

export const ENVIO_DIARIO = z.object({
  firmware: z.string().max(64),
  // A pulseira manda null quando não conseguiu ler a bateria. Um valor
  // estranho aqui é ignorado em vez de recusar os dias junto.
  battery_pct: z.unknown().optional(),
  days: z.array(z.unknown()).max(LIMITES.diasPorEnvio),
})

export const DIA = z.object({
  date: DATA,
  steps: z.number().int().min(0).max(LIMITES.passosPorDia),
  active_minutes: z.number().int().min(0).max(LIMITES.minutosAtivosPorDia),
})

export const BATERIA = z.number().int().min(0).max(100)

export const ENVIO_DA_NOITE = z.object({
  night_date: DATA,
  window_start: HORARIO,
  // null é minuto sem dado (pulseira fora do pulso, sensor sem leitura), nunca zero.
  counts: z
    .array(z.number().int().min(0).max(LIMITES.contagemPorMinuto).nullable())
    .length(NOITE.minutos),
})

export const ENVIO_AO_VIVO = z.object({
  steps_today: z.number().int().min(0).max(LIMITES.passosPorDia),
  // O firmware manda null quando o relógio ainda não acertou pela rede.
  ts: HORARIO.nullable(),
})

/** Como o dia recusado aparece em `rejected`: a data que veio, se veio. */
export function rotuloDoDia(dia: unknown) {
  const data = (dia as { date?: unknown } | null)?.date
  return typeof data === "string" ? data.slice(0, 32) : "sem-data"
}
