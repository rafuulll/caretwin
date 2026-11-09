"use client"
import Image from "next/image"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useRef, useState, type FormEvent } from "react"
import { Icone } from "@/components/app/icone"
import { Logo } from "@/components/app/logo"
import { FormularioConta } from "@/components/auth/formulario-conta"
import { IconeGoogle } from "@/components/auth/icone-google"
import { ModalGoogle } from "@/components/auth/modal-google"
import { Button, Input } from "@/components/ui"
import { entrada, redesign } from "@/content/site"
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
  /**
   * O login com e-mail e senha está ligado NESTE ambiente (Supabase Auth e
   * AUTH_SECRET no `.env.local`). Ligado, o formulário real toma o lugar do
   * simulado. Quem descobre isso também é o servidor, em `page.tsx`.
   */
  contaLigada: boolean
  /** Aviso do login por conta, vindo de `?conta=` no endereço. */
  avisoConta?: string
  /**
   * Se o botão do Google aparece. Em produção, só com as chaves no ambiente:
   * sem elas o botão abriria o passo a passo de configuração para qualquer
   * visitante. No `npm run dev` ele aparece sempre, porque o passo a passo é
   * para o grupo. Decidido no servidor, em `page.tsx`.
   */
  mostrarGoogle?: boolean
  /** Se o Supabase aceita contas novas (ver `cadastroAberto` em `src/lib/conta.ts`). */
  cadastroAberto?: boolean
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

export function FormularioDeEntrada({
  googleLigado,
  aviso,
  contaLigada,
  avisoConta,
  mostrarGoogle = true,
  cadastroAberto = true,
}: FormularioDeEntradaProps) {
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
      <div className="ct-login ct-login-studio">
        <div className="ct-login-form-side">
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

          <main className="ct-login-form">
            {/* O formulário vira um painel apoiado na página: `.superficie-elevada`
                dá o gradiente e o fio de 1px por dentro, `.fio-luz` acende a aresta
                de cima. O `overflow-hidden` é o que segura esse fio dentro do raio. */}
            <div className="ct-login-fields">
              <h1 className="font-display text-2xl text-ink sm:text-[28px] sm:leading-tight">
                {redesign.loginTitle}
              </h1>
              <p className="mt-2.5 text-base leading-relaxed text-muted">{redesign.loginIntro}</p>

              {contaLigada ? (
                <FormularioConta aviso={avisoConta} cadastroAberto={cadastroAberto} />
              ) : (
                <>
                  {/* `noValidate`: a validação é nossa, em português, e some assim que a pessoa corrige. */}
                  <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
                    <Input
                      ref={refUsuario}
                      rotulo={entrada.campos.usuario.rotulo}
                      placeholder={entrada.campos.usuario.placeholder}
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
                </>
              )}
              {mostrarGoogle && (
                <>
                  <div className="mt-8">
                    {/* Com as chaves no ambiente, o botão manda pro Google de
                        verdade, numa navegação de página inteira: o OAuth sai do
                        app e volta. Sem as chaves, ele abre o passo a passo de
                        configuração (só no `npm run dev`; em produção sem as
                        chaves ele nem aparece, ver `mostrarGoogle`). */}
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
                </>
              )}


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
  return <aside className="ct-login-brand" aria-hidden="true">
    <Image src="/brand/ritmo-login-studio.png" alt="" fill priority sizes="(max-width:767px) 1px, (max-width:1200px) 48vw, 560px" />
  </aside>
}
