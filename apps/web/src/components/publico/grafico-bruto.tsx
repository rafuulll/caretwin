import { numero } from "@/lib/formato"

export type SerieBruta = {
  nome: string
  cor: string
  /** Traço da linha: o leitor que não separa as cores separa pelo desenho. */
  traco?: string
  valores: number[]
}

const LARGURA = 600
const ALTURA = 150
const MARGEM = 6

/**
 * Um gráfico de linhas que anda: mostra as últimas `pontos` leituras, com a
 * mais nova na direita. SVG puro, sem biblioteca: são no máximo 500 pontos por
 * linha, desenhados uma vez por segundo.
 *
 * A escala acompanha o que está na tela (com uma folga), exceto quando a
 * página passa `minimo` e `maximo`. O texto embaixo traz o valor mais recente
 * de cada linha, para que ninguém dependa só da cor.
 */
export function GraficoBruto({
  titulo,
  ajuda,
  unidade,
  series,
  pontos,
  casas = 2,
  simetrico = false,
}: {
  titulo: string
  ajuda: string
  unidade: string
  series: SerieBruta[]
  pontos: number
  casas?: number
  /** Centra a escala em zero (giroscópio): o repouso fica no meio. */
  simetrico?: boolean
}) {
  const todos = series.flatMap((s) => s.valores)
  let minimo = todos.length ? Math.min(...todos) : 0
  let maximo = todos.length ? Math.max(...todos) : 1
  if (simetrico) {
    const limite = Math.max(Math.abs(minimo), Math.abs(maximo), 1)
    minimo = -limite
    maximo = limite
  }
  if (maximo - minimo < 1e-9) {
    minimo -= 1
    maximo += 1
  }
  const folga = (maximo - minimo) * 0.08
  minimo -= folga
  maximo += folga

  const x = (i: number, n: number) => MARGEM + ((LARGURA - 2 * MARGEM) * (pontos - n + i)) / Math.max(pontos - 1, 1)
  const y = (v: number) => MARGEM + (ALTURA - 2 * MARGEM) * (1 - (v - minimo) / (maximo - minimo))
  const rotuloDoValor = (v: number) => numero(Number(v.toFixed(casas)))

  return (
    <figure className="rounded-ds-surface border border-hairline bg-surface p-4">
      <figcaption className="mb-2">
        <span className="block text-base text-ink">
          {titulo} <span className="text-sm text-muted">({unidade})</span>
        </span>
        <span className="block text-sm text-muted">{ajuda}</span>
      </figcaption>
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="h-auto w-full" role="img" aria-label={`${titulo}, ${unidade}`}>
        {minimo < 0 && maximo > 0 && (
          <line x1={MARGEM} x2={LARGURA - MARGEM} y1={y(0)} y2={y(0)} stroke="var(--ds-hairline, #dce4f1)" strokeWidth="1" />
        )}
        <rect x="0.5" y="0.5" width={LARGURA - 1} height={ALTURA - 1} fill="none" stroke="var(--ds-hairline, #dce4f1)" />
        {series.map((s) =>
          s.valores.length > 1 ? (
            <polyline
              key={s.nome}
              fill="none"
              stroke={s.cor}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.traco}
              vectorEffect="non-scaling-stroke"
              points={s.valores.map((v, i) => `${x(i, s.valores.length).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
            />
          ) : null
        )}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted" aria-hidden="true">
        <span>{rotuloDoValor(minimo)}</span>
        <span>{rotuloDoValor(maximo)}</span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink">
        {series.map((s) => {
          const ultimo = s.valores.at(-1)
          return (
            <li key={s.nome} className="flex items-center gap-2">
              <svg width="26" height="8" aria-hidden="true">
                <line x1="0" x2="26" y1="4" y2="4" stroke={s.cor} strokeWidth="2.5" strokeDasharray={s.traco} />
              </svg>
              <span>
                {s.nome}
                {ultimo !== undefined && <span className="text-muted"> {rotuloDoValor(ultimo)}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
