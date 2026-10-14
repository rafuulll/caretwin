/*
  Percurso em etapas: os quatro momentos do dia, na ordem em que acontecem.
  Numerar faz sentido aqui porque é uma sequência de verdade (manhã, dia, quando quiser, noite).
*/

import { site } from "@/content/site";
import { Icone, type NomeIcone } from "@/components/ui/icone";

const ICONES: NomeIcone[] = ["sono", "passos", "batimentos", "cuidado"];

export function ComoFunciona() {
  const c = site.comoFunciona;
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl">
          <h2 id="como-funciona-titulo" className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-bold tracking-[-0.015em]">
            {c.titulo}
          </h2>
          <p className="mt-4 text-[1.1rem] text-tinta-suave">{c.apoio}</p>
        </div>
        <ol className="relative mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {c.etapas.map((etapa, i) => (
            <li key={etapa.titulo} className="relative flex gap-4 lg:flex-col">
              <div className="flex flex-col items-center lg:flex-row lg:items-center">
                <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-primaria text-lg font-bold text-sobre-primaria">
                  {i + 1}
                </span>
                {i < c.etapas.length - 1 && (
                  <span aria-hidden="true" className="mt-2 w-px flex-1 bg-borda-forte lg:ml-3 lg:mt-0 lg:h-px lg:w-auto lg:flex-1" />
                )}
              </div>
              <div className="pb-2">
                <p className="flex items-center gap-2 text-[1.15rem] font-bold">
                  <Icone nome={ICONES[i]} className="text-primaria" />
                  {etapa.titulo}
                </p>
                <p className="mt-2 text-tinta-suave">{etapa.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
