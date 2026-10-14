/**
 * A estimativa de sono a partir do movimento da noite.
 *
 * É uma estimativa por movimento, do mesmo tipo que as pulseiras comuns fazem,
 * e não um exame de sono. A tela diz isso com todas as letras, e o texto daqui
 * nunca fala em qualidade do sono nem em distúrbio.
 *
 * Entrada: 840 contagens por minuto, das 20h às 10h, com `null` onde não há
 * dado. Saída: quando a pessoa provavelmente pegou no sono, quando acordou de
 * vez, quanto dormiu e quantas vezes acordou no meio.
 */

import { NOITE } from "./modelo"
import { minutoParaHora } from "./formato"

export type SonoEstimado = {
  /** Minutos desde as 20h em que o sono começou. */
  inicio: number
  /** Minutos desde as 20h em que a pessoa acordou de vez. */
  fim: number
  minutosDormindo: number
  despertares: number
}

/** Média de movimento abaixo disso, numa janela de 15 minutos, conta como sono. */
const LIMIAR_SONO = 2.2
const JANELA = 15
/** Acordar no meio da noite só conta se durar pelo menos isso, em minutos. */
const DESPERTAR_MINIMO = 5
/**
 * Com menos da metade da noite com dado, a estimativa sai inventada. É melhor
 * a tela dizer que a noite não chegou inteira do que mostrar um número falso.
 */
const COBERTURA_MINIMA = 0.5

function mediaMovel(contagens: (number | null)[], janela: number): (number | null)[] {
  const metade = Math.floor(janela / 2)
  return contagens.map((_, i) => {
    let soma = 0
    let n = 0
    for (let j = i - metade; j <= i + metade; j++) {
      const v = contagens[j]
      if (v !== null && v !== undefined) {
        soma += v
        n++
      }
    }
    return n === 0 ? null : soma / n
  })
}

/**
 * O início exige 26 dos 30 minutos seguintes quietos, e o fim, 26 dos 30
 * anteriores. Sem essa folga, um cochilo no sofá às 21h viraria a hora de
 * dormir, e virar na cama às 5h viraria a hora de acordar.
 */
export function estimarSono(contagens: (number | null)[]): SonoEstimado | null {
  if (contagens.length === 0) return null
  const comDado = contagens.filter((v) => v !== null).length
  if (comDado / contagens.length < COBERTURA_MINIMA) return null

  const suave = mediaMovel(contagens, JANELA)
  const dormindo = suave.map((v) => v !== null && v <= LIMIAR_SONO)

  let inicio = -1
  for (let i = 0; i < dormindo.length - 30; i++) {
    if (!dormindo[i]) continue
    let quietos = 0
    for (let j = i; j < i + 30; j++) if (dormindo[j]) quietos++
    if (quietos >= 26) {
      inicio = i
      break
    }
  }
  if (inicio < 0) return null

  let fim = -1
  for (let i = dormindo.length - 1; i > inicio + 30; i--) {
    if (!dormindo[i]) continue
    let quietos = 0
    for (let j = i - 29; j <= i; j++) if (dormindo[j]) quietos++
    if (quietos >= 26) {
      fim = i
      break
    }
  }
  // Fim colado no último minuto com dado quer dizer que a noite ainda não
  // terminou de chegar: a pessoa pode estar dormindo agora.
  const ultimoComDado = contagens.findLastIndex((v) => v !== null)
  if (fim < 0 || fim >= ultimoComDado - 1) return null

  let minutosDormindo = 0
  let despertares = 0
  let acordado = 0
  for (let i = inicio; i <= fim; i++) {
    if (dormindo[i]) {
      minutosDormindo++
      if (acordado >= DESPERTAR_MINIMO) despertares++
      acordado = 0
    } else {
      acordado++
    }
  }

  return { inicio, fim, minutosDormindo, despertares }
}

/** Minuto da janela da noite para a hora do relógio: 170 vira "22:50". */
export function horaDaNoite(minutoDaJanela: number) {
  return minutoParaHora(NOITE.inicioHora * 60 + minutoDaJanela)
}

/** A noite em blocos de 10 minutos, pro desenho. 840 barras não cabem em celular nenhum. */
export function noiteEmBlocos(contagens: (number | null)[], bloco = 10) {
  const blocos: { inicio: number; media: number | null }[] = []
  for (let i = 0; i < contagens.length; i += bloco) {
    const fatia = contagens.slice(i, i + bloco).filter((v): v is number => v !== null)
    blocos.push({
      inicio: i,
      media: fatia.length === 0 ? null : fatia.reduce((a, b) => a + b, 0) / fatia.length,
    })
  }
  return blocos
}
