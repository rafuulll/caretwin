/**
 * O normal de cada pessoa, que é o motivo de o CareTwin existir.
 *
 * Em vez de comparar todo mundo com a mesma meta, cada dia é comparado com a
 * própria pessoa. A regra é a do cartão 2.3, com os números em `modelo.ts`:
 *
 *   1. O NORMAL é a média dos 7 dias que vêm antes dos 3 dias mais recentes.
 *   2. A FAIXA de costume vai de 20% abaixo a 20% acima desse normal, e nunca
 *      fica mais estreita que a margem mínima da métrica (1.000 passos).
 *   3. Um ALERTA nasce quando 2 dos 3 dias recentes fogem da faixa para o
 *      mesmo lado.
 *   4. Com menos de 5 dias válidos na base, não existe normal ainda: a tela diz
 *      que está aprendendo e nunca força uma comparação.
 *
 * Tudo aqui é função pura sobre os dados. É a mesma conta que a linha de base
 * da API vai fazer, e por isso dá pra comparar as duas lado a lado.
 */

import { REGRA_NORMAL, type Direcao, type Metrica, type Situacao } from "./modelo"
import { estimarSono } from "./sono"
import { somarDias } from "./formato"
import type { Dados, DataISO, DiaRegistrado } from "./types"

export type Faixa = {
  normal: number
  baixo: number
  alto: number
  /** Quantos dias da base tinham dado. */
  diasValidos: number
}

function mediana(valores: number[]) {
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  return ordenados.length % 2 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2
}

/** O valor de uma métrica num dia, ou `null` quando a pulseira não contou nada. */
export function valorDoDia(dia: DiaRegistrado | undefined, metrica: Metrica): number | null {
  if (!dia) return null
  if (metrica === "passos") return dia.passos
  if (metrica === "sono") {
    if (!dia.noite) return null
    return estimarSono(dia.noite.contagens)?.minutosDormindo ?? null
  }
  // Batimentos do dia: a mediana das medições, que não se deixa puxar por uma
  // medição feita logo depois de subir a escada.
  return dia.batimentos.length ? Math.round(mediana(dia.batimentos.map((m) => m.bpm))) : null
}

/** Os dias registrados de uma pessoa, achados pela data. */
export function diasPorData(dados: Dados, pessoaId: string) {
  const mapa = new Map<DataISO, DiaRegistrado>()
  for (const dia of dados.dias) if (dia.pessoaId === pessoaId) mapa.set(dia.data, dia)
  return mapa
}

/**
 * A faixa de costume que vale para o dia de referência: a média dos 7 dias que
 * vêm antes dos 3 recentes, com 20% para cada lado.
 */
export function faixaNormal(
  porData: Map<DataISO, DiaRegistrado>,
  metrica: Metrica,
  referencia: DataISO
): Faixa | null {
  const valores: number[] = []
  const primeiro = REGRA_NORMAL.diasRecentes
  for (let i = primeiro; i < primeiro + REGRA_NORMAL.diasBase; i++) {
    const valor = valorDoDia(porData.get(somarDias(referencia, -i)), metrica)
    if (valor !== null) valores.push(valor)
  }
  if (valores.length < REGRA_NORMAL.minimoDiasValidos) return null
  const normal = valores.reduce((a, b) => a + b, 0) / valores.length
  // O maior entre 20% e a margem mínima da métrica (1.000 passos): quem anda
  // pouco não recebe alerta pela variação comum de um dia para o outro.
  const margem = Math.max(normal * REGRA_NORMAL.variacao, REGRA_NORMAL.margemMinima[metrica])
  return {
    normal,
    baixo: Math.max(0, normal - margem),
    alto: normal + margem,
    diasValidos: valores.length,
  }
}

export function situacao(valor: number | null, faixa: Faixa | null): Situacao {
  if (valor === null || faixa === null) return "aprendendo"
  if (valor < faixa.baixo) return "abaixo"
  if (valor > faixa.alto) return "acima"
  return "dentro"
}

/** Quanto o valor ficou longe do normal, em porcentagem. Sempre positivo. */
export function desvioDoNormal(valor: number, faixa: Faixa) {
  return Math.round((Math.abs(valor - faixa.normal) / Math.max(faixa.normal, 1)) * 100)
}

/*
  Como os passos se espalham ao longo de um dia tranquilo, hora a hora.

  Serve pra comparar "passos até agora" com "o normal até este horário". Sem
  isso, às 9h da manhã todo mundo estaria abaixo do normal do dia inteiro, e o
  app assustaria justamente quem acabou de acordar.
*/
const PESO_POR_HORA = [
  0, 0, 0, 0, 0, 0.5, 2, 5, 8, 9.5, 9.5, 8, 6, 5, 6, 7, 8, 7, 5, 4, 2.5, 1.5, 0.8, 0.2,
]
const SOMA_DOS_PESOS = PESO_POR_HORA.reduce((a, b) => a + b, 0)

/** A fração dos passos de um dia comum que costuma já ter acontecido a esta hora. */
export function fracaoDoDia(agora: Date) {
  const h = agora.getHours()
  let acumulado = 0
  for (let i = 0; i < h; i++) acumulado += PESO_POR_HORA[i]
  acumulado += PESO_POR_HORA[h] * (agora.getMinutes() / 60)
  return Math.min(1, acumulado / SOMA_DOS_PESOS)
}

/** A faixa do dia inteiro encolhida para o horário de agora. */
export function faixaAteAgora(faixa: Faixa, fracao: number): Faixa {
  return {
    normal: faixa.normal * fracao,
    baixo: faixa.baixo * fracao,
    alto: faixa.alto * fracao,
    diasValidos: faixa.diasValidos,
  }
}

/**
 * O último dia em que a métrica já está fechada.
 *
 * Passos de hoje ainda estão acontecendo, então o dia fechado é ontem. A noite
 * de hoje fecha quando a pessoa acorda: se ela já levantou, a noite de hoje
 * conta. Batimentos valem do jeito que estiverem, porque cada medição já é
 * completa em si.
 */
function ultimoDiaFechado(porData: Map<DataISO, DiaRegistrado>, metrica: Metrica, hoje: DataISO) {
  if (metrica === "passos") return somarDias(hoje, -1)
  if (metrica === "sono") return valorDoDia(porData.get(hoje), "sono") !== null ? hoje : somarDias(hoje, -1)
  return hoje
}

export type Mudanca = {
  id: string
  pessoaId: string
  data: DataISO
  metrica: Metrica
  direcao: Direcao
  /** Média, em porcentagem, de quanto os dias que fugiram ficaram longe do normal. */
  desvio: number
  /** O valor do dia mais recente que fugiu, pra frase do alerta. */
  valor: number
  faixa: Faixa
}

/** Os dias recentes de uma referência fogem do normal? Devolve para que lado, ou nada. */
function avaliar(porData: Map<DataISO, DiaRegistrado>, metrica: Metrica, referencia: DataISO) {
  const faixa = faixaNormal(porData, metrica, referencia)
  if (!faixa) return null

  const fora: { direcao: Direcao; valor: number; desvio: number }[] = []
  for (let i = 0; i < REGRA_NORMAL.diasRecentes; i++) {
    const valor = valorDoDia(porData.get(somarDias(referencia, -i)), metrica)
    const sit = situacao(valor, faixa)
    if (valor !== null && (sit === "abaixo" || sit === "acima")) {
      fora.push({ direcao: sit, valor, desvio: desvioDoNormal(valor, faixa) })
    }
  }

  for (const direcao of ["abaixo", "acima"] as const) {
    const mesmoLado = fora.filter((f) => f.direcao === direcao)
    if (mesmoLado.length >= REGRA_NORMAL.diasParaAlerta) {
      return {
        direcao,
        faixa,
        valor: mesmoLado[0].valor,
        desvio: Math.round(mesmoLado.reduce((a, f) => a + f.desvio, 0) / mesmoLado.length),
      }
    }
  }
  return null
}

/**
 * Procura mudanças nos últimos dias de cada pessoa.
 *
 * Um alerta nasce no PRIMEIRO dia em que a mudança fica clara. Nos dias
 * seguintes a mesma mudança continua valendo, e criar um alerta novo por dia
 * encheria a noite de quem cuida com o mesmo aviso repetido. O id sai da
 * pessoa, do dia e da métrica, então recalcular nunca duplica nem perde o lido.
 */
export function procurarMudancas(dados: Dados, hoje: DataISO, diasParaTras = 10): Mudanca[] {
  const mudancas: Mudanca[] = []
  for (const pessoa of dados.pessoas) {
    const porData = diasPorData(dados, pessoa.id)
    for (const metrica of ["passos", "sono", "batimentos"] as const) {
      const fechado = ultimoDiaFechado(porData, metrica, hoje)
      for (let i = diasParaTras; i >= 0; i--) {
        const referencia = somarDias(fechado, -i)
        const agora = avaliar(porData, metrica, referencia)
        if (!agora) continue
        const antes = avaliar(porData, metrica, somarDias(referencia, -1))
        if (antes && antes.direcao === agora.direcao) continue
        mudancas.push({
          id: `alerta-${pessoa.id}-${referencia}-${metrica}`,
          pessoaId: pessoa.id,
          data: referencia,
          metrica,
          ...agora,
        })
      }
    }
  }
  return mudancas
}

/** Quantos dias de uso a pessoa já tem: é o que diz quanto falta para o normal existir. */
export function diasDeUso(dados: Dados, pessoaId: string) {
  return dados.dias.filter((d) => d.pessoaId === pessoaId && (d.passos !== null || d.noite !== null))
    .length
}

/** O horário da noite (20h às 10h) em minutos de relógio, pra quem desenha a noite. */
