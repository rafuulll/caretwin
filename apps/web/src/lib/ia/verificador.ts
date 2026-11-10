import type { FatosDoAlerta, FatosDoDia } from "../respostas-ia"
import { ehBoaNoticia } from "../modelo"

/**
 * O verificador da saída da IA (cartão 6.2).
 *
 * A IA escreve a frase, mas quem sabe o que aconteceu é a regra do normal
 * (`normal.ts`). Antes de qualquer texto de modelo chegar a quem cuida, ele
 * passa por aqui: se contradiz os números, inventa um número, fala como
 * médico ou soa como alarme, é bloqueado e entra o texto de regra no lugar.
 *
 * As conferências são simples de propósito. Um verificador que ele mesmo
 * precisasse de IA para decidir seria mais uma coisa que pode errar; palavras
 * e números dão uma resposta que dá para explicar e testar.
 */

export type Veredito = { ok: true } | { ok: false; motivos: Motivo[] }

export type Motivo =
  | "vazio_ou_curto"
  | "longo_demais"
  | "formato_estranho"
  | "fala_de_modelo"
  | "nao_e_portugues"
  | "diagnostico"
  | "ordem_ao_usuario"
  | "tom_de_alarme"
  | "contradiz_a_direcao"
  | "numero_inventado"

const MINIMO = 40
const MAXIMO = 600
const MAXIMO_DE_FRASES = 5

/** Minúsculas e sem acento, para a conferência não depender de como o modelo escreveu. */
function limpar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

/** Dizer que NÃO é diagnóstico é o jeito certo de explicar; só o resto da palavra bloqueia. */
const NEGANDO_DIAGNOSTICO = /\b(nao e|nao eh|sem|nao faz|nao substitui|nao fecha)( um| o)? diagnostico/g

const DIAGNOSTICO = [
  /\bdiagnost\w*/,
  /\bdoenc\w*/,
  /\bdoente\w*/,
  /\bsintoma\w*/,
  /\bdepress\w*/,
  /\bansiedade\b/,
  /\bdemencia\b/,
  /\balzheimer\b/,
  /\bparkinson\b/,
  /\bcardiac\w*/,
  /\binfarto\b/,
  /\bavc\b/,
  /\bderrame\b/,
  /\bhipertens\w*/,
  /\bdiabet\w*/,
  /\barritmia\w*/,
  /\binsonia\b/,
  /\bapneia\b/,
  /\bpatolog\w*/,
  /\bmedic[oa]s?\b/,
  /\bmedicament\w*/,
  /\bmedicacao\b/,
  /\bremedio\w*/,
  /\btratament\w*/,
  /\breceita\b/,
  /\bdoses?\b/,
  /\bhospital\w*/,
  /\bpronto[- ]socorro\b/,
  /\bsamu\b/,
  /\binternar\b/,
  /\binternacao\b/,
]

/** O app sugere, no máximo, observar ou conversar. Mandar fazer algo é decidir pela pessoa. */
const ORDEM = [
  /\bvoce (deve|precisa|tem que)\b/,
  /\b(deve|devem|precisa|precisam) (ir|procurar|consultar|levar|ligar|chamar|tomar|parar)\b/,
  /\b(tem|tenha|tenham) que\b/,
  /\bprocure\b/,
  /\bconsulte\b/,
  /\bleve (ele|ela|a pessoa|o|a)\b/,
  /\bchame (um|uma|o|a)\b/,
  /\bligue (para|pro|pra) (um|uma|o|a|ajuda)\b/,
  /\bnao deixe\b/,
  /\bimediatamente\b/,
  /\bja!/,
]

const ALARME = [
  /\burgen\w*/,
  /\bemergenc\w*/,
  /\bgrave\w*/,
  /\bgravidade\b/,
  /\bperig\w*/,
  /\balarm\w*/,
  /\bpreocupant\w*/,
  /\bassustador\w*/,
  /\bcritic[oa]s?\b/,
  /\balerta vermelho\b/,
  /\brisco de\b/,
  /\batencao imediata\b/,
  /!!+/,
]

const FALA_DE_MODELO = [
  /\bcomo (uma )?(ia|inteligencia artificial|modelo)\b/,
  /\bmodelo de linguagem\b/,
  /\baqui esta\b/,
  /\bclaro[,!]/,
  /\bcom certeza[,!]/,
  /\bsou (uma )?(ia|assistente)\b/,
  /\bespero ter ajudado\b/,
]

/** Palavras que só fazem sentido para o outro lado do normal. */
const SO_PARA_ABAIXO = [
  /\bacima (do|de|da)\b/,
  /\baumentou\b/,
  /\bsubiu\b/,
  /\bandou mais\b/,
  /\bdormiu mais\b/,
  /\bmais (passos|horas|movimento|ativ\w*)\b/,
]
const SO_PARA_ACIMA = [
  /\babaixo (do|de|da)\b/,
  /\bcaiu\b/,
  /\bdiminuiu\b/,
  /\bandou menos\b/,
  /\bdormiu menos\b/,
  /\bmenos (passos|horas|movimento|ativ\w*)\b/,
]
const SO_PARA_BOA_NOTICIA = [/\bboa noticia\b/, /\bparabens\b/, /\botim[ao]s?\b/, /\bexcelente\b/, /\bbom sinal\b/]

function tem(padroes: RegExp[], texto: string) {
  return padroes.some((p) => p.test(texto))
}

/** Os números que o texto pode citar: só os que a regra calculou (e as constantes da regra). */
function numerosPermitidos(fatos: FatosDoAlerta) {
  const permitidos = new Set<number>([1, 2, 3, 7])
  const valores = [fatos.valor, fatos.normal]
  for (const v of valores) {
    permitidos.add(Math.round(v))
    permitidos.add(Math.round(v * 10) / 10)
    if (fatos.metrica === "sono") {
      // O sono fica em minutos e é falado em horas e minutos: "6 horas e 30 minutos".
      permitidos.add(Math.floor(v / 60))
      permitidos.add(Math.round(v % 60))
      permitidos.add(Math.round((v / 60) * 10) / 10)
    }
  }
  permitidos.add(Math.round(fatos.desvio))
  return permitidos
}

/** "7.350" são sete mil e trezentos; "6,5" são seis e meio. */
function lerNumero(bruto: string): number | null {
  const sem = bruto.replace(/[.,]+$/, "")
  if (/^\d{1,3}(\.\d{3})+$/.test(sem)) return Number(sem.replace(/\./g, ""))
  const n = Number(sem.replace(",", "."))
  return Number.isFinite(n) ? n : null
}

function bateComAlgum(n: number, permitidos: Set<number>) {
  for (const p of permitidos) {
    // Meia unidade de folga, ou 1,5%: "perto de 7.400" para 7.352 é arredondar, não inventar.
    if (Math.abs(n - p) <= Math.max(0.5, Math.abs(p) * 0.015)) return true
  }
  return false
}

/**
 * Confere um texto escrito por um modelo contra os fatos que a regra calculou.
 * `ok: false` traz TODOS os motivos achados, para o log e os testes dizerem o
 * que foi bloqueado sem guardar o texto.
 */
export function verificarTexto(texto: string, fatos: FatosDoAlerta): Veredito {
  const motivos: Motivo[] = []
  const bruto = texto.trim()
  const t = conferirForma(bruto, motivos)

  const boa = ehBoaNoticia(fatos.metrica, fatos.direcao)
  const contraria = fatos.direcao === "abaixo" ? SO_PARA_ABAIXO : SO_PARA_ACIMA
  if (tem(contraria, t)) motivos.push("contradiz_a_direcao")
  if (!boa && tem(SO_PARA_BOA_NOTICIA, t)) motivos.push("contradiz_a_direcao")

  conferirNumeros(bruto, numerosPermitidos(fatos), motivos)

  return motivos.length === 0 ? { ok: true } : { ok: false, motivos: [...new Set(motivos)] }
}

/**
 * As conferências que valem para qualquer texto da IA, de alerta ou de resumo:
 * tamanho, formato, português, diagnóstico, ordem, alarme e fala de modelo.
 * Devolve o texto já sem acento e em minúsculas, para as conferências de cada tipo.
 */
function conferirForma(bruto: string, motivos: Motivo[]): string {
  if (bruto.length < MINIMO) motivos.push("vazio_ou_curto")
  if (bruto.length > MAXIMO || (bruto.match(/[.!?](\s|$)/g) ?? []).length > MAXIMO_DE_FRASES) {
    motivos.push("longo_demais")
  }
  // Uma frase pronta para a tela: nada de lista, título, código, link ou tag.
  if (/[\n\r]|^[-*#>\d]+[.)\s]|[*_`#<>]|https?:|www\./.test(bruto)) motivos.push("formato_estranho")

  const t = limpar(bruto).replace(NEGANDO_DIAGNOSTICO, "")
  if (!/\b(de|do|da|que|em|com|para)\b/.test(t)) motivos.push("nao_e_portugues")
  if (tem(FALA_DE_MODELO, t)) motivos.push("fala_de_modelo")
  if (tem(DIAGNOSTICO, t)) motivos.push("diagnostico")
  if (tem(ORDEM, t)) motivos.push("ordem_ao_usuario")
  if (tem(ALARME, t)) motivos.push("tom_de_alarme")
  return t
}

/** Todo número escrito no texto precisa ser um dos que a regra calculou. */
function conferirNumeros(bruto: string, permitidos: Set<number>, motivos: Motivo[]) {
  for (const achado of bruto.match(/\d[\d.,]*/g) ?? []) {
    const n = lerNumero(achado)
    if (n === null || !bateComAlgum(n, permitidos)) {
      motivos.push("numero_inventado")
      return
    }
  }
}

/** Os números que o resumo do dia pode citar: passos, o normal deles, o sono (em horas e minutos), os batimentos e quantos alertas. */
function numerosDoDia(f: FatosDoDia) {
  const permitidos = new Set<number>([1, 2, 3, 7, f.alertasNovos])
  for (const v of [f.passos, f.normalDePassos]) if (v !== null) permitidos.add(Math.round(v))
  if (f.sono !== null) {
    permitidos.add(Math.floor(f.sono / 60))
    permitidos.add(Math.round(f.sono % 60))
    permitidos.add(Math.round((f.sono / 60) * 10) / 10)
  }
  if (f.ultimoBpm !== null) permitidos.add(Math.round(f.ultimoBpm))
  return permitidos
}

/**
 * Confere o resumo do dia escrito por um modelo (cartão 6.2, estendido ao
 * resumo). Além das conferências gerais, o texto não pode dizer que passos ou
 * sono ficaram para um lado que a regra não confirmou.
 */
export function verificarResumo(texto: string, fatos: FatosDoDia): Veredito {
  const motivos: Motivo[] = []
  const bruto = texto.trim()
  const t = conferirForma(bruto, motivos)

  const contradiz =
    (fatos.situacaoPassos !== "abaixo" && /\b(andou menos|menos passos|mais parado|passos abaixo)\b/.test(t)) ||
    (fatos.situacaoPassos !== "acima" && /\b(andou mais|mais passos|passos acima)\b/.test(t)) ||
    (fatos.situacaoSono !== "abaixo" && /\b(dormiu menos|menos (horas de )?sono|sono abaixo)\b/.test(t)) ||
    (fatos.situacaoSono !== "acima" && /\b(dormiu mais|mais (horas de )?sono|sono acima)\b/.test(t)) ||
    (fatos.alertasNovos === 0 && /\balertas? novos?\b/.test(t) && !/\b(nenhum|sem) alerta/.test(t))
  if (contradiz) motivos.push("contradiz_a_direcao")

  conferirNumeros(bruto, numerosDoDia(fatos), motivos)

  return motivos.length === 0 ? { ok: true } : { ok: false, motivos: [...new Set(motivos)] }
}
