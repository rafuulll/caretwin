/*
  O que o CareTwin entende como coisas, estados e regras, declarado num lugar só.
  Nenhum componente escreve nome de estado ou limite na mão: tudo sai daqui.
*/

/** O que a pulseira mede e o app compara com o normal da pessoa. */
export const METRICAS = ["passos", "atividade", "sono", "batimentos"] as const;
export type Metrica = (typeof METRICAS)[number];

/** Um dia pode ficar abaixo ou acima do normal. Dentro do normal não gera alerta. */
export const DIRECOES = ["abaixo", "acima"] as const;
export type DirecaoDesvio = (typeof DIRECOES)[number];

/** Situação de um valor comparado com o normal, usada nos selos das telas. */
export const SITUACOES = ["abaixo", "dentro", "acima", "sem_dados"] as const;
export type Situacao = (typeof SITUACOES)[number];

/**
 * Alerta tem exatamente dois estados, então ele é um botão de marcar e não um quadro.
 * "lido" é o estado que significa que acabou.
 */
export const ESTADOS_ALERTA = ["novo", "lido"] as const;
export type EstadoAlerta = (typeof ESTADOS_ALERTA)[number];
export const ESTADO_ALERTA_FINAL: EstadoAlerta = "lido";

/** Regras do normal pessoal (o mesmo critério documentado no cartão 2.3 do Trello). */
export const REGRAS_NORMAL = {
  /** Quantos dias anteriores formam o normal. */
  janelaDias: 14,
  /** Mínimo de dias com dado para dizer que já existe um normal. */
  minimoDias: 5,
  /** Faixa do normal: do percentil 20 ao 80 dos dias da janela. */
  percentilBaixo: 0.2,
  percentilAlto: 0.8,
  /** A faixa ganha 10% de margem dos dois lados: variação pequena de um dia é normal. */
  margem: 0.1,
  /** Um dia só vira alerta quando foge da faixa por mais que esta folga. */
  folgaAlerta: 0.1,
} as const;

/** Bateria abaixo disso merece aviso na tela do dia. */
export const BATERIA_BAIXA = 20;

/** Sem sincronizar por mais que isso, o app avisa que o dado pode estar velho. */
export const MINUTOS_PARA_DADO_ANTIGO = 180;

/** Janela da noite que a pulseira envia: 840 minutos, das 20:00 às 10:00. */
export const NOITE = {
  minutos: 840,
  inicioHora: 20,
} as const;

/** Medição de batimentos de bancada: quanto tempo o app pede para a pessoa ficar parada. */
export const SEGUNDOS_MEDICAO = 12;

/**
 * A forma de ver cada coleção, decidida no PASSO 5 (veja DECISOES.md):
 * - pessoas e pulseiras: lista curta em Ajustes (são de 1 a 3);
 * - dias registrados: linha do tempo com a faixa do normal (Hoje e Sono);
 * - alertas: linha do tempo agrupada por dia, com marcar como lido;
 * - batimentos: histórico em pontos com a faixa de costume.
 */
export const FORMA_DE_VER = {
  pessoas: "lista-curta",
  pulseiras: "lista-curta",
  dias: "linha-do-tempo",
  alertas: "linha-do-tempo",
  batimentos: "historico-em-pontos",
} as const;
