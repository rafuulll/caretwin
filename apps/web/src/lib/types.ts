/**
 * O modelo de dados do CareTwin.
 *
 * Quatro coisas, porque são as quatro que aparecem no dia de quem usa:
 *
 *   PESSOA: quem usa a pulseira. Um cuidador acompanha de 1 a 3.
 *   PULSEIRA: uma por pessoa. É dela que vêm a bateria e a hora em que os
 *     dados chegaram pela última vez.
 *   DIA REGISTRADO: o que a pulseira contou num dia: os passos, o movimento da
 *     noite (é dele que sai a estimativa de sono) e as medições de batimentos
 *     que a pessoa pediu.
 *   ALERTA: quando os dias recentes fogem do normal da pessoa, com o texto que
 *     explica a mudança em palavras simples.
 *
 * O normal de cada pessoa não é guardado: ele é calculado a partir dos dias
 * registrados, em `src/lib/normal.ts`, sempre com a regra de `modelo.ts`.
 * Guardar o normal seria guardar uma conta que fica velha no dia seguinte.
 */

import type { Direcao, Metrica } from "./modelo"

/** Data no formato `AAAA-MM-DD`, sempre no dia local. */
export type DataISO = string

export type Pessoa = {
  id: string
  /** Do jeito que a família chama: "Dona Cida", "Seu Jorge". */
  nome: string
  /** Quem acompanha esta pessoa à distância. É quem lê o resumo à noite. */
  quemAcompanha: string
  criadoEm: string
}

export type Pulseira = {
  id: string
  /** O código impresso atrás da pulseira, no formato CT-XXXX. */
  codigo: string
  pessoaId: string
  /** De 0 a 100. */
  bateria: number
  /** `null` enquanto a pulseira nunca mandou nada. */
  ultimaSincronizacao: string | null
}

export type MedicaoBatimentos = {
  /** Data e hora da medição, com fuso. */
  em: string
  bpm: number
}

/**
 * O movimento da noite: uma contagem por minuto, das 20h da véspera às 10h do
 * dia. `null` é minuto sem dado, como quando a pulseira saiu do pulso.
 */
export type Noite = {
  inicio: string
  contagens: (number | null)[]
}

export type DiaRegistrado = {
  id: string
  pessoaId: string
  data: DataISO
  /** `null` enquanto a pulseira ainda não mandou os passos deste dia. */
  passos: number | null
  /** A noite que terminou na manhã deste dia. */
  noite: Noite | null
  batimentos: MedicaoBatimentos[]
}

export type Alerta = {
  id: string
  pessoaId: string
  /** O dia em que a mudança ficou clara. */
  data: DataISO
  metrica: Metrica
  direcao: Direcao
  /** Quanto, em porcentagem, os dias recentes ficaram longe do normal. */
  desvio: number
  /** A explicação em palavras simples. Escrita pela IA (nesta versão, de exemplo). */
  texto: string
  lido: boolean
  criadoEm: string
}

export type Dados = {
  pessoas: Pessoa[]
  pulseiras: Pulseira[]
  dias: DiaRegistrado[]
  alertas: Alerta[]
}

export type Sessao = {
  nome: string
  email: string
  entrouEm: string
}
