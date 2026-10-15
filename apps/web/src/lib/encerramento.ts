/**
 * O prazo e a frase do encerramento de um acompanhamento.
 *
 * Moram fora de `familia.ts` porque a tela também precisa deles (para mostrar
 * a frase exata, liberar o botão e dizer até quando dá para recuperar), e
 * `familia.ts` puxa o driver do banco, que não pode ir para o navegador. A
 * conferência que vale é a do servidor; a da tela é só ajuda.
 */

/** Quanto tempo quem encerrou tem para voltar atrás. A tarefa da migração 0004 usa o mesmo número. */
export const DIAS_PARA_RECUPERAR = 30

/** A frase que a pessoa escreve para encerrar. A tela mostra exatamente esta. */

export function fraseDeEncerramento(nome: string): string {
  return `Encerrar o acompanhamento de ${nome.trim()}`
}

/**
 * Compara sem maiúsculas, acentos, espaços a mais ou ponto final. A frase tem
 * que ser difícil de escrever sem querer, não difícil de acertar: quem usa
 * pode ser uma pessoa idosa digitando no celular.
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!]+$/u, "")
    .trim()
}

export function confirmacaoConfere(digitada: string, nome: string): boolean {
  return normalizar(digitada) === normalizar(fraseDeEncerramento(nome))
}
