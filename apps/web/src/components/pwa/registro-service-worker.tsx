"use client";

/*
  Registra o service worker (public/sw.js) só em produção. Em desenvolvimento ele
  atrapalharia o recarregamento automático das telas.
*/

import { useEffect } from "react";

export function RegistroServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const registrar = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
        // Sem service worker o app continua funcionando, só não abre sem internet.
      });
    };
    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);

  return null;
}
