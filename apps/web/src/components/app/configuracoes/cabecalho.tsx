"use client"

import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { sistema } from "@/content/site"
import { useConta } from "@/lib/store"

const copy = sistema.configuracoes

/** Com conta não existem dados de exemplo, e a descrição não pode prometer o que a tela não tem. */
export function CabecalhoConfiguracoes() {
  const conta = useConta()
  return <CabecalhoPagina titulo={copy.titulo} descricao={conta ? copy.descricaoConta : copy.descricao} />
}
