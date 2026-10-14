"use client";

/*
  Uma região de status só, para o app inteiro: mensagens curtas e completas
  ("Alerta marcado como lido.") para o leitor de tela, sem tirar o foco de ninguém.
  Também mostra a mensagem como um aviso discreto na tela, que some sozinho.
*/

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icone } from "./icone";

const Contexto = createContext<(mensagem: string) => void>(() => {});

export function useAnunciar() {
  return useContext(Contexto);
}

export function ProvedorAnuncios({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<{ texto: string; chave: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const anunciar = useCallback((texto: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMensagem({ texto, chave: Date.now() });
    timer.current = setTimeout(() => setMensagem(null), 4000);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <Contexto.Provider value={anunciar}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {mensagem?.texto}
      </div>
      {mensagem && (
        <div
          key={mensagem.chave}
          aria-hidden="true"
          className="chegada pointer-events-none fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center gap-2 rounded-cartao bg-tinta px-4 py-3 font-bold text-fundo shadow-ct-lg lg:bottom-8"
        >
          <Icone nome="ok" />
          {mensagem.texto}
        </div>
      )}
    </Contexto.Provider>
  );
}
