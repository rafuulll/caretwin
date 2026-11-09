"use client"

import { useEffect } from "react"

/**
 * Liga o service worker (`public/sw.js`, cartão 7.7). Só em produção: no
 * `npm run dev`, um cache de telas atrapalharia ver as mudanças na hora.
 */
export function RegistrarSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sem service worker o app funciona igual, só não abre sem internet.
    })
  }, [])
  return null
}
