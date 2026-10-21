/**
 * As respostas da IA de exemplo.
 *
 * Nesta versão a IA não roda de verdade. Estes textos foram escritos para o
 * CareTwin, recebem os números reais de cada pessoa e são sorteados a cada
 * clique, sem repetir nas primeiras vezes. Quando a API do CareTwin chamar a IA
 * local (Ollama), é ela que escreve, e estes textos ficam como reserva para
 * quando o modelo não responder.
 *
 * A régua do tom vale pra qualquer texto novo que entrar aqui: calmo, sem
 * diagnóstico, sem urgência, sem remédio. No máximo, sugerir observar ou
 * conversar com quem cuida.
 */

import { ehBoaNoticia, type Direcao, type Metrica } from "./modelo"
import { duracaoFalada, numero } from "./formato"

/** O que a IA sabe de um alerta: só os números que o normal já calculou. */
export type FatosDoAlerta = {
  nome: string
  metrica: Metrica
  direcao: Direcao
  valor: number
  normal: number
  desvio: number
}

const NA_METRICA: Record<Metrica, string> = {
  passos: "nos passos",
  sono: "no sono",
  batimentos: "nos batimentos medidos",
}

function valorFalado(metrica: Metrica, valor: number) {
  if (metrica === "passos") return `${numero(Math.round(valor))} passos`
  if (metrica === "sono") return duracaoFalada(valor)
  return `${numero(Math.round(valor))} batimentos por minuto`
}

function lado(direcao: Direcao) {
  return direcao === "abaixo" ? "abaixo" : "acima"
}

/** Cinco jeitos de explicar a mesma mudança. O sorteio é fixo por alerta, então o texto não muda a cada visita. */
export const TEXTOS_DE_ALERTA: ((f: FatosDoAlerta) => string)[] = [
  (f) =>
    `${f.nome} ficou ${lado(f.direcao)} do normal ${NA_METRICA[f.metrica]} em dois dos últimos três dias. No dia mais recente foram ${valorFalado(f.metrica, f.valor)}, e o de costume é perto de ${valorFalado(f.metrica, f.normal)}.`,
  (f) =>
    `Os últimos dias de ${f.nome} estão diferentes ${NA_METRICA[f.metrica]}: cerca de ${f.desvio}% ${lado(f.direcao)} do que costuma ser. Um dia só não diz muito, mas dois seguidos valem uma conversa tranquila.`,
  (f) =>
    f.direcao === "abaixo"
      ? `${f.nome} vem tendo menos ${f.metrica === "sono" ? "horas de sono" : f.metrica === "passos" ? "passos" : "batimentos"} do que o próprio normal. Vale perguntar como foram esses dias, sem pressa.`
      : `${f.nome} vem tendo mais ${f.metrica === "sono" ? "horas de sono" : f.metrica === "passos" ? "passos" : "batimentos"} do que costuma. Pode ser uma visita, um passeio ou uma rotina diferente nesses dias.`,
  (f) =>
    `Mudança ${NA_METRICA[f.metrica]}: ${valorFalado(f.metrica, f.valor)} no dia mais recente, quando o normal de ${f.nome} fica perto de ${valorFalado(f.metrica, f.normal)}. Se continuar assim nos próximos dias, vale observar junto.`,
  (f) =>
    `Comparado com a própria semana anterior, ${f.nome} ficou ${lado(f.direcao)} do normal ${NA_METRICA[f.metrica]}. Não é diagnóstico: é só o dia comparado com o próprio jeito de sempre.`,
]

/**
 * As frases de boa notícia: passos acima do normal (`ehBoaNoticia`). Contam o
 * que mudou com alegria, sem prometer nada sobre saúde. O normal é a média dos
 * dias ANTES dos 3 recentes, então os dias de agora ainda não entraram nele:
 * por isso "se continuar, o normal sobe junto", e não "a média já subiu".
 */
export const TEXTOS_DE_BOA_NOTICIA: ((f: FatosDoAlerta) => string)[] = [
  (f) =>
    `${f.nome} andou mais que o de costume em dois dos últimos três dias: ${valorFalado(f.metrica, f.valor)} no dia mais recente, quando o normal fica perto de ${valorFalado(f.metrica, f.normal)}. Se continuar assim, o normal de ${f.nome} sobe junto.`,
  (f) =>
    `Boa notícia: ${f.nome} teve mais movimento nos últimos dias, cerca de ${f.desvio}% acima do próprio normal de passos.`,
  (f) =>
    `Os últimos dias de ${f.nome} tiveram mais passos que o de costume. Pode ser um passeio, uma visita ou uma rotina nova, e vale contar a ${f.nome} que isso foi notado.`,
  (f) =>
    `Mais movimento: ${valorFalado(f.metrica, f.valor)} no dia mais recente, acima do normal de ${f.nome}, que fica perto de ${valorFalado(f.metrica, f.normal)}. Se o ritmo continuar, o normal acompanha e sobe junto.`,
  (f) =>
    `Comparado com a própria semana anterior, ${f.nome} andou cerca de ${f.desvio}% a mais. Um bom sinal de movimento, e o normal sobe junto se o ritmo continuar.`,
]

/** A lista de frases certa para a mudança: boa notícia ou mudança a observar. */
export function textosDoAlerta(metrica: Metrica, direcao: Direcao) {
  return ehBoaNoticia(metrica, direcao) ? TEXTOS_DE_BOA_NOTICIA : TEXTOS_DE_ALERTA
}

/** O que a IA sabe do dia, pra escrever o resumo de quem cuida. */
export type FatosDoDia = {
  nome: string
  passos: number | null
  normalDePassos: number | null
  situacaoPassos: "abaixo" | "dentro" | "acima" | "aprendendo"
  sono: number | null
  situacaoSono: "abaixo" | "dentro" | "acima" | "aprendendo"
  ultimoBpm: number | null
  alertasNovos: number
}

function frasePassos(f: FatosDoDia) {
  if (f.passos === null) return "Os passos de hoje ainda não chegaram da pulseira."
  const base = `Até agora foram ${numero(f.passos)} passos`
  if (f.situacaoPassos === "abaixo") return `${base}, menos do que costuma ter neste horário.`
  if (f.situacaoPassos === "acima") return `${base}, mais do que costuma ter neste horário.`
  if (f.situacaoPassos === "dentro") return `${base}, dentro do que costuma ter neste horário.`
  return `${base}.`
}

function fraseSono(f: FatosDoDia) {
  if (f.sono === null) return "A noite ainda não chegou inteira da pulseira."
  const base = `A noite teve cerca de ${duracaoFalada(f.sono)} de sono`
  if (f.situacaoSono === "abaixo") return `${base}, menos do que costuma.`
  if (f.situacaoSono === "acima") return `${base}, um pouco mais do que costuma.`
  return `${base}, no ritmo de sempre.`
}

function fraseAlertas(f: FatosDoDia) {
  if (f.alertasNovos === 0) return "Nenhum alerta novo hoje."
  if (f.alertasNovos === 1) return "Tem um alerta novo logo abaixo, explicado com calma."
  return `Tem ${f.alertasNovos} alertas novos logo abaixo, explicados com calma.`
}

/** Sete resumos do dia, escritos pra quem acompanha e lê à noite. */
export const RESUMOS_DO_DIA: ((f: FatosDoDia) => string)[] = [
  (f) => `${f.nome} teve um dia ${f.situacaoPassos === "abaixo" ? "mais parado do que costuma" : "no ritmo de sempre"}. ${frasePassos(f)} ${fraseSono(f)} ${fraseAlertas(f)}`,
  (f) => `Pra você que acompanha ${f.nome}: ${fraseSono(f).charAt(0).toLowerCase()}${fraseSono(f).slice(1)} ${frasePassos(f)} ${fraseAlertas(f)}`,
  (f) => `${fraseSono(f)} ${frasePassos(f)} Se algo parecer diferente numa conversa, vale anotar: o jeito de vários dias diz mais do que um dia só.`,
  (f) => `Hoje ${f.nome} ${f.situacaoPassos === "abaixo" ? "andou menos do que costuma" : "manteve o ritmo de sempre"}. ${fraseSono(f)} ${f.ultimoBpm ? `A última medição de batimentos marcou ${f.ultimoBpm} por minuto.` : "Ninguém pediu medição de batimentos hoje."}`,
  (f) => `${frasePassos(f)} ${fraseSono(f)} ${f.alertasNovos > 0 ? `Uma ligação tranquila pra perguntar como ${f.nome} está costuma ajudar mais do que qualquer número.` : "Os dias seguem parecidos entre si, e isso é um bom sinal."}`,
  (f) => `Resumo do dia de ${f.nome}, em poucas linhas. ${frasePassos(f)} ${fraseSono(f)} ${fraseAlertas(f)}`,
  (f) => `${f.nome} ${f.situacaoSono === "abaixo" ? "dormiu menos do que de costume" : "dormiu como de costume"}, e o dia ${f.situacaoPassos === "abaixo" ? "foi mais calmo" : "seguiu normal"}. ${frasePassos(f)} ${fraseAlertas(f)}`,
]

/** Um índice fixo a partir de um texto: o mesmo alerta sempre ganha o mesmo jeito de ser contado. */
export function indiceFixo(texto: string, tamanho: number) {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return h % tamanho
}
