"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { z } from "zod"
import { BotaoLink } from "@/components/marketing/botao-link"
import { Button, Card, Input } from "@/components/ui"
import { sistema } from "@/content/site"
import { DIAS_PARA_CONHECER_O_NORMAL } from "@/lib/modelo"
import { preencher } from "@/lib/formato"
import { escolherPessoa, useDados } from "@/lib/store"
import { Icone } from "../icone"

const textos = sistema.primeiroUso

/** O código impresso na pulseira: CT, traço e quatro letras ou números. */
const esquemaCodigo = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/^CT(?!-)/, "CT-"))
  .pipe(z.string().regex(/^CT-[A-Z0-9]{4}$/, textos.erros.codigo))

const esquemaPerfil = z.object({
  nome: z.string().trim().min(2, textos.erros.nome),
  quemAcompanha: z.string().trim().min(2, textos.erros.quemAcompanha),
})

type Passo = 0 | 1 | 2

/**
 * O primeiro uso: conectar a pulseira e criar o perfil, em três passos curtos.
 *
 * Um passo por tela porque quem faz isto pode ser uma pessoa idosa com a
 * pulseira numa mão e o celular na outra: um campo de cada vez, com o botão de
 * continuar sempre no mesmo lugar. O foco vai pro título de cada passo novo,
 * pra quem usa leitor de tela saber onde chegou.
 */
export function AssistentePrimeiroUso() {
  const { dados, cadastrarPessoa } = useDados()
  const [passo, setPasso] = useState<Passo>(0)
  const [codigo, setCodigo] = useState("")
  const [nome, setNome] = useState("")
  const [quemAcompanha, setQuemAcompanha] = useState("")
  const [erros, setErros] = useState<{ codigo?: string; nome?: string; quemAcompanha?: string }>({})
  const [criadaNome, setCriadaNome] = useState("")

  const refTitulo = useRef<HTMLHeadingElement>(null)
  const refCodigo = useRef<HTMLInputElement>(null)
  const refNome = useRef<HTMLInputElement>(null)
  const refQuem = useRef<HTMLInputElement>(null)
  const primeiraVez = useRef(true)

  useEffect(() => {
    // Na primeira montagem o foco fica onde a página deixou; daí em diante, ele
    // acompanha o passo.
    if (primeiraVez.current) {
      primeiraVez.current = false
      return
    }
    refTitulo.current?.focus()
  }, [passo])

  function enviarCodigo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const resultado = esquemaCodigo.safeParse(codigo)
    if (!resultado.success) {
      setErros({ codigo: resultado.error.issues[0]?.message })
      refCodigo.current?.focus()
      return
    }
    if (dados.pulseiras.some((p) => p.codigo === resultado.data)) {
      setErros({ codigo: textos.erros.codigoEmUso })
      refCodigo.current?.focus()
      return
    }
    setCodigo(resultado.data)
    setErros({})
    setPasso(1)
  }

  function enviarPerfil(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const resultado = esquemaPerfil.safeParse({ nome, quemAcompanha })
    if (!resultado.success) {
      const novos: typeof erros = {}
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0] as "nome" | "quemAcompanha"
        novos[campo] ??= problema.message
      }
      setErros(novos)
      // O foco vai pro primeiro campo com erro, na ordem da tela.
      ;(novos.nome ? refNome : refQuem).current?.focus()
      return
    }
    const pessoa = cadastrarPessoa({ ...resultado.data, codigoPulseira: codigo })
    escolherPessoa(pessoa.id)
    setCriadaNome(pessoa.nome)
    setErros({})
    setPasso(2)
  }

  return (
    <Card className="mx-auto w-full max-w-xl p-5 sm:p-8">
      <ol className="mb-6 flex gap-2" aria-label={preencher(textos.progresso, { n: passo + 1, total: 3 })}>
        {textos.passos.map((rotulo, indice) => (
          <li key={rotulo} className="flex-1">
            <span
              aria-hidden="true"
              className={indice <= passo ? "block h-1.5 rounded-full bg-primary" : "block h-1.5 rounded-full bg-elevated"}
            />
            <span className={indice === passo ? "mt-2 block text-sm font-medium text-ink" : "mt-2 block text-sm text-muted"}>
              {rotulo}
            </span>
          </li>
        ))}
      </ol>

      <p className="text-sm text-muted">{preencher(textos.progresso, { n: passo + 1, total: 3 })}</p>

      {passo === 0 && (
        <form noValidate onSubmit={enviarCodigo} className="mt-2 flex flex-col gap-5">
          <div>
            <h2 ref={refTitulo} tabIndex={-1} className="text-2xl text-ink focus:outline-none">
              {textos.pulseira.titulo}
            </h2>
            <p className="mt-2 text-base text-muted">{textos.pulseira.texto}</p>
          </div>
          <Input
            ref={refCodigo}
            rotulo={textos.pulseira.rotulo}
            placeholder={textos.pulseira.exemplo}
            ajuda={textos.pulseira.ajuda}
            erro={erros.codigo}
            obrigatorio
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value)
              if (erros.codigo) setErros({})
            }}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
          <Button type="submit" tamanho="lg" larguraTotal iconeDireita={<Icone nome="seta-direita" />} className="h-14 text-lg">
            {textos.avancar}
          </Button>
        </form>
      )}

      {passo === 1 && (
        <form noValidate onSubmit={enviarPerfil} className="mt-2 flex flex-col gap-5">
          <div>
            <h2 ref={refTitulo} tabIndex={-1} className="text-2xl text-ink focus:outline-none">
              {textos.perfil.titulo}
            </h2>
            <p className="mt-2 text-base text-muted">{textos.perfil.texto}</p>
          </div>
          <Input
            ref={refNome}
            rotulo={textos.perfil.nome}
            placeholder={textos.perfil.exemploNome}
            ajuda={textos.perfil.ajudaNome}
            erro={erros.nome}
            obrigatorio
            value={nome}
            onChange={(e) => {
              setNome(e.target.value)
              if (erros.nome) setErros((atual) => ({ ...atual, nome: undefined }))
            }}
            autoComplete="off"
          />
          <Input
            ref={refQuem}
            rotulo={textos.perfil.quemAcompanha}
            placeholder={textos.perfil.exemploQuemAcompanha}
            ajuda={textos.perfil.ajudaQuemAcompanha}
            erro={erros.quemAcompanha}
            obrigatorio
            value={quemAcompanha}
            onChange={(e) => {
              setQuemAcompanha(e.target.value)
              if (erros.quemAcompanha) setErros((atual) => ({ ...atual, quemAcompanha: undefined }))
            }}
            autoComplete="off"
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variante="secundaria" tamanho="lg" onClick={() => setPasso(0)} iconeEsquerda={<Icone nome="seta-esquerda" />}>
              {textos.voltar}
            </Button>
            <Button type="submit" tamanho="lg" iconeDireita={<Icone nome="check" />} className="h-14 text-lg sm:flex-1">
              {textos.concluir}
            </Button>
          </div>
        </form>
      )}

      {passo === 2 && (
        <div className="mt-2 flex flex-col gap-5">
          <div>
            <h2 ref={refTitulo} tabIndex={-1} className="flex items-center gap-2 text-2xl text-ink focus:outline-none">
              <Icone nome="dentro" className="size-6 text-success" />
              {textos.pronto.titulo}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-ink">
              {preencher(textos.pronto.texto, { nome: criadaNome, dias: DIAS_PARA_CONHECER_O_NORMAL })}
            </p>
          </div>
          <BotaoLink href="/app/painel" tamanho="lg" larguraTotal iconeDireita={<Icone nome="seta-direita" />} className="h-14 text-lg">
            {textos.pronto.ir}
          </BotaoLink>
        </div>
      )}
    </Card>
  )
}
