"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"

/**
 * Lê o que vem depois do # no endereço, uma vez, e tira isso da barra.
 *
 * É ali que o Supabase coloca o resultado dos links de e-mail: o token do
 * "esqueci minha senha" ou o erro de um link vencido. O # nunca vai para o
 * servidor, então só o navegador consegue ler. E ele não pode ficar na barra
 * nem no histórico, porque o token vale como senha até ser usado.
 *
 * O valor fica guardado por caminho: depois que a barra é limpa, a tela
 * continua lendo o que estava lá.
 */

let capturado: { caminho: string; valor: string } | null = null

function ler(): string {
  const caminho = window.location.pathname
  if (capturado?.caminho !== caminho) {
    capturado = { caminho, valor: window.location.hash.replace(/^#/, "") }
  }
  return capturado.valor
}

// O fragmento não muda sozinho enquanto a tela está aberta: não há o que ouvir.
const semOuvinte = () => () => {}

/** `null` no servidor e na primeira pintura; depois, os campos do fragmento. */
export function useFragmento(): URLSearchParams | null {
  const bruto = useSyncExternalStore(semOuvinte, ler, () => null)

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }
  }, [])

  return useMemo(() => (bruto === null ? null : new URLSearchParams(bruto)), [bruto])
}
