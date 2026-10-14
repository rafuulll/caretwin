"use client"

import type { RefObject } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { sistema } from "@/content/site"
import { escolherPessoa, useDados, usePessoaNaTela } from "@/lib/store"
import type { Sessao } from "@/lib/types"
import { Icone } from "./icone"
import { Logo } from "./logo"

type PropsBarraSuperior = {
  sessao: Sessao
  menuAberto: boolean
  aoAbrirMenu: () => void
  aoSair: () => void
  refBotaoMenu: RefObject<HTMLButtonElement | null>
}

/** Avatar sem imagem hospedada: duas letras do nome bastam e nunca quebram. */
function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "?"
  const primeira = partes[0].charAt(0)
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ""
  return (primeira + ultima).toUpperCase()
}

export function BarraSuperior({
  sessao,
  menuAberto,
  aoAbrirMenu,
  aoSair,
  refBotaoMenu,
}: PropsBarraSuperior) {
  const { dados } = useDados()
  const pessoa = usePessoaNaTela()

  return (
    // O fio de baixo é a borda de 1px e mais nada: sem sombra por fora, o
    // relevo do CareTwin é feito de borda, gradiente curto e luz por dentro.
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-hairline bg-canvas/80 px-4 backdrop-blur-md sm:gap-3 sm:px-6 lg:px-8">
      <Button
        ref={refBotaoMenu}
        variante="fantasma"
        onClick={aoAbrirMenu}
        aria-label={sistema.casca.abrirMenu}
        aria-controls="barra-lateral"
        aria-expanded={menuAberto}
        iconeEsquerda={<Icone nome="menu" />}
        className="shrink-0 lg:hidden"
      />

      {/* A marca some junto com a coluna fixa no celular, e volta aqui. */}
      <Link href="/app/painel" className="flex min-w-0 items-center rounded-ds transition-opacity hover:opacity-80 pointer-coarse:min-h-11 max-sm:hidden lg:hidden">
        <Logo />
      </Link>

      {/* Quem cuida acompanha de 1 a 3 pessoas, e todas as telas mostram uma de
          cada vez. A troca mora no topo porque vale pra todas as telas. */}
      {pessoa && (
        <div className="flex min-w-0 items-center gap-1.5 lg:ml-0">
          <Select
            rotulo={sistema.casca.pessoaNaTela}
            ocultarRotulo
            placeholder={null}
            opcoes={dados.pessoas.map((p) => ({ valor: p.id, rotulo: p.nome }))}
            value={pessoa.id}
            onChange={(evento) => escolherPessoa(evento.target.value)}
            classeCampo="min-w-0 w-36 sm:w-48"
            className="h-10 text-sm font-medium pointer-coarse:h-11"
          />
          <Link
            href="/app/primeiro-uso"
            aria-label={sistema.casca.conectarOutra}
            title={sistema.casca.conectarOutra}
            className="grid size-10 shrink-0 place-items-center rounded-ds text-muted transition-colors hover:bg-elevated hover:text-ink pointer-coarse:size-11"
          >
            <Icone nome="mais" className="size-4" />
          </Link>
        </div>
      )}

      <div
        // O tour de boas-vindas aponta pra este bloco: o perfil e o botão de
        // sair, juntos, que é o que a parada dele explica. Ver src/content/tour.ts.
        data-tour="perfil"
        className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3"
      >
        <Link
          href="/app/configuracoes"
          className="flex min-w-0 items-center gap-2.5 rounded-ds pointer-coarse:min-h-11 pointer-coarse:min-w-11"
        >
          <span
            aria-hidden="true"
            // `.realce-interno` é a luz de cima e o peso de baixo em sombra
            // interna, que acompanha a curva do disco. A cor continua sendo a
            // primária sólida, então o par `primary-ink`/`primary` validado nos
            // 71 temas segue valendo atrás da letra.
            className="realce-interno grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-ink"
          >
            {iniciaisDe(sessao.nome)}
          </span>
          {/* Escondido só visualmente no celular: quem usa leitor de tela
              continua sabendo em qual conta está. */}
          <span className="flex min-w-0 flex-col leading-tight max-sm:sr-only">
            <span className="truncate text-sm text-ink">{sessao.nome}</span>
            <span className="truncate text-xs text-muted">{sessao.email}</span>
          </span>
        </Link>

        <span aria-hidden="true" className="hidden h-6 w-px bg-hairline sm:block" />

        <Button
          variante="secundaria"
          onClick={aoSair}
          aria-label={sistema.casca.sair}
          iconeEsquerda={<Icone nome="sair" />}
          className="shrink-0 max-sm:w-10 max-sm:px-0"
        >
          <span className="hidden sm:inline">{sistema.casca.sair}</span>
        </Button>
      </div>
    </header>
  )
}
