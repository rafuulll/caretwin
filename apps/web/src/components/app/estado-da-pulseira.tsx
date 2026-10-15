import { Card } from "@/components/ui"
import { sistema } from "@/content/site"
import { cn } from "@/lib/cn"
import type { EstadoDaPulseira } from "@/lib/consultas"
import { horaDoCarimbo, preencher, tempoDesde } from "@/lib/formato"
import { Icone } from "./icone"

const textos = sistema.comum.pulseira

/**
 * A pulseira em duas leituras: a bateria e quando os dados chegaram.
 *
 * Aparece no painel (o momento de conferir a bateria durante o dia) e no sono
 * (o momento de ver se a pulseira sincronizou de manhã). Os dois números moram
 * num `dl`: o leitor de tela ouve "Bateria: 64%" em vez de dois textos soltos.
 */
export function EstadoDaPulseiraCartao({
  estado,
  agora,
  className,
}: {
  estado: EstadoDaPulseira
  agora: Date
  className?: string
}) {
  return (
    <Card className={cn("p-5", className)}>
      <h2 className="flex items-center gap-2 text-base text-ink">
        <Icone nome="pulseira" className="size-5 text-[var(--ds-primary-accent)]" />
        {preencher(textos.titulo, { codigo: estado.codigo })}
      </h2>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-muted">{textos.bateria}</dt>
          <dd className="mt-1 flex items-center gap-2">
            <Icone
              nome={estado.bateriaBaixa ? "bateria-baixa" : "bateria"}
              className={cn("size-6", estado.bateriaBaixa ? "text-warning" : "text-ink")}
            />
            {estado.bateria === null ? (
              <span className="text-base text-muted">{sistema.comum.semDado}</span>
            ) : (
              <span className="font-display text-2xl tabular-nums text-ink">{estado.bateria}%</span>
            )}
          </dd>
          {estado.bateriaBaixa && (
            <dd className="mt-1 text-sm font-medium text-warning">{textos.bateriaBaixa}</dd>
          )}
        </div>

        <div>
          <dt className="text-sm text-muted">{textos.sincronizou}</dt>
          {estado.ultimaSincronizacao ? (
            <>
              <dd className="mt-1 font-display text-2xl tabular-nums text-ink">
                {horaDoCarimbo(estado.ultimaSincronizacao)}
              </dd>
              <dd className={cn("mt-1 text-sm", estado.atrasada ? "font-medium text-warning" : "text-muted")}>
                {tempoDesde(estado.ultimaSincronizacao, agora)}
              </dd>
            </>
          ) : (
            <dd className="mt-1 text-base text-ink">{textos.nunca}</dd>
          )}
        </div>
      </dl>

      {estado.atrasada && (
        <p className="mt-4 flex gap-2 rounded-ds-fine border border-warning/25 bg-warning/10 px-3 py-2.5 text-sm text-ink">
          <Icone nome="info" className="mt-0.5 size-4 shrink-0 text-warning" />
          {textos.atrasada}
        </p>
      )}
    </Card>
  )
}
