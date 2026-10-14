"use client";

/*
  Alternador segmentado feito com rádios de verdade (fieldset + legend), então setas,
  Tab e leitor de tela funcionam sem nenhum código extra.
*/

import { useId } from "react";
import { cn } from "@/lib/cn";
import { Icone, type NomeIcone } from "./icone";

type Opcao<T extends string> = { valor: T; rotulo: string; icone?: NomeIcone };

type Props<T extends string> = {
  legenda: string;
  valor: T;
  opcoes: Opcao<T>[];
  aoMudar: (valor: T) => void;
  ajuda?: string;
  legendaVisivel?: boolean;
};

export function Alternador<T extends string>({ legenda, valor, opcoes, aoMudar, ajuda, legendaVisivel = true }: Props<T>) {
  const nome = useId();
  const idAjuda = `${nome}-ajuda`;
  return (
    <fieldset aria-describedby={ajuda ? idAjuda : undefined}>
      <legend className={cn("mb-2 font-bold", !legendaVisivel && "sr-only")}>{legenda}</legend>
      {/* Quando não cabe, a opção desce inteira e ocupa a linha toda; o texto nunca quebra no meio. */}
      <div className="flex max-w-full flex-wrap gap-1 rounded-campo bg-suave p-1 sm:inline-flex">
        {opcoes.map((opcao) => {
          const marcado = opcao.valor === valor;
          return (
            <label
              key={opcao.valor}
              className={cn(
                "relative flex min-h-11 items-center gap-2 flex-auto justify-center whitespace-nowrap rounded-[6px] px-4 font-bold transition-[background-color,color,box-shadow] duration-200",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-anel",
                marcado ? "bg-superficie text-tinta shadow-ct-sm" : "text-tinta-suave hover:text-tinta",
              )}
            >
              <input
                type="radio"
                name={nome}
                value={opcao.valor}
                checked={marcado}
                onChange={() => aoMudar(opcao.valor)}
                className="sr-only"
              />
              {opcao.icone && <Icone nome={opcao.icone} tamanho={18} />}
              {opcao.rotulo}
            </label>
          );
        })}
      </div>
      {ajuda && (
        <p id={idAjuda} className="mt-2 text-[0.95rem] text-tinta-suave">
          {ajuda}
        </p>
      )}
    </fieldset>
  );
}
