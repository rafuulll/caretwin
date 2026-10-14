/*
  O normal pessoal: o coração do CareTwin.

  Em vez de comparar todo mundo com uma meta igual (10 mil passos), cada métrica é
  comparada com a faixa dos últimos 14 dias da própria pessoa (do percentil 20 ao 80,
  com 10% de margem dos dois lados).
  Um dia "foge do normal" quando sai dessa faixa por mais que a folga de 10%.
*/

import type { Alerta, Dados, DiaRegistrado } from "./types";
import { REGRAS_NORMAL, type DirecaoDesvio, type Metrica, type Situacao } from "./modelo";
import { estimarSono } from "./sono";
import { somarDias } from "./formato";

export type Faixa = {
  baixo: number;
  alto: number;
  mediana: number;
  /** Quantos dias formaram a faixa. */
  dias: number;
};

function percentil(valores: number[], p: number): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  if (ordenados.length === 1) return ordenados[0];
  const pos = (ordenados.length - 1) * p;
  const base = Math.floor(pos);
  const resto = pos - base;
  const proximo = ordenados[base + 1] ?? ordenados[base];
  return ordenados[base] + resto * (proximo - ordenados[base]);
}

function mediana(valores: number[]): number {
  return percentil(valores, 0.5);
}

/** O valor de uma métrica num dia, ou null quando a pulseira não contou nada. */
export function valorDoDia(dia: DiaRegistrado | undefined, metrica: Metrica): number | null {
  if (!dia) return null;
  switch (metrica) {
    case "passos":
      return dia.passos;
    case "atividade":
      return dia.minutosAtivos;
    case "sono": {
      if (!dia.noite) return null;
      const sono = estimarSono(dia.noite.contagens);
      return sono ? sono.minutosDormindo : null;
    }
    case "batimentos":
      return dia.batimentos.length ? Math.round(mediana(dia.batimentos.map((m) => m.bpm))) : null;
  }
}

/** Dias registrados de uma pessoa, indexados pela data. */
export function diasPorData(dias: DiaRegistrado[], pessoaId: string): Map<string, DiaRegistrado> {
  const mapa = new Map<string, DiaRegistrado>();
  for (const dia of dias) if (dia.pessoaId === pessoaId) mapa.set(dia.data, dia);
  return mapa;
}

/** A faixa normal da métrica, usando os 14 dias anteriores à data de referência. */
export function faixaNormal(porData: Map<string, DiaRegistrado>, metrica: Metrica, referencia: string): Faixa | null {
  const valores: number[] = [];
  for (let i = 1; i <= REGRAS_NORMAL.janelaDias; i++) {
    const valor = valorDoDia(porData.get(somarDias(referencia, -i)), metrica);
    if (valor !== null) valores.push(valor);
  }
  if (valores.length < REGRAS_NORMAL.minimoDias) return null;
  return {
    baixo: percentil(valores, REGRAS_NORMAL.percentilBaixo) * (1 - REGRAS_NORMAL.margem),
    alto: percentil(valores, REGRAS_NORMAL.percentilAlto) * (1 + REGRAS_NORMAL.margem),
    mediana: mediana(valores),
    dias: valores.length,
  };
}

export function situacao(valor: number | null, faixa: Faixa | null): Situacao {
  if (valor === null || faixa === null) return "sem_dados";
  if (valor < faixa.baixo) return "abaixo";
  if (valor > faixa.alto) return "acima";
  return "dentro";
}

/** Quanto o valor fugiu da faixa, em porcentagem da borda mais próxima. */
export function desvioPercentual(valor: number, faixa: Faixa): number {
  if (valor < faixa.baixo) return ((faixa.baixo - valor) / Math.max(faixa.baixo, 1)) * 100;
  if (valor > faixa.alto) return ((valor - faixa.alto) / Math.max(faixa.alto, 1)) * 100;
  return 0;
}

/*
  Como os passos se espalham ao longo do dia de quem tem rotina tranquila.
  Serve para comparar "passos até agora" com "o normal até este horário",
  em vez de assustar alguém às 9 da manhã porque ainda não andou o dia inteiro.
*/
const PESO_POR_HORA = [
  0, 0, 0, 0, 0, 0.5, 2, 5, 8, 9.5, 9.5, 8, 6, 5, 6, 7, 8, 7, 5, 4, 2.5, 1.5, 0.8, 0.2,
];
const SOMA_PESOS = PESO_POR_HORA.reduce((a, b) => a + b, 0);

/** Fração dos passos de um dia típico que já costuma ter acontecido neste horário. */
export function fracaoDoDia(agora: Date): number {
  const h = agora.getHours();
  const m = agora.getMinutes();
  let acumulado = 0;
  for (let i = 0; i < h; i++) acumulado += PESO_POR_HORA[i];
  acumulado += PESO_POR_HORA[h] * (m / 60);
  return Math.min(1, acumulado / SOMA_PESOS);
}

/** A faixa normal escalada para o horário atual. */
export function faixaAteAgora(faixa: Faixa, fracao: number): Faixa {
  return {
    baixo: faixa.baixo * fracao,
    alto: faixa.alto * fracao,
    mediana: faixa.mediana * fracao,
    dias: faixa.dias,
  };
}

/** Métricas que viram alerta em cada tipo de dia. Passos e atividade só com o dia fechado. */
const METRICAS_DE_DIA_FECHADO: Metrica[] = ["passos", "atividade", "sono", "batimentos"];
const METRICAS_DE_HOJE: Metrica[] = ["sono"];

export type CandidatoAlerta = {
  id: string;
  pessoaId: string;
  data: string;
  metrica: Metrica;
  direcao: DirecaoDesvio;
  desvio: number;
  valor: number;
  faixa: Faixa;
};

/**
 * Procura, nos últimos dias, os que fugiram do normal com folga.
 * O id é determinístico, então recalcular nunca duplica alerta nem perde o "lido".
 */
export function procurarDesvios(dados: Dados, hoje: string, diasParaTras = 10): CandidatoAlerta[] {
  const candidatos: CandidatoAlerta[] = [];
  for (const pessoa of dados.pessoas) {
    const porData = diasPorData(dados.dias, pessoa.id);
    for (let i = 0; i <= diasParaTras; i++) {
      const data = somarDias(hoje, -i);
      const dia = porData.get(data);
      if (!dia) continue;
      const metricas = i === 0 ? METRICAS_DE_HOJE : METRICAS_DE_DIA_FECHADO;
      for (const metrica of metricas) {
        const valor = valorDoDia(dia, metrica);
        const faixa = faixaNormal(porData, metrica, data);
        if (valor === null || faixa === null) continue;
        const sit = situacao(valor, faixa);
        if (sit !== "abaixo" && sit !== "acima") continue;
        const desvio = desvioPercentual(valor, faixa);
        if (desvio < REGRAS_NORMAL.folgaAlerta * 100) continue;
        candidatos.push({
          id: `${pessoa.id}:${data}:${metrica}`,
          pessoaId: pessoa.id,
          data,
          metrica,
          direcao: sit,
          desvio,
          valor,
          faixa,
        });
      }
    }
  }
  return candidatos;
}

/** Junta os alertas recalculados com os que já existiam, preservando o que já foi lido. */
export function mesclarAlertas(existentes: Alerta[], novos: Alerta[]): Alerta[] {
  const porId = new Map(existentes.map((a) => [a.id, a]));
  const resultado = novos.map((novo) => {
    const antigo = porId.get(novo.id);
    return antigo ? { ...novo, lido: antigo.lido, texto: antigo.texto, criadoEm: antigo.criadoEm } : novo;
  });
  return resultado.sort((a, b) => (a.data === b.data ? a.metrica.localeCompare(b.metrica) : b.data.localeCompare(a.data)));
}
