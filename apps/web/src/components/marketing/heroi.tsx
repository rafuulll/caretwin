import { Icone } from "@/components/app/icone"
import { FundoHeroi } from "@/components/cena/fundo-heroi"
import { landing } from "@/content/site"
import { BotaoLink } from "./botao-link"
import { MockupProduto } from "./mockup-produto"

/**
 * A abertura. Arranjo (a): a promessa, o apoio e o botão à esquerda, a prévia
 * do app à direita. No celular vira uma coluna, com a promessa antes da prévia.
 *
 * O fundo vivo mora num componente à parte, fora desta pasta: esta dobra
 * continua servidor e chega inteira no HTML, e o desenho entra por cima depois,
 * sem atrasar a leitura do título nem do botão.
 */
export function Heroi() {
  const { hero } = landing

  return (
    <section className="relative -mt-16 overflow-hidden pt-16">
      <FundoHeroi />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-8 lg:pt-24 lg:pb-24">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{hero.eyebrow}</p>

          <h1 className="mt-4 text-[clamp(2.1rem,6.5vw,3.6rem)] leading-[1.06] text-balance text-ink">
            {hero.titulo}
          </h1>

          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-pretty text-muted">{hero.subtitulo}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BotaoLink
              href="/entrar"
              tamanho="lg"
              comChip
              iconeDireita={
                <Icone
                  nome="seta-direita"
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                />
              }
              className="h-14 text-lg max-sm:w-full"
            >
              {hero.ctaPrimario}
            </BotaoLink>

            <BotaoLink href="#como-funciona" variante="secundaria" tamanho="lg" className="h-14 text-base max-sm:w-full">
              {hero.ctaSecundario}
            </BotaoLink>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <Icone nome="info" className="size-4 shrink-0" />
            {hero.provaSocial}
          </p>
        </div>

        <MockupProduto />
      </div>
    </section>
  )
}
