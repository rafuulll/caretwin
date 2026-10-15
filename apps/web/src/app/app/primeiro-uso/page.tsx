import type { Metadata } from "next"
import { ConteudoPrimeiroUso } from "@/components/app/primeiro-uso/conteudo"
import { marca, sistema } from "@/content/site"

export const metadata: Metadata = {
  title: `${sistema.primeiroUso.titulo} · ${marca.nome}`,
}

/**
 * O primeiro uso fica fora do menu de propósito: ele acontece uma vez por
 * pulseira. Quem chega aqui vem do painel vazio ou do botão de conectar outra
 * pulseira no topo do app.
 */
export default function PaginaPrimeiroUso() {
  return <ConteudoPrimeiroUso />
}
