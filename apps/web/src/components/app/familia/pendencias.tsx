"use client"

import { useState } from "react"
import { Button, Card, CardCabecalho, CardConteudo, CardTitulo } from "@/components/ui"
import { sistema } from "@/content/site"
import { dataPorExtenso, diaDoCarimbo, preencher, tempoDesde } from "@/lib/formato"
import { familia, useConta } from "@/lib/store"
import { Icone } from "../icone"
import { mensagemDaRecusa } from "./mensagem"
import { Recados } from "./recados"

const textos = sistema.familia

/**
 * O que é da conta, e não de uma pessoa: os pedidos que ela fez e ainda
 * esperam resposta, e os acompanhamentos que ela encerrou e ainda dá para
 * recuperar. Aparece na tela sem família (onde costuma ser tudo o que a conta
 * tem) e no fim da tela Família.
 */
export function Pendencias() {
  const conta = useConta()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [aviso, setAviso] = useState("")
  const [erro, setErro] = useState("")

  if (!conta) return null
  const { pedidosPendentes, encerradas } = conta.eu
  const agora = new Date()

  async function desistir(pessoaId: string, codigo: string) {
    setOcupado(pessoaId)
    setErro("")
    const resposta = await familia.sair(pessoaId)
    setOcupado(null)
    if (resposta.ok) setAviso(preencher(textos.pendencias.desistiu, { codigo }))
    else setErro(resposta.status === 404 ? textos.erros.mudou : mensagemDaRecusa(resposta, textos.erros))
  }

  async function recuperar(pessoaId: string, nome: string) {
    setOcupado(pessoaId)
    setErro("")
    const resposta = await familia.recuperar(pessoaId)
    setOcupado(null)
    if (resposta.ok) setAviso(preencher(textos.pendencias.recuperado, { nome }))
    else setErro(resposta.status === 404 ? textos.erros.mudou : mensagemDaRecusa(resposta, textos.erros))
  }

  return (
    <>
      {pedidosPendentes.length > 0 && (
        <Card>
          <CardCabecalho>
            <CardTitulo como="h2">{textos.pendencias.pedidosTitulo}</CardTitulo>
          </CardCabecalho>
          <CardConteudo>
            <ul className="flex flex-col divide-y divide-hairline">
              {pedidosPendentes.map((pedido) => (
                <li key={pedido.pessoaId} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Icone nome="relogio" className="size-5 shrink-0 text-muted" />
                  <p className="min-w-0 flex-1 text-base text-ink">
                    {preencher(textos.pendencias.pedidoItem, {
                      codigo: pedido.codigo,
                      papel: textos.papeisNoPedido[pedido.papel],
                      quando: tempoDesde(pedido.criadoEm, agora),
                    })}
                  </p>
                  <Button
                    variante="secundaria"
                    carregando={ocupado === pedido.pessoaId}
                    disabled={ocupado !== null}
                    aria-label={preencher(textos.pendencias.rotuloDesistir, { codigo: pedido.codigo })}
                    onClick={() => desistir(pedido.pessoaId, pedido.codigo)}
                    className="pointer-coarse:min-h-11"
                  >
                    {textos.pendencias.desistir}
                  </Button>
                </li>
              ))}
            </ul>
          </CardConteudo>
        </Card>
      )}

      {encerradas.length > 0 && (
        <Card>
          <CardCabecalho>
            <CardTitulo como="h2">{textos.pendencias.encerradasTitulo}</CardTitulo>
          </CardCabecalho>
          <CardConteudo>
            <ul className="flex flex-col divide-y divide-hairline">
              {encerradas.map((encerrada) => (
                <li key={encerrada.pessoaId} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-ink">{encerrada.nome}</p>
                    <p className="text-sm text-muted">
                      {preencher(textos.pendencias.encerradaItem, {
                        data: dataPorExtenso(diaDoCarimbo(encerrada.apagaEm)).toLowerCase(),
                      })}
                    </p>
                  </div>
                  <Button
                    variante="secundaria"
                    iconeEsquerda={<Icone nome="restaurar" />}
                    carregando={ocupado === encerrada.pessoaId}
                    disabled={ocupado !== null}
                    aria-label={preencher(textos.pendencias.rotuloRecuperar, { nome: encerrada.nome })}
                    onClick={() => recuperar(encerrada.pessoaId, encerrada.nome)}
                    className="pointer-coarse:min-h-11"
                  >
                    {textos.pendencias.recuperar}
                  </Button>
                </li>
              ))}
            </ul>
          </CardConteudo>
        </Card>
      )}

      <Recados aviso={aviso} erro={erro} />
    </>
  )
}
