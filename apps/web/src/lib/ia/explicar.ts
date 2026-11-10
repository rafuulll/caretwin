import { ehBoaNoticia } from "../modelo"
import {
  indiceFixo,
  RESUMOS_DO_DIA,
  textosDoAlerta,
  valorFalado,
  type FatosDoAlerta,
  type FatosDoDia,
} from "../respostas-ia"
import { duracaoFalada, numero } from "../formato"
import { configDoOllama, pedirAoOllama, type ConfigDoOllama } from "./ollama"
import { verificarResumo, verificarTexto, type Motivo, type Veredito } from "./verificador"

/**
 * A explicação de um alerta em linguagem natural (cartão 6.3).
 *
 * O fluxo é sempre o mesmo, e o final é sempre um texto bom:
 *   1. a regra do normal já calculou os fatos (valor, normal, desvio);
 *   2. o modelo escreve a frase a partir deles;
 *   3. o verificador (6.2) confere a frase contra os fatos;
 *   4. reprovou, o modelo caiu ou não existe: entra o texto de regra.
 *
 * Quem recebe o resultado nunca vê um erro. No máximo vê `origem: "regra"`, e a
 * tela trata isso como um texto normal, não como falha.
 */

export type Explicacao =
  | { texto: string; origem: "ia"; modelo: string }
  | { texto: string; origem: "regra"; motivo: "sem_modelo" | "modelo_falhou" | "reprovado"; bloqueios?: Motivo[] }

const INSTRUCOES = `Você escreve uma explicação curta, em português do Brasil, para uma pessoa que acompanha alguém querido (muitas vezes idosa) por uma pulseira de passos, sono e batimentos.
Regras que valem sempre:
- Escreva de 2 a 3 frases, em um único parágrafo, sem listas, títulos, emoji ou formatação.
- Use somente os números que receber. Nunca invente, some ou compare outros números.
- Diga para que lado o dia fugiu do normal (abaixo ou acima) exatamente como recebeu.
- Não faça diagnóstico, não cite doenças, remédios, médicos ou hospital, e não mande a pessoa fazer nada.
- Tom calmo e gentil, sem urgência e sem alarme. No máximo, sugira observar os próximos dias ou conversar com quem cuida.
- Se for uma boa notícia, conte com alegria, sem prometer nada sobre saúde.`

/** O que o modelo recebe: só os fatos, já escritos do jeito que devem aparecer. */
export function pedidoDoAlerta(f: FatosDoAlerta): string {
  const metrica = { passos: "passos", sono: "sono", batimentos: "batimentos" }[f.metrica]
  return [
    `Pessoa acompanhada: ${f.nome}`,
    `O que mudou: ${metrica}`,
    `Para que lado do normal: ${f.direcao === "abaixo" ? "abaixo" : "acima"}${ehBoaNoticia(f.metrica, f.direcao) ? " (boa notícia)" : ""}`,
    `Valor no dia mais recente: ${valorFalado(f.metrica, f.valor)}`,
    `O normal da pessoa: ${valorFalado(f.metrica, f.normal)}`,
    `Distância do normal: cerca de ${f.desvio}%`,
    "Escreva a explicação.",
  ].join("\n")
}

/** O texto de regra: o mesmo sorteio fixo de `alertas.ts`, então o alerta e a reserva dizem a mesma coisa. */
export function textoDeRegra(fatos: FatosDoAlerta, chave: string): string {
  const textos = textosDoAlerta(fatos.metrica, fatos.direcao)
  return textos[indiceFixo(chave, textos.length)](fatos)
}

export type Dependencias = {
  config?: ConfigDoOllama | null
  /** Trocável nos testes: devolve o texto que o "modelo" escreveu, ou lança erro. */
  pedir?: (config: ConfigDoOllama, instrucoes: string, pedido: string) => Promise<string>
}

/** Até duas tentativas: o modelo pequeno às vezes erra um número e acerta na segunda. */
const TENTATIVAS = 2

export async function explicarAlerta(fatos: FatosDoAlerta, chave: string, deps: Dependencias = {}): Promise<Explicacao> {
  return escreverComModelo(
    INSTRUCOES,
    pedidoDoAlerta(fatos),
    (texto) => verificarTexto(texto, fatos),
    () => textoDeRegra(fatos, chave),
    deps
  )
}

const INSTRUCOES_DO_RESUMO = `Você escreve o resumo do dia, em português do Brasil, para uma pessoa que acompanha alguém querido (muitas vezes idosa) por uma pulseira de passos, sono e batimentos. Ela lê à noite, com calma.
Regras que valem sempre:
- Escreva de 3 a 4 frases, em um único parágrafo, sem listas, títulos, emoji ou formatação.
- Use somente os números que receber. Nunca invente, some ou compare outros números.
- Diga se passos e sono ficaram abaixo, dentro ou acima do costume exatamente como recebeu. Se algo ainda não chegou da pulseira, diga que ainda não chegou.
- Se houver alertas novos, diga só que estão logo abaixo, sem repetir o conteúdo deles.
- Não faça diagnóstico, não cite doenças, remédios, médicos ou hospital, e não mande a pessoa fazer nada.
- Tom calmo e gentil, sem urgência e sem alarme.`

const SITUACAO = { abaixo: "abaixo do costume", dentro: "dentro do costume", acima: "acima do costume", aprendendo: "ainda aprendendo o costume" }

/** O que o modelo recebe do dia: só os fatos, já escritos do jeito que devem aparecer. */
export function pedidoDoResumo(f: FatosDoDia): string {
  return [
    `Pessoa acompanhada: ${f.nome}`,
    f.passos === null
      ? "Passos de hoje: ainda não chegaram da pulseira"
      : `Passos de hoje até agora: ${numero(f.passos)}${f.normalDePassos !== null ? ` (o normal até este horário é perto de ${numero(Math.round(f.normalDePassos))})` : ""}, ${SITUACAO[f.situacaoPassos]}`,
    f.sono === null
      ? "Sono da última noite: ainda não chegou da pulseira"
      : `Sono da última noite: ${duracaoFalada(f.sono)}, ${SITUACAO[f.situacaoSono]}`,
    f.ultimoBpm === null ? "Batimentos: nenhuma medição hoje" : `Última medição de batimentos: ${f.ultimoBpm} por minuto`,
    `Alertas novos: ${f.alertasNovos}`,
    "Escreva o resumo do dia.",
  ].join("\n")
}

/** O resumo do dia, no mesmo fluxo da explicação: modelo, conferência e, se preciso, o texto de regra. */
export async function resumirDia(fatos: FatosDoDia, chave: string, deps: Dependencias = {}): Promise<Explicacao> {
  return escreverComModelo(
    INSTRUCOES_DO_RESUMO,
    pedidoDoResumo(fatos),
    (texto) => verificarResumo(texto, fatos),
    () => RESUMOS_DO_DIA[indiceFixo(chave, RESUMOS_DO_DIA.length)](fatos),
    deps
  )
}

async function escreverComModelo(
  instrucoes: string,
  pedido: string,
  verificar: (texto: string) => Veredito,
  reserva: () => string,
  { config = configDoOllama(), pedir = pedirAoOllama }: Dependencias
): Promise<Explicacao> {
  if (!config) return { texto: reserva(), origem: "regra", motivo: "sem_modelo" }

  let bloqueios: Motivo[] | undefined
  for (let i = 0; i < TENTATIVAS; i++) {
    let texto: string
    try {
      texto = (await pedir(config, instrucoes, pedido)).trim()
    } catch {
      return { texto: reserva(), origem: "regra", motivo: "modelo_falhou" }
    }
    const veredito = verificar(texto)
    if (veredito.ok) return { texto, origem: "ia", modelo: config.modelo }
    bloqueios = veredito.motivos
  }
  return { texto: reserva(), origem: "regra", motivo: "reprovado", bloqueios }
}
