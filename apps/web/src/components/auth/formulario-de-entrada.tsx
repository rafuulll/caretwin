"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useRef, useState, type FormEvent } from "react"
import { Icone } from "@/components/app/icone"
import { Logo } from "@/components/app/logo"
import { IconeGoogle } from "@/components/auth/icone-google"
import { ModalGoogle } from "@/components/auth/modal-google"
import { Button, Input } from "@/components/ui"
import { entrada, landing, marca } from "@/content/site"
import { entrar } from "@/lib/store"

/** Só pra separar quem digitou um e-mail de quem digitou o nome. Não julga se o endereço existe. */
const PARECE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type FormularioDeEntradaProps = {
  /**
   * O login com Google está ligado NESTE ambiente: as duas chaves do Google e o
   * AUTH_SECRET estão no `.env.local`. Quem descobre isso é o servidor, em
   * `page.tsx`, porque as chaves não podem ser lidas daqui.
   */
  googleLigado: boolean
  /** Motivo de um login que não deu certo, vindo de `?google=` no endereço. */
  aviso?: string
}

type Erros = { usuario?: string; senha?: string }

/** "marina.alves@email.com" vira "Marina Alves": é o que aparece no topo do app. */
function nomeDoEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ")
}

export function FormularioDeEntrada({ googleLigado, aviso }: FormularioDeEntradaProps) {
  const router = useRouter()
  const [usuario, setUsuario] = useState("")
  const [erros, setErros] = useState<Erros>({})
  const [modalAberto, setModalAberto] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const [indoParaOGoogle, setIndoParaOGoogle] = useState(false)
  const refUsuario = useRef<HTMLInputElement>(null)
  /*
    A SENHA NÃO É GUARDADA, e é de propósito, não esquecimento.

    Ela é lida direto do campo, por esta referência, só pra saber se a pessoa
    escreveu alguma coisa. Não vira estado do React, não vai pro localStorage,
    não entra na sessão e não sai do navegador. Nesta versão não existe servidor
    pra conferir a senha, e guardar senha sem ter como protegê-la seria pior que
    não pedir. Quando o login de verdade for ligado (Google, ou a API do
    CareTwin), quem confere a senha é o servidor.
  */
  const refSenha = useRef<HTMLInputElement>(null)

  const seguirParaOApp = useCallback(
    (texto: string) => {
      setEntrando(true)
      const email = PARECE_EMAIL.test(texto) ? texto : undefined
      entrar(email ? nomeDoEmail(email) || texto : texto, email)
      // `replace` porque voltar depois de entrar cairia de novo nesta tela.
      router.replace("/app/painel")
    },
    [router]
  )

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const texto = usuario.trim()
    const senhaPreenchida = (refSenha.current?.value ?? "").length > 0
    const novos: Erros = {}
    if (texto.length < 2) novos.usuario = entrada.campos.usuario.erro
    if (!senhaPreenchida) novos.senha = entrada.campos.senha.erro

    if (novos.usuario || novos.senha) {
      setErros(novos)
      // O foco volta pro primeiro campo com erro, na ordem da tela.
      ;(novos.usuario ? refUsuario : refSenha).current?.focus()
      return
    }

    seguirParaOApp(texto)
  }

  return (
    <>
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex min-w-0 flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-20">
          <header className="flex items-center justify-between gap-4">
            <Logo />

            <Link
              href="/"
              className="-mx-2 inline-flex items-center gap-1.5 rounded-ds px-2 py-2 text-sm text-muted transition-colors duration-150 hover:text-ink pointer-coarse:min-h-11"
            >
              <Icone nome="seta-esquerda" className="size-4" />
              {entrada.voltar}
            </Link>
          </header>

          <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12 sm:py-16">
            {/* O formulário vira um painel apoiado na página: `.superficie-elevada`
                dá o gradiente e o fio de 1px por dentro, `.fio-luz` acende a aresta
                de cima. O `overflow-hidden` é o que segura esse fio dentro do raio. */}
            <div className="superficie-elevada fio-luz overflow-hidden rounded-ds-surface border border-hairline p-6 sm:p-8">
              <h1 className="font-display text-2xl text-ink sm:text-[28px] sm:leading-tight">
                {entrada.titulo}
              </h1>
              <p className="mt-2.5 text-base leading-relaxed text-muted">{entrada.subtitulo}</p>

              <div className="mt-8">
                {/* Com as chaves no ambiente, o botão manda pro Google de
                    verdade, numa navegação de página inteira: o OAuth sai do
                    app e volta. Sem as chaves, ele abre o passo a passo de
                    configuração. Ele nunca some e nunca fica apagado. */}
                <Button
                  variante="secundaria"
                  tamanho="lg"
                  larguraTotal
                  iconeEsquerda={<IconeGoogle />}
                  carregando={indoParaOGoogle}
                  onClick={() => {
                    if (!googleLigado) {
                      setModalAberto(true)
                      return
                    }
                    setIndoParaOGoogle(true)
                    window.location.href = "/api/auth/google"
                  }}
                >
                  {entrada.google.botao}
                </Button>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {googleLigado ? entrada.google.ajudaLigado : entrada.google.ajuda}
                </p>

                {aviso && (
                  <p
                    role="alert"
                    className="mt-3 rounded-ds-fine border border-hairline bg-elevated px-3 py-2.5 text-sm leading-relaxed text-ink"
                  >
                    {aviso}
                  </p>
                )}
              </div>

              <div className="my-7 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-xs tracking-[0.16em] text-muted uppercase">{entrada.separador}</span>
                <span className="h-px flex-1 bg-hairline" />
              </div>

              {/* `noValidate`: a validação é nossa, em português, e some assim que a pessoa corrige. */}
              <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
                <Input
                  ref={refUsuario}
                  rotulo={entrada.campos.usuario.rotulo}
                  placeholder={entrada.campos.usuario.placeholder}
                  ajuda={entrada.campos.usuario.ajuda}
                  erro={erros.usuario}
                  obrigatorio
                  value={usuario}
                  onChange={(evento) => {
                    setUsuario(evento.target.value)
                    if (erros.usuario) setErros((atual) => ({ ...atual, usuario: undefined }))
                  }}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                />

                <Input
                  ref={refSenha}
                  rotulo={entrada.campos.senha.rotulo}
                  ajuda={entrada.campos.senha.ajuda}
                  erro={erros.senha}
                  obrigatorio
                  type="password"
                  autoComplete="current-password"
                  onChange={() => {
                    if (erros.senha) setErros((atual) => ({ ...atual, senha: undefined }))
                  }}
                />

                <Button
                  type="submit"
                  tamanho="lg"
                  larguraTotal
                  carregando={entrando}
                  className="mt-1 h-14 text-lg"
                  iconeDireita={<Icone nome="seta-direita" />}
                >
                  {entrada.entrar}
                </Button>
              </form>

              <p className="mt-5 text-sm leading-relaxed text-muted">
                {entrada.aviso.texto}{" "}
                <Link
                  href="/como-usar"
                  className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4 pointer-fine:min-h-0"
                >
                  {entrada.aviso.link}
                </Link>
                .
              </p>
            </div>
          </main>
        </div>

        <PainelDaMarca />
      </div>

      <ModalGoogle aberto={modalAberto} aoFechar={() => setModalAberto(false)} />
    </>
  )
}

/**
 * Vitrine da marca, só no computador. No celular ela viraria uma rolagem antes
 * do formulário, e quem abriu a tela de entrar veio entrar.
 *
 * O conteúdo é o mesmo do site, de propósito: a coluna acompanha qualquer
 * mudança de texto sem virar cópia divergente.
 */
function PainelDaMarca() {
  return (
    <aside className="aura-secao hidden overflow-hidden border-l border-hairline bg-surface lg:block">
      <div className="relative flex h-full flex-col justify-center gap-12 px-12 py-16 xl:px-20">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium tracking-wide text-ink uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {landing.hero.eyebrow}
          </p>
          <h2 className="mt-3 max-w-[18ch] font-display text-[32px] leading-[1.15] text-ink xl:text-[38px]">
            {marca.tagline}
          </h2>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-muted">{marca.descricaoCurta}</p>
        </div>

        <ul className="flex max-w-[46ch] flex-col gap-6">
          {landing.beneficios.itens.map((item) => (
            <li key={item.titulo} className="flex gap-3.5">
              <span className="superficie-elevada mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-ds border border-hairline text-[var(--ds-primary-accent)]">
                <Icone nome={item.icone} className="size-[18px]" />
              </span>
              <div>
                <p className="text-base font-medium text-ink">{item.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
