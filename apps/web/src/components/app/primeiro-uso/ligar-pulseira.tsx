"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { z } from "zod"
import { BotaoLink } from "@/components/marketing/botao-link"
import { Button, Card, Input } from "@/components/ui"
import { sistema } from "@/content/site"
import { cn } from "@/lib/cn"
import { DIAS_PARA_CONHECER_O_NORMAL } from "@/lib/modelo"
import { preencher } from "@/lib/formato"
import { escolherPessoa, familia } from "@/lib/store"
import type { Papel } from "@/lib/cliente-v1"
import { mensagemDaRecusa } from "../familia/mensagem"
import { Icone } from "../icone"

const textos = sistema.primeiroUso.ligar
const comum = sistema.primeiroUso

/** O mesmo formato que a rota aceita: CT, traço e quatro letras ou números. */
const esquemaCodigo = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/^CT(?!-)/, "CT-"))
  .pipe(z.string().regex(/^CT-[A-Z0-9]{4}$/, comum.erros.codigo))

const esquemaNome = z.string().trim().min(2, textos.nome.erro)

/** Recusas que dizem respeito ao código: a tela volta para ele, com a frase no campo. */
const ERROS_DO_CODIGO = new Set([
  "codigo_inexistente",
  "invalido",
  "ja_tem_vinculo",
  "pulseira_em_encerramento",
  "muitas_tentativas",
])

type Passo = 0 | 1 | 2
type Fim = { tipo: "ligada"; nome: string; papel: Papel } | { tipo: "pedido"; codigo: string }

/**
 * Ligar uma pulseira com conta (cartões 7.10 e 7.2).
 *
 * O código vai para o servidor junto com a resposta de "de quem é". O nome só
 * é pedido quando o servidor diz que a pulseira está livre: para quem vai
 * pedir para entrar numa família que já existe, o nome não serve para nada, e
 * perguntar seria fazer a pessoa escrever à toa.
 *
 * Mesma moldura do primeiro uso sem conta: um passo por tela, o botão sempre
 * no mesmo lugar, e o foco no título de cada passo novo.
 */
export function LigarPulseira() {
  const [passo, setPasso] = useState<Passo>(0)
  const [codigo, setCodigo] = useState("")
  const [papel, setPapel] = useState<Papel | null>(null)
  const [precisaNome, setPrecisaNome] = useState(false)
  const [nome, setNome] = useState("")
  const [erros, setErros] = useState<{ codigo?: string; papel?: string; nome?: string; geral?: string }>({})
  const [enviando, setEnviando] = useState(false)
  const [fim, setFim] = useState<Fim | null>(null)

  const refTitulo = useRef<HTMLHeadingElement>(null)
  const refCodigo = useRef<HTMLInputElement>(null)
  const refNome = useRef<HTMLInputElement>(null)
  const refPrimeiraOpcao = useRef<HTMLInputElement>(null)
  const primeiraVez = useRef(true)

  useEffect(() => {
    if (primeiraVez.current) {
      primeiraVez.current = false
      return
    }
    refTitulo.current?.focus()
  }, [passo])

  // O campo do nome aparece depois da resposta do servidor: o foco vai para
  // ele, senão quem usa leitor de tela não sabe que a tela pediu mais uma coisa.
  useEffect(() => {
    if (precisaNome) refNome.current?.focus()
  }, [precisaNome])

  function enviarCodigo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const resultado = esquemaCodigo.safeParse(codigo)
    if (!resultado.success) {
      setErros({ codigo: resultado.error.issues[0]?.message })
      refCodigo.current?.focus()
      return
    }
    setCodigo(resultado.data)
    setErros({})
    setPasso(1)
  }

  async function enviarDono(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!papel) {
      setErros({ papel: textos.dono.erro })
      refPrimeiraOpcao.current?.focus()
      return
    }
    let nomeLimpo: string | undefined
    if (precisaNome) {
      const resultado = esquemaNome.safeParse(nome)
      if (!resultado.success) {
        setErros({ nome: resultado.error.issues[0]?.message })
        refNome.current?.focus()
        return
      }
      nomeLimpo = resultado.data
    }

    setEnviando(true)
    setErros({})
    const resposta = await familia.ligarPulseira({ codigo, papel, nome: nomeLimpo })
    setEnviando(false)

    if (resposta.ok) {
      if (resposta.status === 201 && "id" in resposta.corpo) {
        escolherPessoa(resposta.corpo.id)
        setFim({ tipo: "ligada", nome: resposta.corpo.nome, papel })
      } else {
        setFim({ tipo: "pedido", codigo })
      }
      setPasso(2)
      return
    }

    if (resposta.codigo === "nome_obrigatorio") {
      setPrecisaNome(true)
      return
    }
    const frase = mensagemDaRecusa(resposta, textos.erros)
    if (resposta.codigo && ERROS_DO_CODIGO.has(resposta.codigo)) {
      setErros({ codigo: frase })
      setPasso(0)
      return
    }
    if (resposta.codigo === "ja_tem_acompanhada") {
      setErros({ papel: frase })
      refPrimeiraOpcao.current?.focus()
      return
    }
    setErros({ geral: frase })
  }

  const opcoes: { valor: Papel; rotulo: string; ajuda: string }[] = [
    { valor: "acompanhada", ...textos.dono.acompanhada },
    { valor: "cuidador", ...textos.dono.cuidador },
  ]

  return (
    <Card className="mx-auto w-full max-w-xl p-5 sm:p-8">
      <ol className="mb-6 flex gap-2" aria-label={preencher(comum.progresso, { n: passo + 1, total: 3 })}>
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

      <p className="text-sm text-muted">{preencher(comum.progresso, { n: passo + 1, total: 3 })}</p>

      {passo === 0 && (
        <form noValidate onSubmit={enviarCodigo} className="mt-2 flex flex-col gap-5">
          <div>
            <h2 ref={refTitulo} tabIndex={-1} className="text-2xl text-ink focus:outline-none">
              {comum.pulseira.titulo}
            </h2>
            <p className="mt-2 text-base text-muted">{comum.pulseira.texto}</p>
          </div>
          <Input
            ref={refCodigo}
            rotulo={comum.pulseira.rotulo}
            placeholder={comum.pulseira.exemplo}
            ajuda={comum.pulseira.ajuda}
            erro={erros.codigo}
            obrigatorio
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value)
              // Código novo, pulseira nova: a resposta sobre o nome era da anterior.
              setPrecisaNome(false)
              if (erros.codigo) setErros({})
            }}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
          <Button type="submit" tamanho="lg" larguraTotal iconeDireita={<Icone nome="seta-direita" />} className="h-14 text-lg">
            {textos.continuar}
          </Button>
        </form>
      )}

      {passo === 1 && (
        <form noValidate onSubmit={enviarDono} className="mt-2 flex flex-col gap-5">
          <div>
            <h2 ref={refTitulo} tabIndex={-1} className="text-2xl text-ink focus:outline-none">
              {textos.dono.titulo}
            </h2>
            <p className="mt-2 text-base text-muted">{textos.dono.texto}</p>
          </div>

          <fieldset aria-describedby={erros.papel ? "erro-papel" : undefined}>
            <legend className="sr-only">{textos.dono.legenda}</legend>
            <div className="flex flex-col gap-3">
              {opcoes.map((opcao, indice) => (
                <label
                  key={opcao.valor}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-start gap-3 rounded-ds border border-hairline bg-surface p-4 transition-colors",
                    "hover:bg-elevated has-checked:border-primary has-checked:bg-elevated has-focus-visible:ring-2 has-focus-visible:ring-primary"
                  )}
                >
                  <input
                    ref={indice === 0 ? refPrimeiraOpcao : undefined}
                    type="radio"
                    name="papel"
                    value={opcao.valor}
                    checked={papel === opcao.valor}
                    onChange={() => {
                      setPapel(opcao.valor)
                      if (erros.papel) setErros((atual) => ({ ...atual, papel: undefined }))
                    }}
                    className="mt-1 size-5 shrink-0 accent-primary"
                  />
                  <span>
                    <span className="block text-lg text-ink">{opcao.rotulo}</span>
                    <span className="mt-0.5 block text-sm text-muted">{opcao.ajuda}</span>
                  </span>
                </label>
              ))}
            </div>
            {erros.papel && (
              <p id="erro-papel" role="alert" className="mt-2 text-[13px] text-danger">
                {erros.papel}
              </p>
            )}
          </fieldset>

          {precisaNome && (
            <div className="flex flex-col gap-4 border-t border-hairline pt-5">
              <div>
                <h3 className="text-lg text-ink">{textos.nome.titulo}</h3>
                <p className="mt-1 text-base text-muted">{textos.nome.texto}</p>
              </div>
              <Input
                ref={refNome}
                rotulo={papel === "acompanhada" ? textos.nome.rotuloPropria : textos.nome.rotuloCuidador}
                placeholder={textos.nome.exemplo}
                ajuda={textos.nome.ajuda}
                erro={erros.nome}
                obrigatorio
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  if (erros.nome) setErros((atual) => ({ ...atual, nome: undefined }))
                }}
                autoComplete="off"
              />
            </div>
          )}

          {erros.geral && (
            <p
              role="alert"
              className="rounded-ds-fine border border-hairline bg-elevated px-3 py-2.5 text-sm leading-relaxed text-ink"
            >
              {erros.geral}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              variante="secundaria"
              tamanho="lg"
              disabled={enviando}
              onClick={() => {
                setErros({})
                setPasso(0)
              }}
              iconeEsquerda={<Icone nome="seta-esquerda" />}
            >
              {comum.voltar}
            </Button>
            <Button
              type="submit"
              tamanho="lg"
              carregando={enviando}
              iconeDireita={<Icone nome={precisaNome ? "check" : "seta-direita"} />}
              className="h-14 text-lg sm:flex-1"
            >
              {precisaNome ? textos.enviar : textos.continuar}
            </Button>
          </div>
        </form>
      )}

      {passo === 2 && fim?.tipo === "ligada" && (
        <div className="mt-2 flex flex-col gap-5">
          <div>
            <h2 ref={refTitulo} tabIndex={-1} className="flex items-center gap-2 text-2xl text-ink focus:outline-none">
              <Icone nome="dentro" className="size-6 text-success" />
              {textos.pronto.titulo}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-ink">
              {preencher(fim.papel === "acompanhada" ? textos.pronto.textoPropria : textos.pronto.textoCuidador, {
                nome: fim.nome,
                dias: DIAS_PARA_CONHECER_O_NORMAL,
              })}
            </p>
          </div>
          <BotaoLink href="/app/painel" tamanho="lg" larguraTotal iconeDireita={<Icone nome="seta-direita" />} className="h-14 text-lg">
            {textos.pronto.ir}
          </BotaoLink>
        </div>
      )}

      {passo === 2 && fim?.tipo === "pedido" && (
        <div className="mt-2 flex flex-col gap-5">
          <div>
            <h2 ref={refTitulo} tabIndex={-1} className="flex items-center gap-2 text-2xl text-ink focus:outline-none">
              <Icone nome="relogio" className="size-6 text-muted" />
              {textos.pedido.titulo}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-ink">
              {preencher(textos.pedido.texto, { codigo: fim.codigo })}
            </p>
          </div>
          <BotaoLink href="/app/painel" tamanho="lg" larguraTotal iconeDireita={<Icone nome="seta-direita" />} className="h-14 text-lg">
            {textos.pedido.ir}
          </BotaoLink>
        </div>
      )}
    </Card>
  )
}
