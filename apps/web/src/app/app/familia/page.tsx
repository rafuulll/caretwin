"use client"

import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { FamiliaDaPessoa } from "@/components/app/familia/familia-da-pessoa"
import { Pendencias } from "@/components/app/familia/pendencias"
import { SemFamilia } from "@/components/app/familia/sem-familia"
import { Icone } from "@/components/app/icone"
import { Card, EstadoVazio } from "@/components/ui"
import { sistema } from "@/content/site"
import { preencher } from "@/lib/formato"
import { useConta, usePessoaNaTela } from "@/lib/store"

const textos = sistema.familia

/**
 * Família: quem acompanha a pessoa que está na tela, os pedidos para entrar e
 * a saída de quem olha (cartões 5.9 e 7.10). A troca de pessoa é a mesma do
 * topo do app, como em todas as outras telas.
 */
export default function PaginaFamilia() {
  const conta = useConta()
  const pessoa = usePessoaNaTela()
  const vinculo = pessoa && conta ? conta.vinculos[pessoa.id] : undefined

  return (
    <>
      <CabecalhoPagina
        titulo={textos.titulo}
        descricao={pessoa && conta ? preencher(textos.descricao, { nome: pessoa.nome }) : undefined}
      />

      {!conta ? (
        <Card>
          <EstadoVazio icone={<Icone nome="familia" />} titulo={textos.semConta.titulo} texto={textos.semConta.texto} />
        </Card>
      ) : !pessoa || !vinculo ? (
        <SemFamilia conta={conta} />
      ) : (
        <div className="flex flex-col gap-5 sm:gap-6">
          {/* A chave zera a tela ao trocar de pessoa: a lista de uma família
              não pode aparecer, nem por um instante, com o nome de outra. */}
          <FamiliaDaPessoa key={pessoa.id} pessoa={pessoa} vinculo={vinculo} euId={conta.eu.id} />
          <Pendencias />
        </div>
      )}
    </>
  )
}
