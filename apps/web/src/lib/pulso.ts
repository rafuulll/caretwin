/**
 * O sinal infravermelho do sensor de batimentos vem com uma "base" enorme
 * (uns 100 mil quando o dedo está apoiado) e a batida é só uma ondinha de
 * poucas centenas em cima dela. No gráfico, a ondinha some. Aqui a base sai:
 * de cada leitura se tira a média das vizinhas, e sobra o que muda a cada batida.
 */

/** Abaixo disso o sensor não está vendo dedo (o mesmo limite do firmware). */
export const IR_MINIMO_COM_DEDO = 50_000

/**
 * A variação do sinal em torno da média das leituras vizinhas (`janela`
 * leituras no total, a 50 por segundo, 1 s). Só entram na média leituras com
 * dedo, e leitura sem dedo vira 0: o momento em que o dedo chega ou sai não vira
 * um pico que estica a escala do gráfico.
 */
export function pulsoDoSinal(ir: number[], janela = 50): number[] {
  const meia = Math.floor(janela / 2)
  return ir.map((valor, i) => {
    if (valor < IR_MINIMO_COM_DEDO) return 0
    let soma = 0
    let quantas = 0
    for (let j = Math.max(0, i - meia); j <= Math.min(ir.length - 1, i + meia); j++) {
      if (ir[j] >= IR_MINIMO_COM_DEDO) {
        soma += ir[j]
        quantas += 1
      }
    }
    return valor - soma / quantas
  })
}
