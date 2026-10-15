"use client"

import { useRef, useState, type FormEvent, type ReactNode } from "react"
import { Icone } from "@/components/app/icone"
import { Button, Input } from "@/components/ui"
import { entrada } from "@/content/site"
import { useFragmento } from "./use-fragmento"

const textos = entrada.conta

/** Só confere o formato. Quem decide se o e-mail existe é o Supabase. */
const PARECE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENHA_MINIMA = 8

const ROTAS = {
  entrar: "/api/auth/conta/entrar",
  criar: "/api/auth/conta/criar",
  recuperar: "/api/auth/conta/recuperar",
} as const

type Modo = keyof typeof ROTAS
type Erros = { nome?: string; email?: string; senha?: string }
type Resposta = { ok?: boolean; motivo?: string; confirmar?: boolean }

function textoDoMotivo(motivo: string | undefined): string {
  const motivos = textos.motivos as Record<string, string | undefined>
  return (motivo && motivos[motivo]) || textos.motivos.falhou
}

export type FormularioContaProps = {
  /** Aviso vindo de `?conta=` no endereço, já traduzido pela página. */
  aviso?: string
}

/**
 * Entrar, criar conta e esqueci minha senha, no mesmo lugar.
 *
 * Os três modos dividem os campos de propósito: quem digitou o e-mail para
 * entrar e descobriu que esqueceu a senha não precisa digitar de novo.
 *
 * A senha continua fora do estado do React, como no formulário simulado: ela é
 * lida do campo só na hora de enviar e vai direto para a rota do servidor.
 */
export function FormularioConta({ aviso }: FormularioContaProps) {
  const [modo, setModo] = useState<Modo>("entrar")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [erros, setErros] = useState<Erros>({})
  const [falha, setFalha] = useState<string>()
  const [enviado, setEnviado] = useState<string>()
  const [ocupado, setOcupado] = useState(false)
  const refNome = useRef<HTMLInputElement>(null)
  const refEmail = useRef<HTMLInputElement>(null)
  const refSenha = useRef<HTMLInputElement>(null)

  // Um link de e-mail vencido volta com o erro depois do #.
  const fragmento = useFragmento()
  const linkVencido = Boolean(fragmento?.get("error_code") || fragmento?.get("error"))
  const avisoNaTela = linkVencido ? textos.avisos.linkExpirado : aviso

  function trocarModo(novo: Modo) {
    setModo(novo)
    setErros({})
    setFalha(undefined)
    setEnviado(undefined)
    if (refSenha.current) refSenha.current.value = ""
  }

  function conferir(senha: string): Erros {
    const novos: Erros = {}
    if (modo === "criar" && nome.trim().length < 2) novos.nome = textos.campos.nome.erro
    if (!PARECE_EMAIL.test(email.trim())) novos.email = textos.campos.email.erro
    if (modo === "entrar" && senha.length === 0) novos.senha = textos.campos.senha.erro
    if (modo === "criar" && senha.length < SENHA_MINIMA) novos.senha = textos.campos.senha.erroCurta
    return novos
  }

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (ocupado) return

    const senha = refSenha.current?.value ?? ""
    const novos = conferir(senha)
    if (novos.nome || novos.email || novos.senha) {
      setErros(novos)
      // O foco vai para o primeiro campo com erro, na ordem da tela.
      ;(novos.nome ? refNome : novos.email ? refEmail : refSenha).current?.focus()
      return
    }

    setErros({})
    setFalha(undefined)
    setOcupado(true)

    const corpo =
      modo === "entrar"
        ? { email: email.trim(), senha }
        : modo === "criar"
          ? { nome: nome.trim(), email: email.trim(), senha }
          : { email: email.trim() }

    let resposta: Resposta
    try {
      const r = await fetch(ROTAS[modo], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      })
      resposta = (await r.json().catch(() => ({}))) as Resposta
      if (!r.ok) resposta.ok = false
    } catch {
      resposta = { ok: false, motivo: "indisponivel" }
    }

    if (!resposta.ok) {
      setFalha(textoDoMotivo(resposta.motivo))
      setOcupado(false)
      return
    }

    if (modo === "recuperar" || (modo === "criar" && resposta.confirmar)) {
      if (refSenha.current) refSenha.current.value = ""
      setEnviado(modo === "recuperar" ? textos.recuperar.enviado : textos.criar.enviado)
      setOcupado(false)
      return
    }

    // Carga inteira de propósito: o app pergunta ao servidor quem entrou, e é
    // o cookie recém-gravado que responde.
    window.location.assign("/app/painel")
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-5">
        <p
          role="status"
          className="rounded-ds-fine border border-hairline bg-elevated px-4 py-3 text-base leading-relaxed text-ink"
        >
          {enviado}
        </p>
        <Button variante="secundaria" tamanho="lg" larguraTotal onClick={() => trocarModo("entrar")}>
          {textos.trocar.voltar}
        </Button>
      </div>
    )
  }

  return (
    <div>
      {modo !== "entrar" && (
        <div className="mb-5">
          <h2 className="text-lg font-medium text-ink">{textos[modo].titulo}</h2>
          <p className="mt-1.5 text-base leading-relaxed text-muted">{textos[modo].texto}</p>
        </div>
      )}

      {avisoNaTela && modo === "entrar" && (
        <p
          role="status"
          className="mb-5 rounded-ds-fine border border-hairline bg-elevated px-3 py-2.5 text-sm leading-relaxed text-ink"
        >
          {avisoNaTela}
        </p>
      )}

      {/* `noValidate`: a validação é nossa, em português, e some assim que a pessoa corrige. */}
      <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
        {modo === "criar" && (
          <Input
            ref={refNome}
            rotulo={textos.campos.nome.rotulo}
            placeholder={textos.campos.nome.placeholder}
            ajuda={textos.campos.nome.ajuda}
            erro={erros.nome}
            obrigatorio
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value)
              if (erros.nome) setErros((atual) => ({ ...atual, nome: undefined }))
            }}
            autoComplete="name"
          />
        )}

        <Input
          ref={refEmail}
          type="email"
          inputMode="email"
          rotulo={textos.campos.email.rotulo}
          placeholder={textos.campos.email.placeholder}
          erro={erros.email}
          obrigatorio
          value={email}
          onChange={(evento) => {
            setEmail(evento.target.value)
            if (erros.email) setErros((atual) => ({ ...atual, email: undefined }))
          }}
          autoComplete={modo === "criar" ? "email" : "username"}
          autoCapitalize="none"
          spellCheck={false}
        />

        {modo !== "recuperar" && (
          <Input
            ref={refSenha}
            type="password"
            rotulo={textos.campos.senha.rotulo}
            ajuda={modo === "criar" ? textos.campos.senha.ajudaNova : undefined}
            erro={erros.senha}
            obrigatorio
            autoComplete={modo === "criar" ? "new-password" : "current-password"}
            onChange={() => {
              if (erros.senha) setErros((atual) => ({ ...atual, senha: undefined }))
            }}
          />
        )}

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
          {textos[modo].botao}
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-start">
        {modo === "entrar" ? (
          <>
            <BotaoDeTroca aoClicar={() => trocarModo("recuperar")}>{textos.trocar.esqueci}</BotaoDeTroca>
            <BotaoDeTroca aoClicar={() => trocarModo("criar")}>{textos.trocar.criar}</BotaoDeTroca>
          </>
        ) : (
          <BotaoDeTroca aoClicar={() => trocarModo("entrar")}>
            {modo === "criar" ? textos.trocar.jaTenho : textos.trocar.voltar}
          </BotaoDeTroca>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{textos.nota}</p>
    </div>
  )
}

/** Parece link, mas troca o modo sem sair da página. Alvo de toque de 44 px. */
function BotaoDeTroca({ aoClicar, children }: { aoClicar: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
    >
      {children}
    </button>
  )
}
