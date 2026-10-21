"use client"

import { sistema } from "@/content/site"
import type { PontoDoDia } from "@/lib/consultas"
import { diaEMes, formatarDiaDoMes, formatarDiaDaSemanaCurto } from "@/lib/formato"
import { COR, Legenda, NumerosDoGrafico, escala, marcasRedondas, useLargura } from "./base"

const ALTURA = 200
const MARGEM = { topo: 12, base: 28, esquerda: 44, direita: 8 }

type Props = {
  pontos: PontoDoDia[]
  /** O nome do gráfico pra quem usa leitor de tela. */
  rotulo: string
  /** Valor como aparece na frase e no número: "4.210 passos", "7 h 05". */
  formatar: (valor: number) => string
  /** Valor curto do eixo: "4 mil", "7 h". */
  formatarEixo: (valor: number) => string
  /** O que dizer no lugar do valor de hoje, quando ele ainda não fechou. */
  semValorHoje: string
  /**
   * Distância fixa entre as linhas da grade. Horas de sono pedem grade de duas
   * em duas horas (120 minutos); a conta redonda de passos daria 200 minutos,
   * e "3 h" no eixo mentiria um pouco.
   */
  passoDoEixo?: number
  /**
   * Acima do normal é boa notícia neste gráfico (passos, `ehBoaNoticia`): a
   * barra acima da faixa fica na cor da série e só abaixo ganha o âmbar. O
   * verde de sucesso não entra aqui: ao lado do âmbar, os dois ficam quase
   * iguais para quem tem protanopia (validador da skill dataviz, ΔE 5).
   */
  acimaEhBom?: boolean
}

/**
 * Um dia por barra, cada uma com o normal que valia naquele dia por trás.
 *
 * A pergunta que este desenho responde é a que a contagem sozinha não
 * responde: a mudança é de um dia só, ou já são vários seguidos? É por isso
 * que ele existe ao lado do número grande, e não no lugar dele.
 */
export function GraficoDias({ pontos, rotulo, formatar, formatarEixo, semValorHoje, passoDoEixo, acimaEhBom = false }: Props) {
  const { ref, largura } = useLargura<HTMLDivElement>()
  const textos = sistema.comum

  const maximo = Math.max(
    1,
    ...pontos.map((p) => p.valor ?? 0),
    ...pontos.map((p) => p.faixa?.alto ?? 0)
  )
  const marcas = passoDoEixo
    ? Array.from({ length: Math.ceil(maximo / passoDoEixo) + 1 }, (_, i) => i * passoDoEixo)
    : marcasRedondas(maximo)
  const topo = marcas[marcas.length - 1]
  // A margem esquerda cresce com o rótulo mais comprido do eixo: com 44 px
  // fixos, "7,5 mil" perdia o 7 e virava ",5 mil". Uns 7 px por caractere no
  // corpo 12, mais o respiro até a grade.
  const esquerda = Math.max(MARGEM.esquerda, 14 + 7 * Math.max(...marcas.map((m) => formatarEixo(m).length)))
  const y = escala([0, topo], [ALTURA - MARGEM.base, MARGEM.topo])
  const larguraUtil = Math.max(0, largura - esquerda - MARGEM.direita)
  const fatia = pontos.length ? larguraUtil / pontos.length : 0
  const larguraBarra = Math.max(4, Math.min(22, fatia * 0.56))
  // Em tela estreita, um rótulo a cada dois dias: catorze números colados viram borrão.
  const pularRotulo = fatia < 34

  return (
    <figure className="m-0">
      <div ref={ref} className="w-full">
        {largura > 0 && (
          <svg width={largura} height={ALTURA} role="img" aria-label={rotulo}>
            {marcas.map((marca) => (
              <g key={marca}>
                <line
                  x1={esquerda}
                  x2={largura - MARGEM.direita}
                  y1={y(marca)}
                  y2={y(marca)}
                  stroke={COR.grade}
                  strokeWidth={1}
                />
                <text x={esquerda - 8} y={y(marca) + 4} textAnchor="end" fontSize={12} fill={COR.texto}>
                  {formatarEixo(marca)}
                </text>
              </g>
            ))}

            {pontos.map((ponto, indice) => {
              const centro = esquerda + fatia * indice + fatia / 2
              const fora = ponto.situacao === "abaixo" || (ponto.situacao === "acima" && !acimaEhBom)
              return (
                <g key={ponto.data}>
                  {ponto.faixa && (
                    <rect
                      x={centro - fatia / 2 + 1}
                      width={Math.max(0, fatia - 2)}
                      y={y(ponto.faixa.alto)}
                      height={Math.max(0, y(ponto.faixa.baixo) - y(ponto.faixa.alto))}
                      fill={COR.faixa}
                    />
                  )}
                  {ponto.valor !== null && (
                    <rect
                      x={centro - larguraBarra / 2}
                      width={larguraBarra}
                      y={y(ponto.valor)}
                      height={Math.max(0, y(0) - y(ponto.valor))}
                      rx={Math.min(4, larguraBarra / 2)}
                      fill={fora ? COR.fora : COR.serie}
                    >
                      <title>{`${diaEMes(ponto.data)}: ${formatar(ponto.valor)}`}</title>
                    </rect>
                  )}
                  {(!pularRotulo || (pontos.length - 1 - indice) % 2 === 0) && (
                    <text
                      x={centro}
                      y={ALTURA - 8}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={ponto.hoje ? 600 : 400}
                      fill={ponto.hoje ? "var(--ds-ink)" : COR.texto}
                    >
                      {ponto.hoje ? textos.hoje : formatarDiaDoMes(ponto.data)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      <Legenda
        itens={[
          { rotulo: textos.faixaDeCostume, marca: "faixa" },
          { rotulo: acimaEhBom ? sistema.situacoes.abaixo : textos.foraDoNormal, marca: "fora" },
        ]}
      />

      <NumerosDoGrafico
        itens={pontos.map((ponto) => ({
          termo: ponto.hoje
            ? textos.hoje
            : `${formatarDiaDaSemanaCurto(ponto.data)}, ${diaEMes(ponto.data)}`,
          valor:
            ponto.valor === null
              ? ponto.hoje
                ? semValorHoje
                : textos.semDado
              : `${formatar(ponto.valor)}, ${(acimaEhBom && ponto.situacao === "acima"
                  ? sistema.maisAtivo
                  : sistema.situacoes[ponto.situacao]
                ).toLowerCase()}`,
        }))}
      />
    </figure>
  )
}
