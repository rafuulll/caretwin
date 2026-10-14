"use client"

import { useState, type ReactNode } from "react"
import { BotaoLink } from "@/components/marketing/botao-link"
import { Button, Card, EstadoVazio } from "@/components/ui"
import { sistema } from "@/content/site"
import { aprendizado, temDados } from "@/lib/consultas"
import { contar, preencher } from "@/lib/formato"
import { useDados } from "@/lib/store"
import type { Pessoa } from "@/lib/types"
import { Icone } from "./icone"

const textos = sistema.comum

/**
 * O que toda tela do produto mostra antes de ter o que mostrar.
 *
 * São dois vazios diferentes, e cada um tem a sua saída: ninguém conectou
 * pulseira nenhuma ainda (a saída é conectar), ou a pulseira está conectada e
 * os dados ainda não chegaram (a saída é esperar, e aqui dá pra simular a
 * chegada). Uma tela com zeros no lugar disso pareceria defeito.
 */
export function EstadoDaPessoa({
  pessoa,
  children,
}: {
  pessoa: Pessoa | null
  children: (pessoa: Pessoa) => ReactNode
}) {
  const { dados, sincronizarPulseira } = useDados()
  const [aviso, setAviso] = useState("")

  if (!pessoa) {
    return (
      <Card>
        <EstadoVazio
          icone={<Icone nome="pulseira" />}
          titulo={textos.semPessoa.titulo}
          texto={textos.semPessoa.texto}
          acao={
            <BotaoLink href="/app/primeiro-uso" tamanho="lg" iconeEsquerda={<Icone nome="mais" />}>
              {textos.semPessoa.acao}
            </BotaoLink>
          }
        />
      </Card>
    )
  }

  if (!temDados(dados, pessoa.id)) {
    return (
      <Card>
        <EstadoVazio
          icone={<Icone nome="sincronizar" />}
          titulo={textos.esperandoDados.titulo}
          texto={preencher(textos.esperandoDados.texto, { nome: pessoa.nome })}
          acao={
            <Button
              tamanho="lg"
              iconeEsquerda={<Icone nome="sincronizar" />}
              onClick={() => {
                sincronizarPulseira(pessoa.id)
                setAviso(textos.esperandoDados.feito)
              }}
            >
              {textos.esperandoDados.acao}
            </Button>
          }
        />
        {/* Sempre no DOM: região viva que só aparece depois não é anunciada. */}
        <p role="status" className="sr-only">
          {aviso}
        </p>
      </Card>
    )
  }

  return <>{children(pessoa)}</>
}

/**
 * O aviso de quem ainda está nos primeiros dias. Diz quantos faltam, porque
 * "ainda aprendendo" sem número parece um app que nunca vai terminar.
 */
export function AindaAprendendo({ pessoa }: { pessoa: Pessoa }) {
  const { dados } = useDados()
  const { feitos, total, faltam } = aprendizado(dados, pessoa.id)
  if (faltam <= 0) return null

  return (
    <div className="flex gap-3 rounded-ds-surface border border-hairline bg-surface p-4">
      <Icone nome="aprendendo" className="mt-0.5 size-5 shrink-0 text-[var(--ds-primary-accent)]" />
      <div>
        <p className="font-medium text-ink">{preencher(textos.aprendendo.titulo, { nome: pessoa.nome })}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {preencher(textos.aprendendo.texto, {
            feitos,
            total,
            faltam: contar(faltam, ...textos.contagens.dia),
          })}
        </p>
      </div>
    </div>
  )
}
