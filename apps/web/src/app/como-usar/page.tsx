import type { Metadata } from "next"
import { Icone } from "@/components/app/icone"
import { CabecalhoMarketing } from "@/components/marketing/cabecalho-marketing"
import { BotaoLink } from "@/components/marketing/botao-link"
import { RodapeMarketing } from "@/components/marketing/rodape-marketing"
import { comoUsar, marca } from "@/content/site"

export const metadata: Metadata = {
  title: `${comoUsar.titulo} · ${marca.nome}`,
}

/**
 * Como usar: o mapa do que o CareTwin já faz e do que ainda dá pra ligar.
 *
 * Escrita pra quem vai mostrar o app e pra quem vai continuar o projeto. Cada
 * item do bloco do meio termina apontando o arquivo ou a pasta onde a peça já
 * está esperando: é isso que faz a página ser útil, e não decorativa.
 */
export default function PaginaComoUsar() {
  return (
    <div className="flex min-h-dvh flex-col">
      <CabecalhoMarketing />

      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <div className="mx-auto max-w-[920px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="text-[clamp(2rem,5vw,3rem)] leading-tight text-balance text-ink">{comoUsar.titulo}</h1>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{comoUsar.subtitulo}</p>
          <BotaoLink
            href="/entrar"
            tamanho="lg"
            className="mt-7 h-14 text-lg max-sm:w-full"
            iconeDireita={<Icone nome="seta-direita" />}
          >
            {comoUsar.entrar}
          </BotaoLink>

          <section aria-labelledby="bloco-hoje" className="mt-16">
            <h2 id="bloco-hoje" className="text-2xl text-ink">
              {comoUsar.hoje.titulo}
            </h2>
            <p className="mt-2 text-base text-muted">{comoUsar.hoje.descricao}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {comoUsar.hoje.itens.map((item) => (
                <li key={item.titulo} className="superficie flex gap-3 rounded-ds-surface border border-hairline p-4">
                  <Icone nome="dentro" className="mt-0.5 size-5 shrink-0 text-success" />
                  <div>
                    <h3 className="text-base font-medium text-ink">{item.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="bloco-conectar" className="mt-16">
            <h2 id="bloco-conectar" className="text-2xl text-ink">
              {comoUsar.conectar.titulo}
            </h2>
            <p className="mt-2 text-base text-muted">{comoUsar.conectar.descricao}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {comoUsar.conectar.itens.map((item) => (
                <li key={item.titulo} className="superficie rounded-ds-surface border border-hairline p-5">
                  <h3 className="text-lg text-ink">{item.titulo}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-muted">{item.texto}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink">
                    <span className="text-muted">{comoUsar.ondeEncaixa}:</span>
                    <code className="rounded-ds-fine border border-hairline bg-canvas px-2 py-0.5 font-mono text-[13px]">
                      {item.onde}
                    </code>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="bloco-proximos" className="mt-16">
            <h2 id="bloco-proximos" className="text-2xl text-ink">
              {comoUsar.proximos.titulo}
            </h2>
            <ol className="mt-6 flex flex-col gap-4">
              {comoUsar.proximos.itens.map((item, indice) => (
                <li key={item} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-ds bg-primary text-sm font-semibold text-primary-ink">
                    {indice + 1}
                  </span>
                  <p className="pt-1.5 text-base leading-relaxed text-ink">{item}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <RodapeMarketing />
    </div>
  )
}
