import type { Metadata } from "next"
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { AssistentePrimeiroUso } from "@/components/app/primeiro-uso/assistente"
import { marca, sistema } from "@/content/site"

const textos = sistema.primeiroUso

export const metadata: Metadata = {
  title: `${textos.titulo} · ${marca.nome}`,
}

/**
 * O primeiro uso fica fora do menu de propósito: ele acontece uma vez por
 * pulseira. Quem chega aqui vem do painel vazio ou do botão de conectar outra
 * pulseira no topo do app.
 */
export default function PaginaPrimeiroUso() {
  return (
    <>
      <CabecalhoPagina titulo={textos.titulo} descricao={textos.descricao} />
      <AssistentePrimeiroUso />
    </>
  )
}
