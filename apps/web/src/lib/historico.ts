import type postgres from "postgres"
import { conexao } from "./banco"
import { ehUuid, type Resultado } from "./familia"
import type { Direcao, Metrica } from "./modelo"
import type { Alerta, DataISO, DiaRegistrado, Noite } from "./types"

/**
 * O que o site lê do que a pulseira mandou: os dias e os alertas de uma pessoa
 * (cartão 5.6). As rotas de `src/app/api/v1` chamam estas funções; a tela lê
 * pelo `store.ts` (cartão 7.3).
 *
 * A regra de acesso é a mesma de `pessoasVisiveis` em `familia.ts`: vínculo
 * aprovado com a pessoa e pessoa não encerrada. Fora disso a resposta é 404,
 * nunca 403, para não revelar que o id existe.
 */

/** Sem `de` e `ate`, os últimos 30 dias. Um pedido maior que um ano é recusado. */
export const DIAS_DA_JANELA = 30
const MAXIMO_DE_DIAS = 366

type Sql = postgres.Sql

// Mesma frase de `familia.ts`: para quem chamou, a pessoa ou o alerta só não existe.
const NAO_ENCONTRADO = { ok: false, status: 404, erro: "Não encontrado." } as const

function invalido<T>(erro: string): Resultado<T> {
  return { ok: false, status: 422, erro, codigo: "invalido" }
}

function banco(): Sql {
  const sql = conexao()
  // As rotas só chegam aqui depois de `quemChama()`, que já recusa sem banco.
  if (!sql) throw new Error("DATABASE_URL não configurada")
  return sql
}

async function enxerga(sql: Sql, usuarioId: string, pessoaId: string) {
  const [linha] = await sql`
    select 1
    from vinculos v
    join pessoas p on p.id = v.pessoa_id
    where v.usuario_id = ${usuarioId}
      and v.pessoa_id = ${pessoaId}
      and v.aprovado
      and p.encerrado_em is null
  `
  return Boolean(linha)
}

// --- datas --------------------------------------------------------------------

const AAAA_MM_DD = /^\d{4}-\d{2}-\d{2}$/

/** "2026-02-31" tem o formato certo, mas não existe no calendário. */
export function dataExiste(texto: string) {
  if (!AAAA_MM_DD.test(texto)) return false
  const dia = new Date(`${texto}T00:00:00Z`)
  return !Number.isNaN(dia.getTime()) && dia.toISOString().slice(0, 10) === texto
}

export function somarDias(data: DataISO, dias: number): DataISO {
  const dia = new Date(`${data}T00:00:00Z`)
  dia.setUTCDate(dia.getUTCDate() + dias)
  return dia.toISOString().slice(0, 10)
}

function diasEntre(de: DataISO, ate: DataISO) {
  return Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86_400_000) + 1
}

/**
 * Hoje no Brasil. O servidor da Vercel roda em UTC: às 22h de Brasília já é o
 * dia seguinte lá, e "hoje" pelo relógio do servidor pularia um dia.
 */
export function hojeNoBrasil(agora = new Date()): DataISO {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora)
}

// --- dias ---------------------------------------------------------------------

export type FiltroDeDias = { de?: string; ate?: string }

type LinhaDia = {
  id: string
  pessoa_id: string
  data: string
  passos: number | null
  noite: Noite | null
}

/**
 * `GET /v1/pessoas/{id}/dias`: do mais antigo para o mais novo. Faltando uma
 * ponta, ela é completada com a janela de 30 dias; faltando as duas, termina
 * hoje.
 */
export async function lerDias(
  usuarioId: string,
  pessoaId: string,
  filtro: FiltroDeDias
): Promise<Resultado<DiaRegistrado[]>> {
  if (!ehUuid(pessoaId)) return NAO_ENCONTRADO

  for (const ponta of [filtro.de, filtro.ate]) {
    if (ponta !== undefined && !dataExiste(ponta)) return invalido("Use datas no formato AAAA-MM-DD.")
  }
  const ate = filtro.ate ?? (filtro.de ? somarDias(filtro.de, DIAS_DA_JANELA - 1) : hojeNoBrasil())
  const de = filtro.de ?? somarDias(ate, -(DIAS_DA_JANELA - 1))
  if (de > ate) return invalido("A data de início vem depois da data de fim.")
  if (diasEntre(de, ate) > MAXIMO_DE_DIAS) return invalido("Peça no máximo um ano de dias de uma vez.")

  const sql = banco()
  if (!(await enxerga(sql, usuarioId, pessoaId))) return NAO_ENCONTRADO
  return { ok: true, status: 200, corpo: await sql.begin((tx) => buscarDias(tx, pessoaId, de, ate)) }
}

/**
 * Os dias de uma pessoa entre duas datas, já no formato das telas. Sem
 * conferir acesso: quem chama já conferiu (`lerDias`) ou é o próprio servidor
 * (`alertas.ts`, ao recalcular os alertas).
 */
export async function buscarDias(
  sql: postgres.TransactionSql,
  pessoaId: string,
  de: DataISO,
  ate: DataISO
): Promise<DiaRegistrado[]> {
  // Uma pessoa que trocou de pulseira pode ter duas linhas no mesmo dia, uma
  // de cada. O distinct on fica com uma só: a que tem mais dado.
  const linhas = await sql<LinhaDia[]>`
    select distinct on (d.data)
      d.id, d.pessoa_id, d.data::text as data, d.passos, d.noite
    from dias d
    where d.pessoa_id = ${pessoaId}
      and d.data between ${de}::date and ${ate}::date
    order by d.data,
      (d.passos is not null)::int + (d.noite is not null)::int desc,
      d.id
  `
  return linhas.map((l) => ({
    id: l.id,
    pessoaId: l.pessoa_id,
    data: l.data,
    passos: l.passos,
    noite: l.noite,
    // A pulseira ainda não manda batimentos (no contrato, /heartrate é futuro).
    batimentos: [],
  }))
}

// --- alertas ------------------------------------------------------------------

type LinhaAlerta = {
  id: string
  pessoa_id: string
  data: string
  metrica: Metrica
  direcao: Direcao
  desvio: number
  texto: string
  lido: boolean
  criado_em: Date
}

function alertaDaLinha(l: LinhaAlerta): Alerta {
  return {
    id: l.id,
    pessoaId: l.pessoa_id,
    data: l.data,
    metrica: l.metrica,
    direcao: l.direcao,
    desvio: l.desvio,
    texto: l.texto,
    lido: l.lido,
    criadoEm: l.criado_em.toISOString(),
  }
}

/** `GET /v1/pessoas/{id}/alertas`: do mais recente para o mais antigo. */
export async function lerAlertas(
  usuarioId: string,
  pessoaId: string,
  lido?: boolean
): Promise<Resultado<Alerta[]>> {
  if (!ehUuid(pessoaId)) return NAO_ENCONTRADO
  const sql = banco()
  if (!(await enxerga(sql, usuarioId, pessoaId))) return NAO_ENCONTRADO

  const linhas = await sql<LinhaAlerta[]>`
    select a.id, a.pessoa_id, a.data::text as data, a.metrica, a.direcao, a.desvio, a.texto, a.lido, a.criado_em
    from alertas a
    where a.pessoa_id = ${pessoaId}
      ${lido === undefined ? sql`` : sql`and a.lido = ${lido}`}
    order by a.data desc, a.criado_em desc
  `
  return { ok: true, status: 200, corpo: linhas.map(alertaDaLinha) }
}

/**
 * `PATCH /v1/alertas/{id}`: marcar como lido, ou voltar para novo. O "lido"
 * vale para a família toda, então qualquer membro aprovado pode mudar. A
 * conferência de acesso vai dentro do próprio update: sem vínculo, nenhuma
 * linha muda e a resposta é 404.
 */
export async function marcarAlerta(usuarioId: string, alertaId: string, lido: boolean): Promise<Resultado<Alerta>> {
  if (!ehUuid(alertaId)) return NAO_ENCONTRADO
  const [linha] = await banco()<LinhaAlerta[]>`
    update alertas a
    set lido = ${lido}
    where a.id = ${alertaId}
      and exists (
        select 1
        from vinculos v
        join pessoas p on p.id = v.pessoa_id
        where v.usuario_id = ${usuarioId}
          and v.pessoa_id = a.pessoa_id
          and v.aprovado
          and p.encerrado_em is null
      )
    returning a.id, a.pessoa_id, a.data::text as data, a.metrica, a.direcao, a.desvio, a.texto, a.lido, a.criado_em
  `
  if (!linha) return NAO_ENCONTRADO
  return { ok: true, status: 200, corpo: alertaDaLinha(linha) }
}
