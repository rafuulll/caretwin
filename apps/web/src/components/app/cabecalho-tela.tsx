import type { ReactNode } from "react";

/* Cabeçalho de cada tela de dentro: título que diz o que a pessoa ganha ali e uma linha de apoio. */
export function CabecalhoTela({ titulo, apoio, acoes, sobretitulo }: { titulo: string; apoio?: ReactNode; acoes?: ReactNode; sobretitulo?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {sobretitulo && <p className="mb-1 font-bold text-tinta-suave">{sobretitulo}</p>}
        <h1 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold tracking-[-0.015em]">{titulo}</h1>
        {apoio && <p className="mt-2 max-w-2xl text-tinta-suave">{apoio}</p>}
      </div>
      {acoes && <div className="flex shrink-0 flex-wrap gap-3">{acoes}</div>}
    </div>
  );
}
