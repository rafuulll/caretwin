"use client"

import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { sistema } from "@/content/site"
import { useConta } from "@/lib/store"
import { AssistentePrimeiroUso } from "./assistente"
import { LigarPulseira } from "./ligar-pulseira"

const textos = sistema.primeiroUso

/**
 * Sem conta, o primeiro uso cadastra a pessoa no navegador, com os exemplos.
 * Com conta, o código vai para o servidor e a pulseira entra na família certa.
 * As duas telas têm a mesma moldura, para quem passa de uma para a outra.
 */
export function ConteudoPrimeiroUso() {
  const conta = useConta()

  if (conta) {
    return (
      <>
        <CabecalhoPagina titulo={textos.ligar.titulo} descricao={textos.ligar.descricao} />
        <LigarPulseira />
      </>
    )
  }

  return (
    <>
      <CabecalhoPagina titulo={textos.titulo} descricao={textos.descricao} />
      <AssistentePrimeiroUso />
    </>
  )
}
