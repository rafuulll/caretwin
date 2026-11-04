"use client"

import { sistema } from "@/content/site"
import { diaDoCarimbo, formatarData, hoje, horaDoCarimbo, preencher, somarDias } from "@/lib/formato"
import { useSemRedeDesde } from "@/lib/store"
import { Icone } from "./icone"

const textos = sistema.semRede

function quando(carimbo: string) {
  const dia = diaDoCarimbo(carimbo)
  const hora = horaDoCarimbo(carimbo)
  if (dia === hoje()) return preencher(textos.hoje, { hora })
  if (dia === somarDias(hoje(), -1)) return preencher(textos.ontem, { hora })
  return preencher(textos.outroDia, { data: formatarData(dia), hora })
}

/** A faixa de "sem internet" no topo das telas do app (cartão 7.7). */
export function AvisoSemRede() {
  const desde = useSemRedeDesde()
  if (desde === null) return null

  return (
    <p
      role="status"
      className="mb-6 flex gap-2 rounded-ds-fine border border-warning/25 bg-warning/10 px-3 py-2.5 text-sm text-ink"
    >
      <Icone nome="sem-rede" className="mt-0.5 size-4 shrink-0 text-warning" />
      {desde ? preencher(textos.comCopia, { quando: quando(desde) }) : textos.semCopia}
    </p>
  )
}
