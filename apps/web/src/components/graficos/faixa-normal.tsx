/*
  Gráfico de bala: o valor de agora como uma barra fina, sobre a faixa do normal em
  lavagem. O texto ao lado (no cartão) diz os mesmos números; aqui a figura recebe um
  rótulo para quem usa leitor de tela.
*/

import type { Situacao } from "@/lib/modelo";
import { cn } from "@/lib/cn";

type Props = {
  valor: number;
  baixo: number;
  alto: number;
  situacao: Situacao;
  rotulo: string;
  className?: string;
};

export function FaixaNormal({ valor, baixo, alto, situacao, rotulo, className }: Props) {
  const maximo = Math.max(valor, alto) * 1.25 || 1;
  const pct = (v: number) => `${Math.min(100, (v / maximo) * 100)}%`;
  const corBarra = situacao === "abaixo" ? "bg-atencao" : situacao === "acima" ? "bg-info" : "bg-[var(--ct-grafico-serie)]";
  return (
    <div role="img" aria-label={rotulo} className={cn("relative h-9", className)}>
      <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-suave" />
      <div
        className="absolute top-0 h-9 rounded-[6px] bg-[var(--ct-grafico-faixa)] ring-1 ring-inset ring-primaria/35"
        style={{ left: pct(baixo), width: `calc(${pct(alto)} - ${pct(baixo)})` }}
      />
      <div className={cn("absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-r-full", corBarra)} style={{ width: pct(valor) }} />
      <div className="absolute top-0 h-9 w-[3px] -translate-x-1/2 rounded-full bg-tinta" style={{ left: pct(valor) }} />
    </div>
  );
}
