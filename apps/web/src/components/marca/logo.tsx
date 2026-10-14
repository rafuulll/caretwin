/*
  Marca do CareTwin, desenhada em SVG inline e herdando a cor (currentColor).
  Dois círculos sobrepostos: a pessoa e o "gêmeo" que representa o normal dela.
  O traço de pulso que atravessa os dois é o dia sendo comparado com esse normal.
*/

import { cn } from "@/lib/cn";
import { marca } from "@/content/site";

export function Simbolo({ className, tamanho = 32 }: { className?: string; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="16" r="9" stroke="currentColor" strokeWidth="2.25" />
      <circle cx="20" cy="16" r="9" stroke="currentColor" strokeWidth="2.25" opacity="0.45" />
      <path
        d="M3.5 16.5h6l2-4.5 3 9 2.5-6.5 1.5 2h10"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, tamanho = 32 }: { className?: string; tamanho?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-primaria", className)}>
      <Simbolo tamanho={tamanho} />
      <span className="text-[1.3rem] font-bold tracking-tight text-tinta" translate="no">
        {marca.nome}
      </span>
    </span>
  );
}
