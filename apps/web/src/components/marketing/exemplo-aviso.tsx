/*
  A dobra viva do site: mostra um aviso e um resumo como eles aparecem dentro do app,
  com os mesmos números dos dados de exemplo (Dona Cida, dois dias mais parados).
*/

import { site } from "@/content/site";
import { Icone } from "@/components/ui/icone";

export function ExemploAviso() {
  const e = site.exemplo;
  return (
    <section aria-labelledby="exemplo-titulo" className="border-y border-borda bg-superficie">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-28">
        <div>
          <h2 id="exemplo-titulo" className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-bold tracking-[-0.015em]">
            {e.titulo}
          </h2>
          <p className="mt-5 max-w-lg text-[1.1rem] leading-relaxed text-tinta-suave">{e.apoio}</p>
        </div>
        <div className="space-y-4">
          <article className="cartao p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.95rem] font-bold text-tinta-suave">{e.alertaRotulo}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-atencao-fundo px-3 py-1 text-[0.9rem] font-bold text-atencao">
                <Icone nome="abaixo" tamanho={16} />
                {e.alertaDesvio}
              </span>
            </div>
            <h3 className="mt-3 flex items-center gap-2 text-xl font-bold">
              <Icone nome="passos" className="text-primaria" />
              {e.alertaTitulo}
            </h3>
            <p className="mt-2 leading-relaxed">{e.alertaTexto}</p>
          </article>
          <article className="rounded-cartao border border-borda bg-info-fundo/70 p-6">
            <h3 className="flex items-center gap-2 font-bold text-info">
              <Icone nome="ia" />
              {e.resumoRotulo}
            </h3>
            <p className="mt-2 leading-relaxed">{e.resumoTexto}</p>
            <p className="mt-3 text-[0.9rem] text-tinta-suave">{e.iaNota}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
