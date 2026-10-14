import { Icone } from "@/components/app/icone"
import { landing } from "@/content/site"

/**
 * O que muda no dia de quem usa: um item por benefício, com as palavras de
 * quem usa. A grade é `auto-fit`, então o número de células é o número de
 * benefícios, e no celular ela vira uma coluna sem media query.
 */
export function Beneficios() {
  const { beneficios } = landing

  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <h2
          id="beneficios-titulo"
          className="max-w-2xl text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-balance text-ink"
        >
          {beneficios.titulo}
        </h2>

        <ul
          className="mt-10 grid gap-[calc(var(--ds-space)*2)] lg:mt-12"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
        >
          {beneficios.itens.map((item) => (
            <li key={item.titulo} className="superficie rounded-ds-surface border border-hairline p-6">
              <Icone nome={item.icone} className="size-6 text-[var(--ds-primary-accent)]" />
              <h3 className="mt-4 text-lg text-ink">{item.titulo}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">{item.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
