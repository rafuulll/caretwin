/**
 * Formatação de data, hora, duração e número em pt-BR.
 *
 * REGRA DE OURO DESTE ARQUIVO: nada aqui converte para UTC.
 *
 * O app guarda data como `"2026-07-28"` e hora como `"14:30"`. São strings
 * locais, do jeito que a pessoa digitou no formulário. `new Date("2026-07-28")` seria
 * lido como meia-noite em UTC e, num fuso negativo como o do Brasil, voltaria
 * dia 27 às 21h: o passo de hoje apareceria na conta de ontem. Por isso
 * toda data é montada por componentes (ano, mês, dia) e toda conta de horário é
 * feita em minutos, sobre a string.
 */

/** Data no formato `AAAA-MM-DD`. */
export type DataISO = string
/** Hora no formato `HH:MM`, 24 horas. */
export type HoraISO = string

const MINUTOS_NO_DIA = 24 * 60

function doisDigitos(n: number) {
  return String(n).padStart(2, "0")
}

/** Só a primeira letra. O resto vem do Intl e já está certo ("terça-feira"). */
function comInicialMaiuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** O Intl em pt-BR devolve "ter." e "jul." com ponto; na interface o ponto só polui. */
function semPontoFinal(texto: string) {
  return texto.replace(/\.$/, "")
}

// --- conversão entre string e Date ----------------------------------------

/** `Date` na meia-noite LOCAL do dia informado. */
export function deISO(iso: DataISO): Date {
  const [ano, mes, dia] = iso.split("-").map(Number)
  return new Date(ano, mes - 1, dia)
}

export function paraISO(data: Date): DataISO {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

export function hoje(): DataISO {
  return paraISO(new Date())
}

export function ehHoje(iso: DataISO) {
  return iso === hoje()
}

export function ehPassado(iso: DataISO) {
  return iso < hoje()
}

export function ehFimDeSemana(iso: DataISO) {
  const diaDaSemana = deISO(iso).getDay()
  return diaDaSemana === 0 || diaDaSemana === 6
}

// --- aritmética de dias e semanas ------------------------------------------

export function somarDias(iso: DataISO, dias: number): DataISO {
  const data = deISO(iso)
  data.setDate(data.getDate() + dias)
  return paraISO(data)
}

/** Segunda-feira da semana que contém `iso`. A semana brasileira começa nela. */
export function inicioDaSemana(iso: DataISO): DataISO {
  const data = deISO(iso)
  // getDay(): 0 é domingo. O `+ 6) % 7` reancora a contagem na segunda.
  const desdeSegunda = (data.getDay() + 6) % 7
  return somarDias(iso, -desdeSegunda)
}

/** Os sete dias, de segunda a domingo, a partir de uma segunda-feira. */
export function diasDaSemana(inicioISO: DataISO): DataISO[] {
  return Array.from({ length: 7 }, (_, indice) => somarDias(inicioISO, indice))
}

// --- datas por extenso -----------------------------------------------------

const nomeDiaCurto = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
const nomeDiaLongo = new Intl.DateTimeFormat("pt-BR", { weekday: "long" })
const mesLongo = new Intl.DateTimeFormat("pt-BR", { month: "long" })
const mesCurto = new Intl.DateTimeFormat("pt-BR", { month: "short" })
const dataNumerica = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})
const dataLongaComDiaDaSemana = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

/** "28/07/2026" */
export function formatarData(iso: DataISO) {
  return dataNumerica.format(deISO(iso))
}

/** "Terça-feira, 28 de julho de 2026" */
export function formatarDataPorExtenso(iso: DataISO) {
  return comInicialMaiuscula(dataLongaComDiaDaSemana.format(deISO(iso)))
}

/** "Ter" */
export function formatarDiaDaSemanaCurto(iso: DataISO) {
  return comInicialMaiuscula(semPontoFinal(nomeDiaCurto.format(deISO(iso))))
}

/** "terça-feira" */
export function formatarDiaDaSemana(iso: DataISO) {
  return nomeDiaLongo.format(deISO(iso))
}

/** "28", o número do dia, pro cabeçalho da coluna. */
export function formatarDiaDoMes(iso: DataISO) {
  return String(deISO(iso).getDate())
}

/** "jul", o mês abreviado, pro quadradinho de calendário de uma lista. */
export function mesAbreviado(iso: DataISO) {
  return semPontoFinal(mesCurto.format(deISO(iso)))
}

/*
  Atalhos de nome curto para os MESMOS formatos acima (`dataCurta` é
  literalmente `formatarData`).

  As duas famílias de nome existem porque as telas foram escritas em paralelo.
  Use a que ler melhor no seu componente. Só não crie uma terceira.
*/
export const dataCurta = formatarData
export const dataPorExtenso = formatarDataPorExtenso
export const diaDoMes = formatarDiaDoMes

/**
 * Intervalo de uma semana, o mais curto que continue sem ambiguidade:
 * "27 a 31 de julho de 2026", "27 de jul a 2 de ago de 2026" ou
 * "29 de dez de 2025 a 4 de jan de 2026".
 */
export function formatarIntervaloDeDatas(inicioISO: DataISO, fimISO: DataISO) {
  const inicio = deISO(inicioISO)
  const fim = deISO(fimISO)

  if (inicio.getFullYear() !== fim.getFullYear()) {
    return `${inicio.getDate()} de ${semPontoFinal(mesCurto.format(inicio))} de ${inicio.getFullYear()} a ${fim.getDate()} de ${semPontoFinal(mesCurto.format(fim))} de ${fim.getFullYear()}`
  }

  if (inicio.getMonth() !== fim.getMonth()) {
    return `${inicio.getDate()} de ${semPontoFinal(mesCurto.format(inicio))} a ${fim.getDate()} de ${semPontoFinal(mesCurto.format(fim))} de ${fim.getFullYear()}`
  }

  return `${inicio.getDate()} a ${fim.getDate()} de ${mesLongo.format(fim)} de ${fim.getFullYear()}`
}

// --- horas -----------------------------------------------------------------

function horaParaMinutos(hora: HoraISO) {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}

function minutosParaHora(minutos: number): HoraISO {
  // Um horário que atravessa a meia-noite volta para o começo do dia em vez
  // de virar "25:30". O relógio dá a volta, o horário não estoura.
  const normalizado = ((minutos % MINUTOS_NO_DIA) + MINUTOS_NO_DIA) % MINUTOS_NO_DIA
  return `${doisDigitos(Math.floor(normalizado / 60))}:${doisDigitos(normalizado % 60)}`
}

/** Horário final a partir do inicial e da duração em minutos. */
export function somarMinutos(hora: HoraISO, minutos: number): HoraISO {
  return minutosParaHora(horaParaMinutos(hora) + minutos)
}

/** "10:00". Normaliza o campo `hora` antes de exibir ("9:5" vira "09:05"). */
export function horaMinuto(hora: HoraISO): string {
  const [h, m] = hora.split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return ""
  return minutosParaHora(h * 60 + m)
}

/** `datetime` de um `<time>`: "2026-07-28T14:30". */
export function paraAtributoDateTime(iso: DataISO, hora: HoraISO) {
  return `${iso}T${hora}`
}

// --- números ---------------------------------------------------------------

const numeroSimples = new Intl.NumberFormat("pt-BR")
const proporcao = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 })

/** "1.240", milhar com ponto, sem casa decimal inventada. */
export function numero(valor: number) {
  return Number.isFinite(valor) ? numeroSimples.format(valor) : ""
}

/** Recebe a fração (`0.33`) e devolve "33%". */
export function porcentagem(fracao: number) {
  return Number.isFinite(fracao) ? proporcao.format(fracao) : ""
}

/** "1 alerta" / "3 alertas". Os substantivos vêm do `site.ts`, nunca daqui. */
export function contar(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}

// --- carimbos de criação ---------------------------------------------------

/**
 * `criadoEm` é o único campo que guarda ISO completo com fuso (o `Date.now()` de
 * quem cadastrou). Convertemos para o dia LOCAL antes de formatar, senão a regra
 * de ouro lá de cima seria furada justamente aqui.
 */
export function formatarCarimbo(carimbo: string) {
  return formatarData(paraISO(new Date(carimbo)))
}

// --- texto, contato e busca -------------------------------------------------

export function apenasDigitos(texto: string) {
  return texto.replace(/\D/g, "")
}

/**
 * Máscara progressiva de telefone brasileiro: "(11) 98844-2130".
 *
 * Aceita fixo (10 dígitos) e celular (11), porque os dois aparecem na agenda de
 * qualquer negócio. O hífen anda uma casa quando entra o nono dígito. É por
 * isso que o corte é calculado em vez de fixo.
 */
export function formatarTelefone(entrada: string) {
  const digitos = apenasDigitos(entrada).slice(0, 11)
  if (digitos.length === 0) return ""
  if (digitos.length <= 2) return `(${digitos}`

  const corte = digitos.length > 10 ? 7 : 6
  if (digitos.length <= corte) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, corte)}-${digitos.slice(corte)}`
}

/** DDD mais 8 dígitos (fixo) ou 9 (celular). */
export function telefoneCompleto(texto: string) {
  const total = apenasDigitos(texto).length
  return total === 10 || total === 11
}

/**
 * Checagem prática, não a RFC 5322.
 *
 * O objetivo é pegar erro de digitação na hora, não recusar endereço exótico.
 * Um e-mail que passa aqui e não existe só se descobre enviando mensagem.
 */
export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

/** "Marina Alvarenga" → "MA". Primeiro e último nome, para o avatar. */
export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ""

  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ""
  return (primeira + ultima).toLocaleUpperCase("pt-BR")
}

/**
 * Normaliza para comparar em busca: minúsculas e sem acento.
 *
 * Quem digita "otavio" com pressa espera achar "Otávio". Obrigar o acento
 * transforma a busca num teste de ortografia.
 */
export function chaveDeBusca(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
}

// --- duração, horário e tempo decorrido -------------------------------------

/** Minutos desde a meia-noite viram "06:10". */
export function minutoParaHora(minutos: number): HoraISO {
  return minutosParaHora(Math.round(minutos))
}

/** "7 h 05", o formato curto de duração que cabe num número de manchete. */
export function duracao(minutos: number) {
  const total = Math.max(0, Math.round(minutos))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  return `${h} h ${doisDigitos(m)}`
}

/** "7 horas e 5 minutos", a mesma duração dita por extenso, pra frase e pra leitor de tela. */
export function duracaoFalada(minutos: number) {
  const total = Math.max(0, Math.round(minutos))
  const h = Math.floor(total / 60)
  const m = total % 60
  const horas = h === 1 ? "1 hora" : `${h} horas`
  const mins = m === 1 ? "1 minuto" : `${m} minutos`
  if (h === 0) return mins
  if (m === 0) return horas
  return `${horas} e ${mins}`
}

/** A hora local de um carimbo com fuso: "14:30". */
export function horaDoCarimbo(carimbo: string) {
  const data = new Date(carimbo)
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`
}

/** O dia local de um carimbo com fuso, no formato `AAAA-MM-DD`. */
export function diaDoCarimbo(carimbo: string): DataISO {
  return paraISO(new Date(carimbo))
}

/**
 * "agora há pouco", "há 18 min", "há 3 h", "ontem", "há 4 dias".
 *
 * O "agora" vem de fora de propósito: quem chama lê o relógio uma vez só para a
 * tela inteira, e duas leituras no mesmo render poderiam discordar entre si.
 */
export function tempoDesde(carimbo: string, agora: Date) {
  const minutos = Math.floor((agora.getTime() - new Date(carimbo).getTime()) / 60000)
  if (minutos < 2) return "agora há pouco"
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias === 1) return "ontem"
  return `há ${dias} dias`
}

/** "13 de out", dia e mês curtos, pro eixo de um gráfico. */
export function diaEMes(iso: DataISO) {
  return `${deISO(iso).getDate()} de ${mesAbreviado(iso)}`
}

/**
 * Troca os `{marcadores}` de uma frase do `site.ts` pelos valores. A frase
 * inteira continua no arquivo de copy, e o componente só passa os números.
 */
export function preencher(texto: string, valores: Record<string, string | number>) {
  return texto.replace(/\{(\w+)\}/g, (inteiro, chave: string) =>
    chave in valores ? String(valores[chave]) : inteiro
  )
}
