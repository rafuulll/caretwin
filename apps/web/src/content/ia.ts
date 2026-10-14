/*
  Respostas da IA simulada.

  Nesta versão a IA não roda de verdade: estes textos foram escritos à mão, com o
  vocabulário do CareTwin, e recebem os números reais do dia. No produto final o mesmo
  "fatos -> texto" é feito pela IA local (Ollama) chamada pela API, com este conteúdo
  como reserva quando o modelo não responder (o TemplateProvider da pasta ai/).

  Regra de tom: calmo, sem diagnóstico, sem urgência, sem recomendar remédio.
*/

import type { DirecaoDesvio, Metrica, Situacao } from "@/lib/modelo";
import { duracao, duracaoFalada, numero, plural } from "@/lib/formato";

export type FatosDoDia = {
  comoChamar: string;
  passos: number | null;
  passosBaixo: number | null;
  passosAlto: number | null;
  situacaoPassos: Situacao;
  sonoMinutos: number | null;
  sonoNormal: number | null;
  situacaoSono: Situacao;
  despertares: number | null;
  ultimoBpm: number | null;
  alertasNovos: number;
};

function faixaPassos(f: FatosDoDia): string {
  if (f.passosBaixo === null || f.passosAlto === null) return "";
  return `${numero(f.passosBaixo)} e ${numero(f.passosAlto)}`;
}

function fraseSono(f: FatosDoDia): string {
  if (f.sonoMinutos === null) return "A noite ainda não chegou completa da pulseira.";
  const base = `Dormiu cerca de ${duracao(f.sonoMinutos)}`;
  if (f.situacaoSono === "abaixo") return `${base}, menos do que costuma.`;
  if (f.situacaoSono === "acima") return `${base}, um pouco mais do que costuma.`;
  return `${base}, bem no ritmo de sempre.`;
}

function frasePassos(f: FatosDoDia): string {
  if (f.passos === null) return "Os passos de hoje ainda não chegaram.";
  const faixa = faixaPassos(f);
  switch (f.situacaoPassos) {
    case "abaixo":
      return `Até agora foram ${plural(f.passos, "passo", "passos")}, abaixo do que costuma ter neste horário (entre ${faixa}).`;
    case "acima":
      return `Até agora foram ${plural(f.passos, "passo", "passos")}, mais do que costuma ter neste horário.`;
    case "dentro":
      return `Até agora foram ${plural(f.passos, "passo", "passos")}, dentro do que costuma ter neste horário.`;
    default:
      return `Até agora foram ${plural(f.passos, "passo", "passos")}.`;
  }
}

/** Resumo do dia, para quem usa a pulseira. Entre 5 e 10 jeitos diferentes de contar. */
export const RESUMOS_DO_DIA: ((f: FatosDoDia) => string)[] = [
  (f) =>
    `${fraseSono(f)} ${frasePassos(f)} ${
      f.situacaoPassos === "abaixo" ? "Uma caminhada curta, no ritmo de sempre, já ajuda o dia a ficar parecido com os outros." : "Seguindo assim, o dia termina parecido com os outros."
    }`,
  (f) =>
    `Bom dia, ${f.comoChamar}. ${fraseSono(f)} ${frasePassos(f)} Nada aqui é diagnóstico: é só o seu dia comparado com o seu próprio jeito.`,
  (f) =>
    `${frasePassos(f)} ${fraseSono(f)} ${
      f.ultimoBpm ? `A última medição de batimentos marcou ${f.ultimoBpm} por minuto.` : "Ainda não houve medição de batimentos hoje."
    }`,
  (f) =>
    `Olhando para o seu normal dos últimos 14 dias: ${frasePassos(f).charAt(0).toLowerCase()}${frasePassos(f).slice(1)} ${fraseSono(f)}`,
  (f) =>
    `${f.comoChamar}, o dia está ${
      f.situacaoPassos === "abaixo" ? "mais calmo do que de costume" : f.situacaoPassos === "acima" ? "mais movimentado do que de costume" : "no seu ritmo"
    }. ${frasePassos(f)} ${fraseSono(f)}`,
  (f) =>
    `${fraseSono(f)} ${
      f.despertares && f.despertares > 2 ? `A pulseira percebeu ${plural(f.despertares, "despertar", "despertares")} durante a noite. ` : ""
    }${frasePassos(f)}`,
  (f) =>
    `Resumo rápido: ${frasePassos(f).charAt(0).toLowerCase()}${frasePassos(f).slice(1)} ${fraseSono(f)} ${
      f.alertasNovos > 0 ? `Há ${plural(f.alertasNovos, "aviso novo", "avisos novos")} para olhar com calma.` : "Nenhum aviso novo."
    }`,
];

/** Resumo para quem cuida, lido à noite. */
export const RESUMOS_PARA_QUEM_CUIDA: ((f: FatosDoDia) => string)[] = [
  (f) =>
    `${f.comoChamar} teve um dia ${
      f.situacaoPassos === "abaixo" ? "mais parado do que costuma" : "dentro do ritmo de sempre"
    }. ${frasePassos(f)} ${fraseSono(f)} ${
      f.alertasNovos > 0 ? `Vale uma ligação tranquila para perguntar como ${f.comoChamar} está.` : "Nada fora do comum para acompanhar hoje."
    }`,
  (f) =>
    `Para você que acompanha: ${frasePassos(f).charAt(0).toLowerCase()}${frasePassos(f).slice(1)} ${fraseSono(f)} ${
      f.alertasNovos > 0 ? `${plural(f.alertasNovos, "aviso pede", "avisos pedem")} atenção, sem urgência.` : "Nenhum aviso pede atenção."
    }`,
  (f) =>
    `${fraseSono(f)} ${frasePassos(f)} Se algo parecer diferente na conversa, anote: o padrão de vários dias diz mais do que um dia só.`,
  (f) =>
    `Hoje ${f.comoChamar} ${f.situacaoPassos === "abaixo" ? "andou menos do que costuma" : "manteve o ritmo de sempre"}. ${fraseSono(f)} ${
      f.ultimoBpm ? `Última medição: ${f.ultimoBpm} batimentos por minuto.` : ""
    }`,
  (f) =>
    `${frasePassos(f)} ${fraseSono(f)} ${
      f.alertasNovos > 0 ? "Os avisos abaixo explicam o que mudou." : "Os dias seguem parecidos entre si, o que é um bom sinal."
    }`,
];

const NOME_METRICA: Record<Metrica, string> = {
  passos: "nos passos",
  atividade: "no tempo em movimento",
  sono: "no sono",
  batimentos: "nos batimentos medidos",
};

function valorFalado(metrica: Metrica, valor: number): string {
  switch (metrica) {
    case "passos":
      return plural(valor, "passo", "passos");
    case "atividade":
      return plural(valor, "minuto ativo", "minutos ativos");
    case "sono":
      return duracaoFalada(valor);
    case "batimentos":
      return `${numero(valor)} batimentos por minuto`;
  }
}

type FatosAlerta = {
  comoChamar: string;
  metrica: Metrica;
  direcao: DirecaoDesvio;
  valor: number;
  baixo: number;
  alto: number;
  desvio: number;
};

function faixaFalada(f: FatosAlerta): string {
  if (f.metrica === "sono") return `entre ${valorFalado("sono", f.baixo)} e ${valorFalado("sono", f.alto)}`;
  return `entre ${numero(f.baixo)} e ${valorFalado(f.metrica, f.alto)}`;
}

/** Texto do alerta. Escolhido de forma fixa pelo id, para não mudar a cada visita. */
export const TEXTOS_DE_ALERTA: ((f: FatosAlerta) => string)[] = [
  (f) =>
    `${f.comoChamar} ficou ${f.direcao === "abaixo" ? "abaixo" : "acima"} do normal ${NOME_METRICA[f.metrica]}: ${valorFalado(
      f.metrica,
      f.valor,
    )}, quando o de costume é ${faixaFalada(f)}.`,
  (f) =>
    `${f.comoChamar} teve ${valorFalado(f.metrica, f.valor)} neste dia. Nos últimos 14 dias, o comum foi ${faixaFalada(f)}. ${
      f.direcao === "abaixo" ? "Vale perguntar como foi o dia." : "Pode ter sido um dia diferente, como uma visita ou um passeio."
    }`,
  (f) =>
    `Mudança ${NOME_METRICA[f.metrica]}: cerca de ${Math.round(f.desvio)}% ${
      f.direcao === "abaixo" ? "abaixo" : "acima"
    } da faixa de costume de ${f.comoChamar}. Um dia só não diz muito; se repetir, vale conversar.`,
];

/** Escolhe um índice estável a partir de um texto (o id do alerta). */
export function indiceEstavel(texto: string, tamanho: number): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h % tamanho;
}
