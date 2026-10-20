/**
 * O que o CareTwin guarda, os estados de cada coisa e as regras do normal, num
 * lugar só. Nenhum componente escreve nome de estado, limite ou regra na mão:
 * quando um número daqui muda, o app inteiro acompanha em vez de passar a
 * contar errado em silêncio.
 */

/** Os cadastros do app, na ordem em que aparecem no dia de quem usa. */
export const CADASTROS = ["pessoas", "pulseiras", "dias", "alertas"] as const
export type Cadastro = (typeof CADASTROS)[number]

/**
 * O que o app compara com o normal da pessoa. Passos e sono vêm sozinhos da
 * pulseira; batimentos vêm das medições que a pessoa pede.
 */
export const METRICAS = ["passos", "sono", "batimentos"] as const
export type Metrica = (typeof METRICAS)[number]

/** Um dia fora do normal fica abaixo ou acima dele. */
export const DIRECOES = ["abaixo", "acima"] as const
export type Direcao = (typeof DIRECOES)[number]

/** Como um valor fica perto do normal. Usado nos selos, sempre com ícone e texto. */
export const SITUACOES = ["abaixo", "dentro", "acima", "aprendendo"] as const
export type Situacao = (typeof SITUACOES)[number]

/**
 * O alerta tem exatamente dois estados: chegou e ninguém viu, ou já foi visto.
 * Dois estados são um botão de marcar, nunca um quadro.
 */
export const ESTADOS_ALERTA = ["novo", "lido"] as const
export type EstadoAlerta = (typeof ESTADOS_ALERTA)[number]
/** O estado que significa que o alerta já cumpriu o papel dele. */
export const ESTADO_ALERTA_FINAL: EstadoAlerta = "lido"

/**
 * A regra do normal pessoal, a mesma que o time fechou no cartão 2.3.
 *
 * Para cada dia de referência: os 3 dias mais recentes são comparados com a
 * média dos 7 dias anteriores a eles. A base fica ANTES dos dias recentes de
 * propósito: se a mudança entrasse na média, ela puxaria o normal junto e
 * deixaria de parecer mudança.
 */
export const REGRA_NORMAL = {
  /** Quantos dias formam a base do normal. */
  diasBase: 7,
  /** Quantos dias recentes são olhados para decidir se houve mudança. */
  diasRecentes: 3,
  /** Quanto um dia pode variar em torno do normal e continuar dentro dele. */
  variacao: 0.2,
  /** Quantos dos dias recentes precisam fugir na mesma direção para virar alerta. */
  diasParaAlerta: 2,
  /** Com menos dias válidos na base, o app diz que ainda está aprendendo. */
  minimoDiasValidos: 5,
} as const

/** Quantos dias de uso a pessoa precisa para o normal existir: recentes mais o mínimo da base. */
export const DIAS_PARA_CONHECER_O_NORMAL = REGRA_NORMAL.diasRecentes + REGRA_NORMAL.minimoDiasValidos

/** Bateria nesta porcentagem ou abaixo pede carregar a pulseira. */
export const BATERIA_BAIXA = 20

/** Sem sincronizar por mais que isso, a tela avisa que o dado pode estar atrasado. */
export const MINUTOS_PARA_DADO_ATRASADO = 180

/**
 * Com conta, de quanto em quanto tempo o app relê os dias enquanto está aberto
 * e à vista. A pulseira sincroniza de 3 em 3 horas (de 3 em 3 minutos na
 * simulação), então 5 minutos mostram o dia novo cedo sem martelar o banco.
 */
export const MINUTOS_PARA_RELER_A_CONTA = 5

/** A janela da noite que a pulseira envia: 840 minutos, das 20h às 10h. */
export const NOITE = {
  minutos: 840,
  inicioHora: 20,
} as const

/**
 * O que a API aceita da pulseira (cartão 5.5). Fora disso o dado é recusado,
 * nunca gravado com um valor que ninguém andou de verdade.
 * - passosPorDia: o teto do contrato v0.2 (DayRecord.steps).
 * - contagemPorMinuto: 3000 amostras por minuto no firmware (ct_params.h);
 *   a contagem da noite é parte delas, então não passa disso.
 * - diasNoFuturo e primeiroDia: uma pulseira sem relógio acertado manda datas
 *   impossíveis; um dia depois de amanhã ou antes do projeto é recusado.
 */
export const LIMITES_DA_PULSEIRA = {
  passosPorDia: 60000,
  minutosAtivosPorDia: 1440,
  contagemPorMinuto: 3000,
  diasPorEnvio: 31,
  diasNoFuturo: 1,
  primeiroDia: "2025-01-01",
} as const

/** Quanto tempo a medição de batimentos pede para a pessoa ficar parada. */
export const SEGUNDOS_MEDICAO = 12

/**
 * A forma de ver cada coleção, decidida a partir dos momentos (veja o
 * DECISOES.md). Nenhuma delas é quadro por etapas nem painel de indicadores.
 */
export const FORMA_DE_VER = {
  /** De 1 a 3 pessoas por cuidador: troca no topo, sem lista com busca. */
  pessoas: "troca-no-topo",
  /** Uma por pessoa: tela única, mostrada como estado no painel e no sono. */
  pulseiras: "tela-unica",
  /** O dia contra o normal, e os últimos 14 dias numa linha do tempo. */
  dias: "linha-do-tempo",
  /** Lidos à noite, agrupados por dia, do mais novo para o mais antigo. */
  alertas: "linha-do-tempo",
} as const
