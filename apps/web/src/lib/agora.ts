"use client"

import { useSyncExternalStore } from "react"

/**
 * O relógio das telas, lido uma vez por minuto.
 *
 * Todas as contas de "até agora" (os passos contra o normal deste horário, há
 * quanto tempo a pulseira sincronizou) dependem da hora. Ler `new Date()` em
 * cada bloco faria duas partes da mesma tela discordarem perto da virada do
 * minuto; com uma leitura só, a tela inteira concorda.
 *
 * No servidor não existe "agora" de quem está olhando, então ele devolve
 * `null`, e a tela espera a hidratação em vez de mostrar a hora do servidor.
 */

let agora: Date | null = null
const ouvintes = new Set<() => void>()
let relogio: number | null = null

function tique() {
  agora = new Date()
  for (const o of ouvintes) o()
}

function inscrever(o: () => void) {
  ouvintes.add(o)
  if (relogio === null) relogio = window.setInterval(tique, 60_000)
  return () => {
    ouvintes.delete(o)
    if (ouvintes.size === 0 && relogio !== null) {
      window.clearInterval(relogio)
      relogio = null
    }
  }
}

function ler() {
  if (agora === null) agora = new Date()
  return agora
}

export function useAgora(): Date | null {
  return useSyncExternalStore(inscrever, ler, () => null)
}
