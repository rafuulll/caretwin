/*
  "O normal é de cada um": a mesma pessoa vista por uma meta fixa e pelo próprio normal.
  O gráfico é SVG escrito à mão com os tokens do tema, e tem o equivalente em texto
  (a legenda da figura e as duas linhas de leitura).
*/

import { site } from "@/content/site";
import { Icone } from "@/components/ui/icone";

const ESCALA_MAX = 11000;
const pct = (v: number) => `${(v / ESCALA_MAX) * 100}%`;

export function NormalDeCadaUm() {
  const n = site.normal;
  return (
    <section aria-labelledby="normal-titulo" className="border-y border-borda bg-superficie">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-28">
        <div>
          <h2 id="normal-titulo" className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-bold tracking-[-0.015em]">
            {n.titulo}
          </h2>
          <p className="mt-5 max-w-lg text-[1.1rem] leading-relaxed text-tinta-suave">{n.apoio}</p>
        </div>

        <figure className="space-y-8">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold">{n.metaIgual}</p>
              <p className="numeros-tabulares font-bold text-tinta-suave">{n.metaIgualValor}</p>
            </div>
            <div className="relative mt-3 h-10 rounded-campo bg-suave" aria-hidden="true">
              <div className="absolute inset-y-0 w-[3px] rounded-full bg-tinta-suave" style={{ left: pct(10000) }} />
              <div className="absolute inset-y-2 left-0 rounded-r-[4px] bg-borda-forte" style={{ width: pct(2300) }} />
            </div>
            <p className="mt-3 flex items-start gap-2 text-tinta-suave">
              <Icone nome="info" tamanho={18} className="mt-1" />
              {n.metaIgualLeitura}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold">{n.normalDela}</p>
              <p className="numeros-tabulares font-bold text-primaria">{n.normalDelaValor}</p>
            </div>
            <div className="relative mt-3 h-10 rounded-campo bg-suave" aria-hidden="true">
              <div
                className="absolute inset-y-0 rounded-[4px] bg-[var(--ct-grafico-faixa)] ring-1 ring-inset ring-primaria/40"
                style={{ left: pct(3500), width: pct(1400) }}
              />
              <div className="absolute inset-y-2 left-0 rounded-r-[4px] bg-atencao" style={{ width: pct(2300) }} />
              <span className="absolute -bottom-7 text-[0.85rem] font-bold text-atencao" style={{ left: 0 }}>
                {n.hojeRotulo}
              </span>
            </div>
            <p className="mt-10 flex items-start gap-2">
              <Icone nome="abaixo" tamanho={18} className="mt-1 text-atencao" />
              {n.normalDelaLeitura}
            </p>
          </div>
          <figcaption className="sr-only">{n.legendaGrafico}</figcaption>
        </figure>
      </div>
    </section>
  );
}
