import { z } from "zod"
import { LIMITES_DA_PULSEIRA } from "./modelo"

/**
 * O formato do envio bruto da pulseira, igual a `docs/openapi.yaml`
 * (POST /v1/device/raw). Fica num arquivo próprio, sem nenhum import do
 * Next, para os testes rodarem direto no Node.
 *
 * Os números chegam inteiros de propósito: o firmware (um ESP32 pequeno)
 * escreve `1013` em vez de `1.013`, o JSON fica mais curto e a conta de
 * ponto flutuante fica na página, que tem sobra de processador.
 *
 *   aceleração: milésimos de g      (1000 = 1 g, o que o sensor marca parado)
 *   giroscópio: décimos de grau/s   (100 = 10 graus por segundo)
 */

export const LOTE_AO_VIVO = {
  /** Leituras por lote: 50 Hz durante 1 segundo, com folga para 100. */
  leituras: 100,
  /** O MPU-6050 está na faixa de 4 g; 16 g só dá margem para um valor ruim. */
  aceleracaoMax: 16000,
  /** Faixa de 500 graus/s no firmware; 2000 graus/s é o teto do sensor. */
  giroscopioMax: 20000,
  /** O MAX30102 tem 18 bits. */
  infravermelhoMax: 262143,
  /** Quanto tempo o servidor guarda os lotes de uma pulseira. */
  minutosGuardados: 10,
} as const

const HORARIO = z.iso.datetime({ offset: true })
const ACELERACAO = z.number().int().min(-LOTE_AO_VIVO.aceleracaoMax).max(LOTE_AO_VIVO.aceleracaoMax)
const GIROSCOPIO = z.number().int().min(-LOTE_AO_VIVO.giroscopioMax).max(LOTE_AO_VIVO.giroscopioMax)

export const ENVIO_AO_VIVO_BRUTO = z
  .object({
    rate_hz: z.number().int().min(1).max(200),
    ts: HORARIO.nullable(),
    steps_today: z.number().int().min(0).max(LIMITES_DA_PULSEIRA.passosPorDia).nullable(),
    // null: sem dedo no sensor.
    bpm: z.number().int().min(30).max(220).nullable(),
    imu: z.array(z.tuple([ACELERACAO, ACELERACAO, ACELERACAO, GIROSCOPIO, GIROSCOPIO, GIROSCOPIO])).min(1).max(LOTE_AO_VIVO.leituras),
    ir: z.array(z.number().int().min(0).max(LOTE_AO_VIVO.infravermelhoMax)).min(1).max(LOTE_AO_VIVO.leituras).optional(),
  })
  .refine((lote) => lote.ir === undefined || lote.ir.length === lote.imu.length, {
    message: "ir precisa ter uma leitura para cada leitura de imu",
  })

export type EnvioAoVivoBruto = z.infer<typeof ENVIO_AO_VIVO_BRUTO>
