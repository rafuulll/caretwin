"use client"

import { sistema } from "@/content/site"
import { NOITE } from "@/lib/modelo"
import { horaDaNoite, noiteEmBlocos, type SonoEstimado } from "@/lib/sono"
import { COR, Legenda, escala, useLargura } from "./base"

const ALTURA = 160
const MARGEM = { topo: 8, base: 26, esquerda: 8, direita: 8 }
/** As horas marcadas no eixo, em minutos desde as 20h: 20h, 22h, 0h ... 10h. */
const MARCAS = [0, 120, 240, 360, 480, 600, 720, 840]

/**
 * O movimento da noite, em blocos de 10 minutos, com o tempo de sono estimado
 * pintado por trás.
 *
 * Os números da noite já estão escritos no cartão ao lado (dormiu, pegou no
 * sono, acordou, acordou no meio), então este desenho é complemento do texto e
 * não a única fonte dele: quem não enxerga o gráfico não perde informação.
 */
export function GraficoNoite({ contagens, sono }: { contagens: (number | null)[]; sono: SonoEstimado }) {
  const { ref, largura } = useLargura<HTMLDivElement>()
  const textos = sistema.sono.movimento
  const blocos = noiteEmBlocos(contagens)
  const maximo = Math.max(20, ...blocos.map((b) => b.media ?? 0))
  const x = escala([0, NOITE.minutos], [MARGEM.esquerda, largura - MARGEM.direita])
  const y = escala([0, maximo], [ALTURA - MARGEM.base, MARGEM.topo])
  const larguraBloco = Math.max(1, (x(10) - x(0)) * 0.7)

  return (
    <figure className="m-0">
      <div ref={ref} className="w-full">
        {largura > 0 && (
          <svg width={largura} height={ALTURA} role="img" aria-label={textos.rotulo}>
            <rect
              x={x(sono.inicio)}
              width={Math.max(0, x(sono.fim) - x(sono.inicio))}
              y={MARGEM.topo}
              height={ALTURA - MARGEM.topo - MARGEM.base}
              fill={COR.faixa}
              rx={4}
            />
            <line
              x1={MARGEM.esquerda}
              x2={largura - MARGEM.direita}
              y1={y(0)}
              y2={y(0)}
              stroke={COR.grade}
            />
            {blocos.map((bloco) =>
              bloco.media === null ? null : (
                <rect
                  key={bloco.inicio}
                  x={x(bloco.inicio + 5) - larguraBloco / 2}
                  width={larguraBloco}
                  y={y(bloco.media)}
                  height={Math.max(1, y(0) - y(bloco.media))}
                  rx={1}
                  fill={COR.serie}
                  opacity={0.75}
                />
              )
            )}
            {MARCAS.map((minuto) => (
              <text
                key={minuto}
                x={Math.min(Math.max(x(minuto), MARGEM.esquerda + 14), largura - MARGEM.direita - 14)}
                y={ALTURA - 6}
                textAnchor="middle"
                fontSize={12}
                fill={COR.texto}
              >
                {horaDaNoite(minuto).replace(":00", "h")}
              </text>
            ))}
          </svg>
        )}
      </div>
      <Legenda
        itens={[
          { rotulo: textos.dormindo, marca: "faixa" },
          { rotulo: textos.movimento, marca: "barra" },
        ]}
      />
    </figure>
  )
}
