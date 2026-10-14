/*
  O modelo de dados do CareTwin, com as palavras do produto.

  Quatro coleções, todas ligadas a uma pessoa:
  - Pessoa: quem usa a pulseira. Um cuidador acompanha de 1 a 3.
  - Pulseira: o aparelho no pulso dessa pessoa, com bateria e última sincronização.
  - DiaRegistrado: o que a pulseira contou de um dia (passos, minutos ativos, a noite
    que terminou naquela manhã e as medições de batimentos pedidas no dia).
  - Alerta: quando um dia foge do normal da pessoa, com o texto em palavras simples.

  O "normal" de cada pessoa não é guardado: ele é recalculado a partir dos dias
  registrados mais recentes (src/lib/normal.ts), para nunca ficar desatualizado.
  Estes tipos espelham o contrato da API em docs/openapi.yaml, então trocar o
  armazenamento local pela API não muda nenhuma tela.
*/

import type { DirecaoDesvio, Metrica } from "./modelo";

export type Pessoa = {
  id: string;
  nome: string;
  /** Como a pessoa gosta de ser chamada no app ("Dona Cida"). */
  comoChamar: string;
  idadeAproximada: number | null;
  /** Quem acompanha essa pessoa à distância ("Marina, filha"). */
  quemAcompanha: string;
  criadoEm: string;
};

export type Pulseira = {
  id: string;
  pessoaId: string;
  /** Código impresso na pulseira, o mesmo que o firmware usa como token de dispositivo. */
  codigo: string;
  bateria: number;
  versao: string;
  ultimaSincronizacao: string | null;
};

export type MedicaoBatimentos = {
  /** Instante da medição, ISO 8601. */
  em: string;
  bpm: number;
};

/**
 * A noite que terminou na manhã deste dia.
 * Segue o contrato da pulseira: 840 minutos a partir das 20:00 da véspera
 * (até 10:00 do dia), um número de movimentos por minuto, e null quando não há dado.
 */
export type NoiteRegistrada = {
  inicio: string;
  contagens: (number | null)[];
};

export type DiaRegistrado = {
  id: string;
  pessoaId: string;
  /** "AAAA-MM-DD" no horário local. */
  data: string;
  passos: number;
  minutosAtivos: number;
  noite: NoiteRegistrada | null;
  batimentos: MedicaoBatimentos[];
};

export type Alerta = {
  id: string;
  pessoaId: string;
  data: string;
  metrica: Metrica;
  direcao: DirecaoDesvio;
  /** Quanto o dia fugiu do normal, em porcentagem (sempre positivo). */
  desvio: number;
  texto: string;
  lido: boolean;
  criadoEm: string;
};

export type Dados = {
  versao: 1;
  /**
   * "exemplos" enquanto só existem os dados de exemplo (eles se renovam a cada dia, para o
   * "hoje" continuar sendo hoje). Vira "proprio" assim que alguém cadastra uma pessoa.
   */
  origem: "exemplos" | "proprio";
  /** Dia em que os dados de exemplo foram gerados ("AAAA-MM-DD"). */
  geradoEm: string;
  pessoas: Pessoa[];
  pulseiras: Pulseira[];
  dias: DiaRegistrado[];
  alertas: Alerta[];
};

/** A sessão local. Continua igual quando o login de verdade for ligado. */
export type Sessao = {
  nome: string;
  entrouEm: string;
};

export type Preferencias = {
  tema: "claro" | "escuro" | "sistema";
  texto: "padrao" | "grande";
  /** Pessoa que o app mostra agora, quando quem entrou acompanha mais de uma. */
  pessoaAtivaId: string | null;
};
