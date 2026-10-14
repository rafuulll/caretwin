"use client"

import { sistema } from "@/content/site"
import type { MedicaoComDia } from "@/lib/consultas"
import { deISO, diaEMes, formatarDiaDoMes, horaDoCarimbo, somarDias } from "@/lib/formato"
import type { Faixa } from "@/lib/normal"
import { COR, Legenda, NumerosDoGrafico, escala, useLargura } from "./base"

const ALTURA = 180
const MARGEM = { topo: 12, base: 28, esquerda: 36, direita: 10 }
const DIAS = 14

/**
 * As medições dos últimos 14 dias como pontos no tempo, com a faixa de costume
 * atrás. Ponto, e não linha: as medições são soltas, feitas quando a pessoa
 * quis, e uma linha ligando duas medições inventaria o que aconteceu entre elas.
 */
export function GraficoMedicoes({ medicoes, faixa, hoje }: { medicoes: MedicaoComDia[]; faixa: Faixa | null; hoje: string }) {
  const { ref, largura } = useLargura<HTMLDivElement>()
  const textos = sistema.batimentos.historico
  const comum = sistema.comum

  const inicio = deISO(somarDias(hoje, -(DIAS - 1))).getTime()
  const fim = deISO(somarDias(hoje, 1)).getTime()
  const recentes = medicoes.filter((m) => new Date(m.em).getTime() >= inicio)

  const valores = recentes.map((m) => m.bpm)
  const minimo = Math.floor(Math.min(...valores, faixa?.baixo ?? 60) / 10) * 10 - 10
  const maximo = Math.ceil(Math.max(...valores, faixa?.alto ?? 90) / 10) * 10 + 10
  const x = escala([inicio, fim], [MARGEM.esquerda, largura - MARGEM.direita])
  const y = escala([minimo, maximo], [ALTURA - MARGEM.base, MARGEM.topo])
  const marcasY = [minimo + 10, Math.round((minimo + maximo) / 20) * 10, maximo - 10]
  const dias = Array.from({ length: DIAS }, (_, i) => somarDias(hoje, -(DIAS - 1) + i))

  return (
    <figure className="m-0">
      <div ref={ref} className="w-full">
        {largura > 0 && (
          <svg width={largura} height={ALTURA} role="img" aria-label={textos.rotulo}>
            {faixa && (
              <rect
                x={MARGEM.esquerda}
                width={largura - MARGEM.esquerda - MARGEM.direita}
                y={y(faixa.alto)}
                height={y(faixa.baixo) - y(faixa.alto)}
                fill={COR.faixa}
              />
            )}
            {marcasY.map((marca) => (
              <g key={marca}>
                <line x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(marca)} y2={y(marca)} stroke={COR.grade} />
                <text x={MARGEM.esquerda - 6} y={y(marca) + 4} textAnchor="end" fontSize={12} fill={COR.texto}>
                  {marca}
                </text>
              </g>
            ))}
            {dias.map((dia, indice) =>
              indice % 2 === 1 ? (
                <text
                  key={dia}
                  x={x(deISO(dia).getTime() + 12 * 3600000)}
                  y={ALTURA - 8}
                  textAnchor="middle"
                  fontSize={12}
                  fill={dia === hoje ? "var(--ds-ink)" : COR.texto}
                  fontWeight={dia === hoje ? 600 : 400}
                >
                  {dia === hoje ? comum.hoje : formatarDiaDoMes(dia)}
                </text>
              ) : null
            )}
            {recentes.map((medicao) => {
              const fora = faixa !== null && (medicao.bpm < faixa.baixo || medicao.bpm > faixa.alto)
              return (
                <circle
                  key={medicao.em}
                  cx={x(new Date(medicao.em).getTime())}
                  cy={y(medicao.bpm)}
                  r={5}
                  fill={fora ? COR.fora : COR.serie}
                  stroke={COR.superficie}
                  strokeWidth={2}
                >
                  <title>{`${diaEMes(medicao.data)}, ${horaDoCarimbo(medicao.em)}: ${medicao.bpm} ${textos.porMinuto}`}</title>
                </circle>
              )
            })}
          </svg>
        )}
      </div>
      <Legenda
        itens={[
          { rotulo: sistema.metricas.batimentos.nome, marca: "ponto" },
          { rotulo: comum.faixaDeCostume, marca: "faixa" },
          { rotulo: comum.foraDoNormal, marca: "fora" },
        ]}
      />
      <NumerosDoGrafico
        itens={recentes.map((m) => ({
          termo: `${diaEMes(m.data)}, ${horaDoCarimbo(m.em)}`,
          valor: `${m.bpm} ${textos.porMinuto}`,
        }))}
      />
    </figure>
  )
}
