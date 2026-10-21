import { Card } from "@/components/ui"
import { sistema } from "@/content/site"
import type { PassosDeHoje } from "@/lib/consultas"
import { numero, preencher } from "@/lib/formato"
import { FaixaDoDia } from "../graficos/faixa-do-dia"
import { Icone } from "../icone"
import { SeloSituacao } from "../selo-situacao"

const textos = sistema.painel.passos

/**
 * O número que a pessoa veio ver: os passos de hoje, contra o normal até este
 * horário. Comparar com o dia inteiro às 10h da manhã diria "abaixo do normal"
 * pra todo mundo, todo dia, e o app perderia a confiança de quem usa.
 */
export function PassosDeHojeCartao({ dados }: { dados: PassosDeHoje }) {
  const { passos, faixaAteAgora, faixaDoDia, situacao } = dados

  return (
    <Card className="p-5 sm:p-6">
      {/* Um grupo só: o termo é "Passos até agora", e tudo embaixo dele (o
          número, a situação, o normal) é a definição desse termo. */}
      <dl>
        {/* Grade, e não uma linha embrulhada: dentro de um `dl`, o grupo só pode
            ter `dt` e `dd` como filhos. O título e o selo dividem a primeira linha. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
          <dt className="flex items-center gap-2 text-base text-ink">
            <Icone nome="passos" className="size-5 text-[var(--ds-primary-accent)]" />
            {textos.titulo}
          </dt>
          <dd>
            <SeloSituacao situacao={situacao} metrica="passos" />
          </dd>

          <dd className="col-span-2 mt-3 font-display text-5xl leading-none text-ink sm:text-6xl">
            {passos === null ? "0" : numero(passos)}
          </dd>
          {passos === null && <dd className="col-span-2 mt-2 text-sm text-muted">{textos.semPassos}</dd>}

          {faixaAteAgora && (
            <dd className="col-span-2 mt-3 text-base text-ink">
              {preencher(textos.normalAteAgora, {
                baixo: numero(Math.round(faixaAteAgora.baixo)),
                alto: numero(Math.round(faixaAteAgora.alto)),
              })}
              {passos !== null && <FaixaDoDia valor={passos} faixa={faixaAteAgora} acimaEhBom />}
            </dd>
          )}
          {faixaDoDia && (
            <dd className="col-span-2 mt-4 text-sm text-muted">
              {preencher(textos.normalDoDia, {
                baixo: numero(Math.round(faixaDoDia.baixo)),
                alto: numero(Math.round(faixaDoDia.alto)),
              })}
            </dd>
          )}
        </div>
      </dl>
    </Card>
  )
}
