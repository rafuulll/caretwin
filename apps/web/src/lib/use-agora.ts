"use client";

import { useSyncExternalStore } from "react";

/*
  O "agora" das telas, atualizado a cada minuto, para "há 12 minutos" e
  "o normal neste horário" não envelhecerem com a tela aberta.
  No servidor (pré-renderização) ele é null: a hora certa é a do aparelho de quem abre.
*/

let agoraAtual: Date | null = null;

function inscrever(avisar: () => void) {
  const id = window.setInterval(() => {
    agoraAtual = new Date();
    avisar();
  }, 60000);
  return () => window.clearInterval(id);
}

function ler(): Date {
  if (!agoraAtual) agoraAtual = new Date();
  return agoraAtual;
}

export function useAgora(): Date | null {
  return useSyncExternalStore(inscrever, ler, () => null);
}
