import type { Metadata } from "next"
import { DemoPublica } from "./demo-publica"

export const metadata: Metadata = {
  title: "Demonstração · CareTwin",
  // Página aberta de propósito, mas não é para aparecer em busca.
  robots: { index: false, follow: false },
}

/** O código da pulseira vem da barra de endereço: /demo?pulseira=CT-XXXX. */
export default async function PaginaDemo({ searchParams }: { searchParams: Promise<{ pulseira?: string | string[] }> }) {
  const { pulseira } = await searchParams
  return <DemoPublica inicial={typeof pulseira === "string" ? pulseira : null} />
}
