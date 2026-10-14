"use client";

/*
  Mantém o <html> com o tema e o tamanho de texto certos depois da hidratação,
  e acompanha a troca de tema do aparelho quando a preferência é "igual ao aparelho".
*/

import { useEffect } from "react";
import { aplicarPreferenciasNaPagina, usePreferencias } from "@/lib/store";

export function EfeitoPreferencias() {
  const preferencias = usePreferencias();

  useEffect(() => {
    aplicarPreferenciasNaPagina(preferencias);
    if (preferencias.tema !== "sistema") return;
    const consulta = window.matchMedia("(prefers-color-scheme: dark)");
    const aoMudar = () => aplicarPreferenciasNaPagina(preferencias);
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, [preferencias]);

  return null;
}
