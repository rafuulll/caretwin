/*
  Estimativa de sono a partir do movimento noturno.
  É uma estimativa por movimento (actigrafia simples), e não um exame de sono:
  a tela diz isso com todas as letras.

  Entrada: 840 contagens por minuto, das 20:00 às 10:00, com null quando não há dado.
  Saída: quando a pessoa provavelmente dormiu, acordou, quanto dormiu e quantas vezes acordou.
*/

import { NOITE } from "./modelo";
import { minutoParaHora } from "./formato";

export type SonoEstimado = {
  /** Minutos desde as 20:00 em que o sono começou. */
  inicio: number;
  /** Minutos desde as 20:00 em que a pessoa acordou de vez. */
  fim: number;
  minutosDormindo: number;
  despertares: number;
  /** Fração da noite que tem dado (0 a 1). */
  cobertura: number;
};

/** Média de movimento abaixo disso, numa janela de 15 minutos, conta como sono. */
const LIMIAR_SONO = 2.2;
const JANELA = 15;
/** Um despertar só conta se durar pelo menos isso, em minutos. */
const DESPERTAR_MINIMO = 5;

function mediaMovel(contagens: (number | null)[], janela: number): (number | null)[] {
  const metade = Math.floor(janela / 2);
  return contagens.map((_, i) => {
    let soma = 0;
    let n = 0;
    for (let j = i - metade; j <= i + metade; j++) {
      const v = contagens[j];
      if (v !== null && v !== undefined) {
        soma += v;
        n++;
      }
    }
    return n === 0 ? null : soma / n;
  });
}

export function estimarSono(contagens: (number | null)[]): SonoEstimado | null {
  if (contagens.length === 0) return null;
  const comDado = contagens.filter((v) => v !== null).length;
  const cobertura = comDado / contagens.length;
  if (cobertura < 0.5) return null;

  const suave = mediaMovel(contagens, JANELA);
  const dormindo = suave.map((v) => v !== null && v <= LIMIAR_SONO);

  // Início: primeiro minuto em que os 30 minutos seguintes são quase todos de sono.
  let inicio = -1;
  for (let i = 0; i < dormindo.length - 30; i++) {
    if (!dormindo[i]) continue;
    let s = 0;
    for (let j = i; j < i + 30; j++) if (dormindo[j]) s++;
    if (s >= 26) {
      inicio = i;
      break;
    }
  }
  if (inicio < 0) return null;

  // Fim: último minuto em que os 30 minutos anteriores eram quase todos de sono.
  let fim = -1;
  for (let i = dormindo.length - 1; i > inicio + 30; i--) {
    if (!dormindo[i]) continue;
    let s = 0;
    for (let j = i - 29; j <= i; j++) if (dormindo[j]) s++;
    if (s >= 26) {
      fim = i;
      break;
    }
  }
  if (fim < 0) return null;

  let minutosDormindo = 0;
  let despertares = 0;
  let acordado = 0;
  for (let i = inicio; i <= fim; i++) {
    if (dormindo[i]) {
      minutosDormindo++;
      if (acordado >= DESPERTAR_MINIMO) despertares++;
      acordado = 0;
    } else {
      acordado++;
    }
  }

  return { inicio, fim, minutosDormindo, despertares, cobertura };
}

/** Minuto da janela noturna para hora do relógio ("23:10"). */
export function horaDaNoite(minutoDaJanela: number): string {
  return minutoParaHora(NOITE.inicioHora * 60 + minutoDaJanela);
}

/** Agrupa a noite em blocos (5 minutos por padrão) para o gráfico. */
export function agruparNoite(contagens: (number | null)[], bloco = 5): { inicio: number; media: number | null }[] {
  const grupos: { inicio: number; media: number | null }[] = [];
  for (let i = 0; i < contagens.length; i += bloco) {
    const fatia = contagens.slice(i, i + bloco).filter((v): v is number => v !== null);
    grupos.push({
      inicio: i,
      media: fatia.length === 0 ? null : fatia.reduce((a, b) => a + b, 0) / fatia.length,
    });
  }
  return grupos;
}
