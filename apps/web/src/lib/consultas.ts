/**
 * Leituras prontas para as telas: juntam os dados guardados com o normal de
 * cada pessoa. São funções puras sobre o que o `store` entregou, então nenhuma
 * tela lê dado por fora dele, e todas fazem a mesma conta.
 */

import { BATERIA_BAIXA, DIAS_PARA_CONHECER_O_NORMAL, MINUTOS_PARA_DADO_ATRASADO, type Situacao } from "./modelo"
import { diasDeUso, diasPorData, faixaAteAgora, faixaNormal, fracaoDoDia, situacao, valorDoDia, type Faixa } from "./normal"
import { estimarSono, type SonoEstimado } from "./sono"
import { paraISO, somarDias } from "./formato"
import type { Alerta, Dados, DataISO, MedicaoBatimentos, Pulseira } from "./types"

export function pulseiraDe(dados: Dados, pessoaId: string): Pulseira | null {
  return dados.pulseiras.find((p) => p.pessoaId === pessoaId) ?? null
}

export function alertasDe(dados: Dados, pessoaId: string): Alerta[] {
  return dados.alertas.filter((a) => a.pessoaId === pessoaId)
}

export function quantosNovos(dados: Dados, pessoaId: string) {
  return dados.alertas.filter((a) => a.pessoaId === pessoaId && !a.lido).length
}

export type EstadoDaPulseira = {
  codigo: string
  bateria: number
  bateriaBaixa: boolean
  ultimaSincronizacao: string | null
  atrasada: boolean
}

export function estadoDaPulseira(pulseira: Pulseira | null, agora: Date): EstadoDaPulseira | null {
  if (!pulseira) return null
  const minutos = pulseira.ultimaSincronizacao
    ? (agora.getTime() - new Date(pulseira.ultimaSincronizacao).getTime()) / 60000
    : Infinity
  return {
    codigo: pulseira.codigo,
    bateria: pulseira.bateria,
    bateriaBaixa: pulseira.bateria <= BATERIA_BAIXA,
    ultimaSincronizacao: pulseira.ultimaSincronizacao,
    atrasada: pulseira.ultimaSincronizacao !== null && minutos > MINUTOS_PARA_DADO_ATRASADO,
  }
}

/** Quantos dias faltam para o normal existir. Zero quando ele já existe. */
export function aprendizado(dados: Dados, pessoaId: string) {
  const feitos = Math.min(diasDeUso(dados, pessoaId), DIAS_PARA_CONHECER_O_NORMAL)
  return { feitos, total: DIAS_PARA_CONHECER_O_NORMAL, faltam: DIAS_PARA_CONHECER_O_NORMAL - feitos }
}

export type PassosDeHoje = {
  passos: number | null
  /** O normal do dia inteiro. */
  faixaDoDia: Faixa | null
  /** O mesmo normal, encolhido pro horário de agora. */
  faixaAteAgora: Faixa | null
  situacao: Situacao
}

export function passosDeHoje(dados: Dados, pessoaId: string, agora: Date): PassosDeHoje {
  const hoje = paraISO(agora)
  const porData = diasPorData(dados, pessoaId)
  const passos = porData.get(hoje)?.passos ?? null
  const faixaDoDia = faixaNormal(porData, "passos", hoje)
  const ateAgora = faixaDoDia ? faixaAteAgora(faixaDoDia, fracaoDoDia(agora)) : null
  return { passos, faixaDoDia, faixaAteAgora: ateAgora, situacao: situacao(passos, ateAgora) }
}

export type PontoDoDia = {
  data: DataISO
  valor: number | null
  faixa: Faixa | null
  situacao: Situacao
  hoje: boolean
}

/**
 * Os últimos N dias de uma métrica, cada um com o normal que valia naquele dia.
 * Os passos de hoje ficam de fora: o dia ainda não terminou, e uma barra pela
 * metade ao lado das inteiras pareceria uma queda que não aconteceu.
 */
export function ultimosDias(dados: Dados, pessoaId: string, metrica: "passos" | "sono", agora: Date, n = 14): PontoDoDia[] {
  const hoje = paraISO(agora)
  const porData = diasPorData(dados, pessoaId)
  const pontos: PontoDoDia[] = []
  for (let i = n - 1; i >= 0; i--) {
    const data = somarDias(hoje, -i)
    const ehHoje = i === 0
    const valor = ehHoje && metrica === "passos" ? null : valorDoDia(porData.get(data), metrica)
    const faixa = faixaNormal(porData, metrica, data)
    pontos.push({ data, valor, faixa, situacao: situacao(valor, faixa), hoje: ehHoje })
  }
  return pontos
}

export type NoiteMaisRecente = {
  data: DataISO
  contagens: (number | null)[]
  sono: SonoEstimado
  faixa: Faixa | null
  situacao: Situacao
  /** A noite de hoje ainda não fechou, e esta é a anterior. */
  deOntem: boolean
}

/** A noite completa mais recente: a de hoje se a pessoa já acordou, senão a anterior. */
export function noiteMaisRecente(dados: Dados, pessoaId: string, agora: Date): NoiteMaisRecente | null {
  const hoje = paraISO(agora)
  const porData = diasPorData(dados, pessoaId)
  for (let i = 0; i < 7; i++) {
    const data = somarDias(hoje, -i)
    const noite = porData.get(data)?.noite
    if (!noite) continue
    const sono = estimarSono(noite.contagens)
    if (!sono) continue
    const faixa = faixaNormal(porData, "sono", data)
    return {
      data,
      contagens: noite.contagens,
      sono,
      faixa,
      situacao: situacao(sono.minutosDormindo, faixa),
      deOntem: i > 0,
    }
  }
  return null
}

export type MedicaoComDia = MedicaoBatimentos & { data: DataISO }

/** As medições da pessoa, da mais recente para a mais antiga. */
export function medicoesDe(dados: Dados, pessoaId: string): MedicaoComDia[] {
  return dados.dias
    .filter((d) => d.pessoaId === pessoaId)
    .flatMap((d) => d.batimentos.map((m) => ({ ...m, data: d.data })))
    .sort((a, b) => b.em.localeCompare(a.em))
}

/** A faixa de costume dos batimentos que vale hoje. */
export function faixaDosBatimentos(dados: Dados, pessoaId: string, agora: Date) {
  return faixaNormal(diasPorData(dados, pessoaId), "batimentos", paraISO(agora))
}

/** Se a pessoa já tem algum dado chegando da pulseira. */
export function temDados(dados: Dados, pessoaId: string) {
  return dados.dias.some((d) => d.pessoaId === pessoaId)
}
