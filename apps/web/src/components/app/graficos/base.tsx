"use client"

import { useEffect, useRef, useState } from "react"
import { sistema } from "@/content/site"

/**
 * As peças comuns dos gráficos do CareTwin.
 *
 * Os gráficos são SVG escrito à mão com as variáveis do design system: nenhuma
 * biblioteca de gráfico, porque barras e pontos de uma série só não pagam o
 * peso de uma, e o SVG acompanha o tema sozinho. As regras valem pra todos:
 * uma série por gráfico, a faixa do normal como lavagem clara atrás, grade fina,
 * texto sempre na cor de texto e nunca na cor da série, e o mesmo conteúdo em
 * texto num `dl` pra quem usa leitor de tela.
 */

/** A largura real do contêiner. O SVG é desenhado em pixel de verdade, e não esticado. */
export function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [largura, setLargura] = useState(0)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return
    const observador = new ResizeObserver(([entrada]) => setLargura(Math.round(entrada.contentRect.width)))
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return { ref, largura }
}

export function escala(dominio: [number, number], faixa: [number, number]) {
  const [d0, d1] = dominio
  const [r0, r1] = faixa
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0)
  return (v: number) => r0 + (v - d0) * k
}

/** Marcas redondas do eixo (0, 2.000, 4.000...), pra grade não cair em número quebrado. */
export function marcasRedondas(maximo: number, quantas = 3) {
  if (maximo <= 0) return [0]
  const bruto = maximo / quantas
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((o) => o >= bruto) ?? bruto
  const marcas: number[] = []
  for (let v = 0; v <= maximo + passo * 0.001; v += passo) marcas.push(Math.round(v))
  if (marcas[marcas.length - 1] < maximo) marcas.push(marcas[marcas.length - 1] + passo)
  return marcas
}

/** As cores dos gráficos, todas derivadas do design system. */
export const COR = {
  serie: "var(--ds-primary-accent)",
  fora: "var(--ds-warning)",
  faixa: "color-mix(in srgb, var(--ds-primary) 9%, transparent)",
  bordaFaixa: "color-mix(in srgb, var(--ds-primary) 22%, transparent)",
  grade: "var(--ds-hairline)",
  texto: "var(--ds-ink-muted)",
  superficie: "var(--ds-surface)",
} as const

/**
 * O gêmeo do gráfico em texto: os mesmos números, num `dl`, atrás de um
 * `details`. Fechado ele não ocupa a tela de quem enxerga o desenho; aberto,
 * ele é o gráfico inteiro pra quem não enxerga.
 */
export function NumerosDoGrafico({ itens }: { itens: { termo: string; valor: string }[] }) {
  return (
    <details className="group mt-3">
      <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-ds px-1 text-sm font-medium text-ink underline decoration-hairline underline-offset-4 hover:decoration-ink">
        {sistema.comum.verNumeros}
      </summary>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-ds-fine border border-hairline bg-surface p-3 text-sm">
        {itens.map((item) => (
          <div key={item.termo} className="contents">
            <dt className="text-muted">{item.termo}</dt>
            <dd className="tabular-nums text-ink">{item.valor}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}

/** A legenda: a marca ao lado do texto carrega a identidade, nunca a cor do texto. */
export function Legenda({ itens }: { itens: { rotulo: string; marca: "barra" | "faixa" | "fora" | "ponto" }[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
      {itens.map((item) => (
        <li key={item.rotulo} className="inline-flex items-center gap-2">
          <svg aria-hidden="true" width="16" height="12" viewBox="0 0 16 12">
            {item.marca === "barra" && <rect x="5" y="1" width="6" height="10" rx="1.5" fill={COR.serie} />}
            {item.marca === "ponto" && <circle cx="8" cy="6" r="4" fill={COR.serie} />}
            {item.marca === "faixa" && (
              <rect x="0.5" y="1.5" width="15" height="9" rx="2" fill={COR.faixa} stroke={COR.bordaFaixa} />
            )}
            {item.marca === "fora" && <rect x="5" y="1" width="6" height="10" rx="1.5" fill={COR.fora} />}
          </svg>
          {item.rotulo}
        </li>
      ))}
    </ul>
  )
}
