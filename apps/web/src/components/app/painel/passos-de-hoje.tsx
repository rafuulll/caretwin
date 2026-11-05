import { Card } from "@/components/ui"
import { sistema, redesign } from "@/content/site"
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
  const { passos, faixaAteAgora, situacao } = dados

  return (
    <Card className="ct-steps">
      {/* Um grupo só: o termo é "Passos até agora", e tudo embaixo dele (o
          número, a situação, o normal) é a definição desse termo. */}
      <dl>
        {/* Grade, e não uma linha embrulhada: dentro de um `dl`, o grupo só pode
            ter `dt` e `dd` como filhos. O título e o selo dividem a primeira linha. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
          <dt className="flex items-center gap-2 text-base text-ink">
            <Icone nome="passos" className="size-5 text-[var(--ds-primary-accent)]" />
            {redesign.stepsTitle}
          </dt>
          <dd>
            <SeloSituacao situacao={situacao} metrica="passos" />
          </dd>

          <dd className={passos===null?"col-span-2 mt-5 mb-5 text-xl text-muted":"ct-steps-number col-span-2 mt-5 mb-5 font-display text-ink"}>
            {passos === null ? sistema.comum.semDado : numero(passos)}
          </dd>
          {passos === null && <dd className="col-span-2 mt-2 text-sm text-muted">{textos.semPassos}</dd>}

          {faixaAteAgora && (
            <dd className="col-span-2 mt-3 text-sm text-ink">
              {preencher(textos.normalAteAgora, {
                baixo: numero(Math.round(faixaAteAgora.baixo)),
                alto: numero(Math.round(faixaAteAgora.alto)),
              })}
              {passos !== null && <FaixaDoDia valor={passos} faixa={faixaAteAgora} acimaEhBom />}
            </dd>
          )}

        </div>
      </dl>
    </Card>
  )
}
