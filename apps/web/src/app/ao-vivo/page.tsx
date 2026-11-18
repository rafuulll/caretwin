import type { Metadata } from "next"
import { AoVivoPublico } from "./ao-vivo-publico"

export const metadata: Metadata = {
  title: "Dados ao vivo · CareTwin",
  robots: { index: false, follow: false },
}

/** O código da pulseira vem da barra de endereço: /ao-vivo?pulseira=CT-XXXX. */
export default async function PaginaAoVivo({ searchParams }: { searchParams: Promise<{ pulseira?: string | string[] }> }) {
  const { pulseira } = await searchParams
  return <AoVivoPublico pedida={typeof pulseira === "string" ? pulseira : null} />
}
