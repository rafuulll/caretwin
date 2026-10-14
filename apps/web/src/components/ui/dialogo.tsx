"use client";

/*
  Diálogo sobre o <dialog> nativo: o navegador já prende o foco e deixa o resto da página
  inerte. Aqui entram as partes que faltam: Esc e clique fora fecham pelo estado do React,
  a rolagem de trás fica travada e o foco volta para quem abriu.
*/

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icone } from "./icone";

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: ReactNode;
  children?: ReactNode;
  rodape?: ReactNode;
  /** "alertdialog" para confirmações destrutivas. */
  papel?: "dialog" | "alertdialog";
  rotuloFechar: string;
  largura?: "media" | "larga";
};

export function Dialogo({ aberto, aoFechar, titulo, descricao, children, rodape, papel = "dialog", rotuloFechar, largura = "media" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const quemAbriu = useRef<HTMLElement | null>(null);
  const idTitulo = useId();
  const idDescricao = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) {
      quemAbriu.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialogo.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!aberto && dialogo.open) {
      dialogo.close();
    }
  }, [aberto]);

  useEffect(() => {
    const dialogo = ref.current;
    return () => {
      if (dialogo?.open) dialogo.close();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      role={papel}
      aria-modal="true"
      aria-labelledby={idTitulo}
      aria-describedby={descricao ? idDescricao : undefined}
      onCancel={(evento) => {
        evento.preventDefault();
        aoFechar();
      }}
      onClose={() => {
        document.documentElement.style.overflow = "";
        quemAbriu.current?.focus();
      }}
      onClick={(evento) => {
        if (evento.target === ref.current) aoFechar();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] overscroll-contain rounded-dialogo border border-borda bg-superficie p-0 text-tinta shadow-ct-xl",
        "backdrop:bg-[var(--ct-veu)] open:animate-[ct-chegada_240ms_var(--ease-saida)]",
        largura === "larga" ? "max-w-2xl" : "max-w-lg",
      )}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-borda px-6 pb-4 pt-6">
          <div>
            <h2 id={idTitulo} className="text-xl font-bold">
              {titulo}
            </h2>
            {descricao && (
              <div id={idDescricao} className="mt-1.5 text-tinta-suave">
                {descricao}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-campo text-tinta-suave hover:bg-suave hover:text-tinta"
            aria-label={rotuloFechar}
          >
            <Icone nome="fechar" />
          </button>
        </div>
        {children && <div className="overflow-y-auto px-6 py-5">{children}</div>}
        {rodape && <div className="flex flex-col-reverse gap-3 border-t border-borda px-6 py-4 sm:flex-row sm:justify-end">{rodape}</div>}
      </div>
    </dialog>
  );
}
