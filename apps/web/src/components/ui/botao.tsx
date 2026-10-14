/*
  Botões do CareTwin, com as especificações da skill (verde de chamada com texto escuro,
  contorno azul no secundário, raio de 8px) e alvo de toque generoso, porque parte de quem
  usa é idosa: 48px no tamanho normal e 56px no grande, com texto de 18px.
*/

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icone, type NomeIcone } from "./icone";

type Variante = "primario" | "secundario" | "suave" | "fantasma" | "perigo" | "perigoSuave";
type Tamanho = "pequeno" | "medio" | "grande";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-campo font-bold leading-tight " +
  "transition-[background-color,border-color,color,box-shadow,opacity] duration-200 ease-out " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

const variantes: Record<Variante, string> = {
  primario: "bg-acento text-sobre-acento shadow-ct-sm hover:bg-acento-forte active:opacity-90",
  secundario: "border-2 border-primaria bg-transparent text-primaria hover:bg-info-fundo active:opacity-90",
  suave: "bg-suave text-tinta hover:bg-borda-forte/60 active:opacity-90",
  fantasma: "bg-transparent text-primaria hover:bg-info-fundo active:opacity-90",
  perigo: "bg-perigo text-sobre-perigo hover:opacity-90 active:opacity-80",
  perigoSuave: "border border-perigo/40 bg-transparent text-perigo hover:bg-perigo/10 active:opacity-90",
};

const tamanhos: Record<Tamanho, string> = {
  pequeno: "min-h-11 px-3.5 text-[0.95rem]",
  medio: "min-h-12 px-5 text-base",
  grande: "min-h-14 px-6 text-lg",
};

type Comum = {
  variante?: Variante;
  tamanho?: Tamanho;
  icone?: NomeIcone;
  iconeDepois?: NomeIcone;
  larguraTotal?: boolean;
  children: ReactNode;
};

type PropsBotao = Comum & ComponentProps<"button"> & { carregando?: boolean; textoCarregando?: string };

export function Botao({
  variante = "primario",
  tamanho = "medio",
  icone,
  iconeDepois,
  larguraTotal,
  carregando,
  textoCarregando,
  className,
  children,
  type = "button",
  disabled,
  ...resto
}: PropsBotao) {
  return (
    <button
      type={type}
      className={cn(base, variantes[variante], tamanhos[tamanho], larguraTotal && "w-full", className)}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando ? (
        <Icone nome="carregando" className="animate-spin motion-reduce:animate-none" />
      ) : (
        icone && <Icone nome={icone} />
      )}
      <span>{carregando && textoCarregando ? textoCarregando : children}</span>
      {!carregando && iconeDepois && <Icone nome={iconeDepois} />}
    </button>
  );
}

type PropsLink = Comum & ComponentProps<typeof Link>;

/** Um link com cara de botão: navega como link (Ctrl+clique funciona), parece botão. */
export function LinkBotao({
  variante = "primario",
  tamanho = "medio",
  icone,
  iconeDepois,
  larguraTotal,
  className,
  children,
  ...resto
}: PropsLink) {
  return (
    <Link className={cn(base, variantes[variante], tamanhos[tamanho], larguraTotal && "w-full", className)} {...resto}>
      {icone && <Icone nome={icone} />}
      <span>{children}</span>
      {iconeDepois && <Icone nome={iconeDepois} />}
    </Link>
  );
}
