import { Icone } from "@/components/app/icone"
import { Card } from "@/components/ui"
import { landing } from "@/content/site"
import { cn } from "@/lib/cn"
import { BotaoLink } from "./botao-link"

/**
 * DOBRA GUARDADA. O CareTwin não é vendido, então o site não tem preço nem
 * plano, e esta dobra não entra no `src/app/page.tsx`. O arquivo continua aqui,
 * pronto, e as chaves dele no `site.ts` ficam vazias de propósito.
 *
 * Dobra 4. O plano com `destaque: true` no site.ts ganha três sinais somados:
 * borda na cor de ação, selo e um empurrão para cima. Sem poça de luz por
 * baixo: aqui o relevo é borda e gradiente, nunca sombra por fora.
 */
export function Planos() {
  const { precos } = landing

  return (
    <section id="planos" aria-labelledby="planos-titulo" className="scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <h2
            id="planos-titulo"
            className="text-2xl leading-tight text-balance text-ink sm:text-3xl lg:text-4xl"
          >
            {precos.titulo}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{precos.subtitulo}</p>
        </div>

        <ul className="mt-10 grid gap-5 lg:mt-16 lg:grid-cols-3">
          {precos.planos.map((plano) => (
            <li
              key={plano.nome}
              className={cn(
                "h-full",
                plano.destaque && "rounded-ds lg:-translate-y-4"
              )}
            >
              <Card className={cn("relative flex h-full flex-col", plano.destaque && "border-primary")}>
                {/* Selo em cor cheia pelo mesmo motivo dos números da dobra 3:
                    `primary` como TEXTO em 12px fica abaixo de 4.5:1. */}
                {plano.destaque && (
                  <span className="realce-interno absolute -top-3 left-6 inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-ink">
                    {precos.selo}
                  </span>
                )}

                <div className="flex flex-1 flex-col p-6 lg:p-7">
                  <h3 className="text-base text-ink">{plano.nome}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{plano.descricao}</p>

                  <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-display text-3xl text-ink lg:text-4xl">{plano.preco}</span>
                    <span className="text-sm text-muted">{plano.periodo}</span>
                  </p>

                  <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-hairline pt-6">
                    {plano.recursos.map((recurso) => (
                      <li key={recurso} className="flex items-start gap-2.5 text-sm text-ink">
                        <Icone nome="check" className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="min-w-0">{recurso}</span>
                      </li>
                    ))}
                  </ul>

                  <BotaoLink
                    href="/entrar"
                    larguraTotal
                    variante={plano.destaque ? "primaria" : "secundaria"}
                    className="mt-7"
                  >
                    {plano.cta}
                  </BotaoLink>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
