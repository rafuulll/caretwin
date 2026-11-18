"use client"

import { useState } from "react"
import { Icone } from "@/components/app/icone"
import { Button, Card, CardCabecalho, CardConteudo, CardDescricao, CardTitulo, Input } from "@/components/ui"
import { sistema as textos } from "@/content/site"
import { DIAS_PARA_RECUPERAR, exclusaoConfere, FRASE_DE_EXCLUSAO } from "@/lib/encerramento"
import { preencher } from "@/lib/formato"
import { familia, useConta } from "@/lib/store"

const copy = textos.configuracoes.excluir

/**
 * Excluir a própria conta (migração 0007). Só aparece para quem entrou com
 * conta: no modo protótipo não existe conta para excluir.
 *
 * Mesmo desenho do encerramento na tela Família: a frase escrita destrava o
 * botão vermelho, e quem confere de verdade é o servidor. Dando certo, a
 * pessoa vai para a tela de entrar, onde pode recuperar a conta por 30 dias.
 */
export function ExcluirConta() {
  const conta = useConta()
  const [frase, setFrase] = useState("")
  const [erro, setErro] = useState("")
  const [ocupado, setOcupado] = useState(false)

  if (!conta) return null

  async function excluir() {
    if (!exclusaoConfere(frase)) {
      setErro(copy.erros.confirmacao_errada)
      return
    }
    setOcupado(true)
    setErro("")
    const resposta = await familia.excluirConta(frase)
    if (resposta.ok) {
      // Carga inteira: a conta já saiu do servidor e do navegador.
      window.location.assign("/entrar")
      return
    }
    setOcupado(false)
    const erros = copy.erros as Record<string, string | undefined>
    setErro((resposta.codigo && erros[resposta.codigo]) || copy.erros.falhou)
  }

  return (
    <Card>
      <CardCabecalho>
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-ds bg-danger/12 text-danger">
            <Icone nome="remover" className="size-4" />
          </span>
          <CardTitulo como="h2">{copy.titulo}</CardTitulo>
        </div>
        <CardDescricao>{preencher(copy.texto, { dias: DIAS_PARA_RECUPERAR })}</CardDescricao>
      </CardCabecalho>
      <CardConteudo>
        <form
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault()
            void excluir()
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <p className="text-sm text-muted">{copy.instrucao}</p>
            {/* A frase em bloco próprio, como no encerramento: sem moldura de
                campo, para ninguém tentar escrever nela. */}
            <p className="mt-2 border-l-2 border-primary pl-3 text-lg font-medium text-ink">{FRASE_DE_EXCLUSAO}</p>
          </div>
          <Input
            rotulo={copy.rotulo}
            ajuda={copy.ajuda}
            erro={erro}
            obrigatorio
            value={frase}
            onChange={(evento) => {
              setFrase(evento.target.value)
              if (erro) setErro("")
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <div>
            <Button
              type="submit"
              variante="perigo"
              tamanho="lg"
              iconeEsquerda={<Icone nome="remover" />}
              disabled={ocupado || !exclusaoConfere(frase)}
              carregando={ocupado}
            >
              {copy.acao}
            </Button>
          </div>
        </form>
      </CardConteudo>
    </Card>
  )
}
