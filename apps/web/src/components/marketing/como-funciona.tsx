import { landing } from "@/content/site"

/**
 * O percurso do dia, um passo por momento de quem usa. Um `<ol>` de verdade,
 * porque a ordem é conteúdo: quem usa leitor de tela ouve que são cinco, em
 * sequência. Uma coluna só, com o fio passando atrás dos números: em tela
 * estreita, nada de zigue-zague.
 */
export function ComoFunciona() {
  const { comoFunciona } = landing

  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="scroll-mt-20 bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <h2
            id="como-funciona-titulo"
            className="text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-balance text-ink"
          >
            {comoFunciona.titulo}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">{comoFunciona.subtitulo}</p>
        </div>

        <ol className="relative flex flex-col gap-8">
          {/* O fio de 1px que liga os números, por trás deles. */}
          <span aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-px bg-hairline" />
          {comoFunciona.passos.map((passo) => (
            <li key={passo.numero} className="relative flex gap-5">
              <span className="relative grid size-10 shrink-0 place-items-center rounded-ds bg-primary font-display text-sm tabular-nums text-primary-ink">
                {passo.numero}
              </span>
              <div className="min-w-0 pt-1.5">
                <h3 className="text-lg text-ink">{passo.titulo}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-muted">{passo.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
