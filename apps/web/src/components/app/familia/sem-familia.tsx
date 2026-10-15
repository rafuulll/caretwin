"use client"

import { useState } from "react"
import { BotaoLink } from "@/components/marketing/botao-link"
import { Button, Card, EstadoVazio } from "@/components/ui"
import { sistema } from "@/content/site"
import { recarregarConta, type EstadoDaConta } from "@/lib/store"
import { Icone } from "../icone"
import { Pendencias } from "./pendencias"

const textos = sistema.comum.conta

/**
 * O que a conta vê quando não tem ninguém na tela: ou ainda não ligou
 * pulseira nenhuma, ou pediu para entrar e espera a resposta (cartão 7.2).
 * Os pedidos e os encerramentos recuperáveis vêm logo abaixo, porque costumam
 * ser tudo o que essa conta tem para fazer.
 */
export function SemFamilia({ conta }: { conta: EstadoDaConta }) {
  const [tentando, setTentando] = useState(false)

  if (conta.falhou) {
    return (
      <Card>
        <EstadoVazio
          icone={<Icone nome="sincronizar" />}
          titulo={textos.falhou.titulo}
          texto={textos.falhou.texto}
          acao={
            <Button
              tamanho="lg"
              carregando={tentando}
              iconeEsquerda={<Icone nome="sincronizar" />}
              onClick={async () => {
                setTentando(true)
                await recarregarConta()
                setTentando(false)
              }}
            >
              {textos.falhou.acao}
            </Button>
          }
        />
      </Card>
    )
  }

  const esperando = conta.eu.pedidosPendentes.length > 0

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <Card>
        <EstadoVazio
          icone={<Icone nome={esperando ? "relogio" : "pulseira"} />}
          titulo={esperando ? textos.esperando.titulo : textos.semVinculo.titulo}
          texto={esperando ? textos.esperando.texto : textos.semVinculo.texto}
          acao={
            <BotaoLink
              href="/app/primeiro-uso"
              tamanho="lg"
              variante={esperando ? "secundaria" : "primaria"}
              iconeEsquerda={<Icone nome="mais" />}
            >
              {esperando ? textos.outra : textos.semVinculo.acao}
            </BotaoLink>
          }
        />
      </Card>
      <Pendencias />
    </div>
  )
}
