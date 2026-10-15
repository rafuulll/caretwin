"use client"

import Link from "next/link"
import { useRef, useState, type FormEvent, type ReactNode } from "react"
import { Icone } from "@/components/app/icone"
import { Logo } from "@/components/app/logo"
import { Button, Input } from "@/components/ui"
import { entrada } from "@/content/site"
import { useFragmento } from "./use-fragmento"

const textos = entrada.conta
const SENHA_MINIMA = 8

type Erros = { senha?: string; repetir?: string }

export type FormularioNovaSenhaProps = {
  /** O login com e-mail está ligado neste ambiente. Quem sabe é o servidor. */
  ligado: boolean
}

/**
 * A página do link "esqueci minha senha".
 *
 * O Supabase devolve a pessoa para cá com o token depois do #. A página lê o
 * token, tira ele da barra de endereço, e só manda para o servidor junto com a
 * senha nova. Dando certo, a pessoa já entra.
 */
export function FormularioNovaSenha({ ligado }: FormularioNovaSenhaProps) {
  const fragmento = useFragmento()
  const token = fragmento?.get("type") === "recovery" ? fragmento.get("access_token") : null
  const linkVencido = Boolean(fragmento?.get("error_code") || fragmento?.get("error"))

  const [erros, setErros] = useState<Erros>({})
  const [falha, setFalha] = useState<string>()
  const [ocupado, setOcupado] = useState(false)
  const refSenha = useRef<HTMLInputElement>(null)
  const refRepetir = useRef<HTMLInputElement>(null)

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (ocupado || !token) return

    const senha = refSenha.current?.value ?? ""
    const repetida = refRepetir.current?.value ?? ""
    const novos: Erros = {}
    if (senha.length < SENHA_MINIMA) novos.senha = textos.campos.senha.erroCurta
    else if (senha !== repetida) novos.repetir = textos.novaSenha.erroDiferente
    if (novos.senha || novos.repetir) {
      setErros(novos)
      ;(novos.senha ? refSenha : refRepetir).current?.focus()
      return
    }

    setErros({})
    setFalha(undefined)
    setOcupado(true)

    let ok = false
    let motivo: string | undefined
    try {
      const r = await fetch("/api/auth/conta/nova-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      })
      const corpo = (await r.json().catch(() => ({}))) as { ok?: boolean; motivo?: string }
      ok = r.ok && corpo.ok === true
      motivo = corpo.motivo
    } catch {
      motivo = "indisponivel"
    }

    if (!ok) {
      const motivos = textos.motivos as Record<string, string | undefined>
      setFalha((motivo && motivos[motivo]) || textos.motivos.falhou)
      setOcupado(false)
      return
    }

    window.location.assign("/app/painel")
  }

  let conteudo: ReactNode
  if (!ligado) conteudo = <Recado texto={textos.novaSenha.desligado} />
  else if (fragmento === null) conteudo = <p className="text-base text-muted">{textos.novaSenha.carregando}</p>
  else if (linkVencido) conteudo = <Recado texto={textos.motivos.link_expirado} />
  else if (!token) conteudo = <Recado texto={textos.novaSenha.semLink} />
  else {
    conteudo = (
      <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
        <Input
          ref={refSenha}
          type="password"
          rotulo={textos.novaSenha.rotulo}
          ajuda={textos.novaSenha.ajuda}
          erro={erros.senha}
          obrigatorio
          autoComplete="new-password"
          onChange={() => {
            if (erros.senha) setErros((atual) => ({ ...atual, senha: undefined }))
          }}
        />
        <Input
          ref={refRepetir}
          type="password"
          rotulo={textos.novaSenha.repetir}
          erro={erros.repetir}
          obrigatorio
          autoComplete="new-password"
          onChange={() => {
            if (erros.repetir) setErros((atual) => ({ ...atual, repetir: undefined }))
          }}
        />

        {falha && (
          <p
            role="alert"
            className="rounded-ds-fine border border-hairline bg-elevated px-3 py-2.5 text-sm leading-relaxed text-ink"
          >
            {falha}
          </p>
        )}

        <Button
          type="submit"
          tamanho="lg"
          larguraTotal
          carregando={ocupado}
          className="mt-1 h-14 text-lg"
          iconeDireita={<Icone nome="seta-direita" />}
        >
          {textos.novaSenha.botao}
        </Button>
      </form>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between gap-4">
        <Logo />
        <Link
          href="/entrar"
          className="-mx-2 inline-flex items-center gap-1.5 rounded-ds px-2 py-2 text-sm text-muted transition-colors duration-150 hover:text-ink pointer-coarse:min-h-11"
        >
          <Icone nome="seta-esquerda" className="size-4" />
          {textos.trocar.voltar}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12 sm:py-16">
        <div className="superficie-elevada fio-luz overflow-hidden rounded-ds-surface border border-hairline p-6 sm:p-8">
          <h1 className="font-display text-2xl text-ink sm:text-[28px] sm:leading-tight">
            {textos.novaSenha.titulo}
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-muted">{textos.novaSenha.subtitulo}</p>
          <div className="mt-8">{conteudo}</div>
        </div>
      </main>
    </div>
  )
}

/** Quando não dá para trocar a senha por aqui: o motivo e o caminho de volta. */
function Recado({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-ds-fine border border-hairline bg-elevated px-4 py-3 text-base leading-relaxed text-ink">
        {texto}
      </p>
      <Link
        href="/entrar"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
      >
        {textos.novaSenha.irParaEntrar}
      </Link>
    </div>
  )
}
