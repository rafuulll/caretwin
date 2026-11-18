import type postgres from "postgres"
import { buscarDias, hojeNoBrasil, somarDias } from "./historico"
import type { Alerta, Dados } from "./types"

/**
 * Os dados de uma pessoa de demonstração, no mesmo formato (`Dados`) que o
 * app entrega às telas. A página /demo usa as mesmas contas e os mesmos
 * gráficos do painel de verdade: o que a banca vê é o produto, não uma maquete.
 *
 * Só chamado com um código da lista PULSEIRAS_PUBLICAS (`publico.ts`). Os ids
 * do banco não saem daqui: a pessoa, a pulseira e os alertas ganham ids
 * simples, porque a tela só precisa que eles combinem entre si.
 */

type Sql = postgres.Sql

const DIAS_DA_DEMO = 40
const ALERTAS_DA_DEMO = 20

type LinhaPessoa = {
  pessoa_id: string
  nome: string
  criado_em: Date
  codigo: string
  bateria: number | null
  ultima_sincronizacao: Date | null
}

type LinhaAlerta = {
  data: string
  metrica: Alerta["metrica"]
  direcao: Alerta["direcao"]
  desvio: number
  texto: string
  lido: boolean
  criado_em: Date
}

export const ID_DA_PESSOA_DE_DEMO = "demo"

export async function dadosDaDemo(sql: Sql, codigo: string): Promise<Dados | null> {
  const [pessoa] = await sql<LinhaPessoa[]>`
    select pu.pessoa_id, p.nome, p.criado_em, pu.codigo, pu.bateria, pu.ultima_sincronizacao
    from pulseiras pu
    join pessoas p on p.id = pu.pessoa_id
    where pu.codigo = ${codigo}
      and p.encerrado_em is null
  `
  if (!pessoa) return null

  const hoje = hojeNoBrasil()
  const dias = await sql.begin((tx) => buscarDias(tx, pessoa.pessoa_id, somarDias(hoje, -(DIAS_DA_DEMO - 1)), hoje))
  const alertas = await sql<LinhaAlerta[]>`
    select data::text as data, metrica, direcao, desvio, texto, lido, criado_em
    from alertas
    where pessoa_id = ${pessoa.pessoa_id}
    order by data desc, criado_em desc
    limit ${ALERTAS_DA_DEMO}
  `

  // Os passos de hoje só chegam pelo resumo do dia, que fecha à noite. Na
  // demonstração, quando a pulseira está no modo ao vivo, o último lote traz
  // os passos de agora: eles preenchem o dia de hoje enquanto ele não existe.
  const diasDaTela = dias.map((d, i) => ({ ...d, id: `demo-dia-${i}`, pessoaId: ID_DA_PESSOA_DE_DEMO }))
  if (!diasDaTela.some((d) => d.data === hoje && d.passos !== null)) {
    const [vivo] = await sql<{ passos_hoje: number }[]>`
      select l.passos_hoje
      from ao_vivo_lotes l
      join pulseiras pu on pu.id = l.pulseira_id
      where pu.codigo = ${codigo}
        and l.passos_hoje is not null
        and (l.recebido_em at time zone 'America/Sao_Paulo')::date = ${hoje}::date
      order by l.id desc
      limit 1
    `
    if (vivo) {
      const existente = diasDaTela.find((d) => d.data === hoje)
      if (existente) existente.passos = vivo.passos_hoje
      else diasDaTela.push({ id: "demo-dia-hoje", pessoaId: ID_DA_PESSOA_DE_DEMO, data: hoje, passos: vivo.passos_hoje, noite: null, batimentos: [] })
    }
  }

  return {
    pessoas: [
      { id: ID_DA_PESSOA_DE_DEMO, nome: pessoa.nome, quemAcompanha: "", criadoEm: pessoa.criado_em.toISOString() },
    ],
    pulseiras: [
      {
        id: "demo-pulseira",
        codigo: pessoa.codigo,
        pessoaId: ID_DA_PESSOA_DE_DEMO,
        bateria: pessoa.bateria,
        ultimaSincronizacao: pessoa.ultima_sincronizacao ? pessoa.ultima_sincronizacao.toISOString() : null,
      },
    ],
    dias: diasDaTela,
    alertas: alertas.map((a, i) => ({
      id: `demo-alerta-${i}`,
      pessoaId: ID_DA_PESSOA_DE_DEMO,
      data: a.data,
      metrica: a.metrica,
      direcao: a.direcao,
      desvio: a.desvio,
      texto: a.texto,
      lido: a.lido,
      criadoEm: a.criado_em.toISOString(),
    })),
  }
}
