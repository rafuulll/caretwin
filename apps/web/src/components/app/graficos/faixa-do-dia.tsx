import type { Faixa } from "@/lib/normal"
import { COR } from "./base"

/**
 * Onde o valor de agora cai em relação ao normal: uma régua com a faixa clara
 * e um marcador. É o desenho de "dentro ou fora" que se lê sem número.
 *
 * Fica escondida do leitor de tela de propósito: a mesma informação já está
 * escrita logo acima dela, no número e na frase do normal.
 */
export function FaixaDoDia({ valor, faixa, acimaEhBom = false }: { valor: number; faixa: Faixa; acimaEhBom?: boolean }) {
  const teto = Math.max(faixa.alto * 1.35, valor * 1.1, 1)
  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / teto) * 100))}%`
  // Passos acima do normal são boa notícia: o marcador fica na cor da série, e
  // só abaixo da faixa ganha o âmbar de atenção.
  const fora = valor < faixa.baixo || (valor > faixa.alto && !acimaEhBom)

  return (
    <div aria-hidden="true" className="relative mt-5 h-4">
      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-elevated" />
      <div
        className="absolute top-1/2 h-4 -translate-y-1/2 rounded-ds-fine"
        style={{
          left: pct(faixa.baixo),
          width: `calc(${pct(faixa.alto)} - ${pct(faixa.baixo)})`,
          background: COR.faixa,
          boxShadow: `inset 0 0 0 1px ${COR.bordaFaixa}`,
        }}
      />
      <div
        className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left: pct(valor), background: fora ? COR.fora : COR.serie }}
      />
    </div>
  )
}
