import type postgres from "postgres"
import { LOTE_AO_VIVO, type EnvioAoVivoBruto } from "./ao-vivo-esquema"

/**
 * O que o servidor faz com os lotes brutos da pulseira: guardar (a rota
 * POST /v1/device/raw) e devolver os mais novos (a rota pública
 * GET /api/publico/ao-vivo). Os dados de tela e os dados de aparelho não se
 * misturam: nada daqui vira dia, alerta nem histórico.
 */

type Sql = postgres.Sql
type SqlTx = postgres.TransactionSql

/** Quantos lotes a página recebe de uma vez ao abrir (10 s) e a cada pedido (até 40 s de atraso). */
const LOTES_AO_ABRIR = 10
const LOTES_POR_PEDIDO = 40

/**
 * Guarda um lote e apaga os velhos desta pulseira. A limpeza vai junto, no
 * mesmo envio, para a tabela se manter pequena sem precisar de tarefa
 * agendada: cada pulseira nunca passa de 10 minutos de lotes.
 */
export async function gravarLote(tx: SqlTx, pulseiraId: string, envio: EnvioAoVivoBruto) {
  await tx`
    insert into ao_vivo_lotes (pulseira_id, ts, taxa_hz, passos_hoje, bpm, imu, ir)
    values (
      ${pulseiraId},
      ${envio.ts},
      ${envio.rate_hz},
      ${envio.steps_today},
      ${envio.bpm},
      ${tx.json(envio.imu)},
      ${envio.ir ? tx.json(envio.ir) : null}
    )
  `
  await tx`
    delete from ao_vivo_lotes
    where pulseira_id = ${pulseiraId}
      and recebido_em < now() - make_interval(mins => ${LOTE_AO_VIVO.minutosGuardados})
  `
}

export type PulseiraAoVivo = {
  codigo: string
  /** O nome da pessoa de demonstração, ou null se a pulseira ainda não foi ligada a ninguém. */
  pessoa: string | null
  bateria: number | null
  ultimaSincronizacao: string | null
}

export type LoteLido = {
  id: number
  ts: string | null
  recebidoEm: string
  taxaHz: number
  passosHoje: number | null
  bpm: number | null
  imu: number[][]
  ir: number[] | null
}

export type AoVivo = {
  pulseira: PulseiraAoVivo
  lotes: LoteLido[]
  /** A hora do servidor, para a página medir há quantos segundos o último lote chegou. */
  agora: string
}

type LinhaPulseira = {
  id: string
  codigo: string
  bateria: number | null
  ultima_sincronizacao: Date | null
  nome: string | null
}

type LinhaLote = {
  id: string
  ts: Date | null
  recebido_em: Date
  taxa_hz: number
  passos_hoje: number | null
  bpm: number | null
  imu: number[][]
  ir: number[] | null
}

function loteDaLinha(l: LinhaLote): LoteLido {
  return {
    id: Number(l.id),
    ts: l.ts ? l.ts.toISOString() : null,
    recebidoEm: l.recebido_em.toISOString(),
    taxaHz: l.taxa_hz,
    passosHoje: l.passos_hoje,
    bpm: l.bpm,
    imu: l.imu,
    ir: l.ir,
  }
}

/**
 * Os lotes de uma pulseira pública. Com `depois`, só os que chegaram depois
 * daquele lote; sem ele, os 10 mais recentes (o que a página mostra ao abrir).
 * `null` quando o código não é de nenhuma pulseira cadastrada.
 */
export async function lerAoVivo(sql: Sql, codigo: string, depois: number | null): Promise<AoVivo | null> {
  const [pulseira] = await sql<LinhaPulseira[]>`
    select pu.id, pu.codigo, pu.bateria, pu.ultima_sincronizacao, p.nome
    from pulseiras pu
    left join pessoas p on p.id = pu.pessoa_id and p.encerrado_em is null
    where pu.codigo = ${codigo}
  `
  if (!pulseira) return null

  const linhas =
    depois === null
      ? await sql<LinhaLote[]>`
          select * from (
            select id, ts, recebido_em, taxa_hz, passos_hoje, bpm, imu, ir
            from ao_vivo_lotes
            where pulseira_id = ${pulseira.id}
            order by id desc
            limit ${LOTES_AO_ABRIR}
          ) recentes
          order by id
        `
      : await sql<LinhaLote[]>`
          select id, ts, recebido_em, taxa_hz, passos_hoje, bpm, imu, ir
          from ao_vivo_lotes
          where pulseira_id = ${pulseira.id} and id > ${depois}
          order by id
          limit ${LOTES_POR_PEDIDO}
        `

  return {
    pulseira: {
      codigo: pulseira.codigo,
      pessoa: pulseira.nome,
      bateria: pulseira.bateria,
      ultimaSincronizacao: pulseira.ultima_sincronizacao ? pulseira.ultima_sincronizacao.toISOString() : null,
    },
    lotes: linhas.map(loteDaLinha),
    agora: new Date().toISOString(),
  }
}
