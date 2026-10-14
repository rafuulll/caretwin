import { landing, sistema } from "@/content/site"
import { cn } from "@/lib/cn"
import { ultimosDias } from "@/lib/consultas"
import { diaEMes, formatarDiaDaSemanaCurto, numero, preencher } from "@/lib/formato"
import { gerarExemplos } from "@/lib/seed"

/**
 * A dobra viva do site: o normal de uma pessoa de exemplo, desenhado com os
 * mesmos dados e a mesma conta que o app usa por dentro.
 *
 * É a prova da promessa, e não um parágrafo sobre ela: quem lê vê que 2.400
 * passos são um dia diferente pra Dona Cida, e que a mesma meta pra todo mundo
 * nunca teria percebido isso. Barras em HTML, sem JavaScript e sem biblioteca.
 */
export function NormalDeCadaUm() {
  const textos = landing.normalDeCadaUm
  const agora = new Date()
  const dados = gerarExemplos(agora)
  const pessoa = dados.pessoas[0]
  // Os últimos sete dias inteiros: o de hoje ainda está acontecendo.
  const dias = ultimosDias(dados, pessoa.id, "passos", agora, 8).slice(0, 7)
  const faixa = dias[dias.length - 1].faixa
  const maximo = Math.max(1, ...dias.map((d) => Math.max(d.valor ?? 0, d.faixa?.alto ?? 0))) * 1.08
  const pct = (v: number) => `${(v / maximo) * 100}%`

  return (
    <section id="normal-de-cada-um" aria-labelledby="normal-titulo" className="scroll-mt-20">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <h2 id="normal-titulo" className="text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-balance text-ink">
            {textos.titulo}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">{textos.subtitulo}</p>
          {faixa && (
            <p className="mt-6 border-l-2 border-ink pl-4 text-base leading-relaxed text-ink">
              {preencher(textos.leitura, {
                nome: pessoa.nome,
                baixo: numero(Math.round(faixa.baixo)),
                alto: numero(Math.round(faixa.alto)),
              })}
            </p>
          )}
        </div>

        <figure className="superficie m-0 rounded-ds-surface border border-hairline p-5 sm:p-6">
          <figcaption className="text-sm font-medium text-ink">
            {preencher(textos.rotuloGrafico, { nome: pessoa.nome })}
          </figcaption>

          {/* O desenho é decoração do que a lista logo abaixo diz em texto. */}
          <div aria-hidden="true" className="relative mt-5 h-56">
            {faixa && (
              <div
                className="absolute inset-x-0 border-y border-dashed border-ink/25 bg-primary/8"
                style={{ bottom: pct(faixa.baixo), height: `calc(${pct(faixa.alto)} - ${pct(faixa.baixo)})` }}
              />
            )}
            <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
              {dias.map((dia) => {
                const fora = dia.situacao === "abaixo" || dia.situacao === "acima"
                return (
                  <div key={dia.data} className="flex h-full flex-1 flex-col justify-end">
                    <div
                      className={cn("w-full rounded-t-ds-fine", fora ? "bg-warning" : "bg-primary")}
                      style={{ height: pct(dia.valor ?? 0) }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div aria-hidden="true" className="mt-2 flex gap-2 sm:gap-3">
            {dias.map((dia) => (
              <span key={dia.data} className="flex-1 text-center text-xs text-muted">
                {formatarDiaDaSemanaCurto(dia.data)}
              </span>
            ))}
          </div>

          <ul aria-hidden="true" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <li className="inline-flex items-center gap-2">
              <span className="h-3 w-5 rounded-[3px] border border-dashed border-ink/25 bg-primary/8" />
              {preencher(textos.faixa, { nome: pessoa.nome })}
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-3 w-2 rounded-[2px] bg-primary" />
              {textos.dentroDoNormal}
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-3 w-2 rounded-[2px] bg-warning" />
              {textos.foraDoNormal}
            </li>
          </ul>

          {/* O gêmeo em texto do gráfico, sempre na tela: são só sete linhas. */}
          <details className="mt-4">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-ink underline decoration-hairline underline-offset-4">
              {textos.numeros}
            </summary>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              {dias.map((dia) => (
                <div key={dia.data} className="contents">
                  <dt className="text-muted">
                    {formatarDiaDaSemanaCurto(dia.data)}, {diaEMes(dia.data)}
                  </dt>
                  <dd className="tabular-nums text-ink">
                    {numero(dia.valor ?? 0)} {textos.passos}, {sistema.situacoes[dia.situacao].toLowerCase()}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </figure>
      </div>
    </section>
  )
}
