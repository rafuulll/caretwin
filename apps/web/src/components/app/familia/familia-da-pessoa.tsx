"use client"

import { useEffect, useState } from "react"
import {
  Badge,
  Button,
  Card,
  CardCabecalho,
  CardConteudo,
  CardDescricao,
  CardTitulo,
  Confirmar,
  Input,
} from "@/components/ui"
import { sistema } from "@/content/site"
import type { Membro, PedidoRecebido } from "@/lib/cliente-v1"
import { confirmacaoConfere, DIAS_PARA_RECUPERAR, fraseDeEncerramento } from "@/lib/encerramento"
import { formatarCarimbo, preencher, tempoDesde } from "@/lib/formato"
import { familia, type VinculoNaTela } from "@/lib/store"
import type { Pessoa } from "@/lib/types"
import { Icone } from "../icone"
import { mensagemDaRecusa } from "./mensagem"
import { Recados } from "./recados"

const textos = sistema.familia

type Pendente = { tipo: "remover"; membro: Membro } | { tipo: "sair" } | null

/**
 * A família de uma pessoa: quem acompanha, os pedidos para entrar (só para
 * quem administra) e, no fim, a saída de quem está olhando.
 *
 * A saída muda de forma conforme a família: com mais alguém, é sair; sendo a
 * última pessoa, é encerrar, com a frase de confirmação e 30 dias para voltar
 * atrás. A rota confere tudo de novo; a tela só evita o clique que já se sabe
 * que vai ser recusado.
 */
export function FamiliaDaPessoa({
  pessoa,
  vinculo,
  euId,
}: {
  pessoa: Pessoa
  vinculo: VinculoNaTela
  euId: string
}) {
  const [membros, setMembros] = useState<Membro[] | null>(null)
  const [pedidos, setPedidos] = useState<PedidoRecebido[] | null>(null)
  const [versao, setVersao] = useState(0)
  const [falhouCarga, setFalhouCarga] = useState("")
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [pendente, setPendente] = useState<Pendente>(null)
  const [aviso, setAviso] = useState("")
  const [erro, setErro] = useState("")
  const [frase, setFrase] = useState("")
  const [erroFrase, setErroFrase] = useState("")

  useEffect(() => {
    let valendo = true
    void (async () => {
      const [respostaMembros, respostaPedidos] = await Promise.all([
        familia.membros(pessoa.id),
        vinculo.administra ? familia.pedidos(pessoa.id) : Promise.resolve(null),
      ])
      // A pessoa na tela pode ter mudado enquanto a resposta vinha.
      if (!valendo) return
      if (!respostaMembros.ok) {
        setFalhouCarga(mensagemDaRecusa(respostaMembros))
        return
      }
      setFalhouCarga("")
      setMembros(respostaMembros.corpo)
      setPedidos(respostaPedidos?.ok ? respostaPedidos.corpo : null)
    })()
    return () => {
      valendo = false
    }
  }, [pessoa.id, vinculo.administra, versao])

  /** Toda ação passa por aqui: trava os botões, mostra a frase e relê a família. */
  async function agir(
    chave: string,
    executar: () => Promise<{ ok: boolean; status: number; codigo?: string; quando?: string }>,
    sucesso: string
  ) {
    setOcupado(chave)
    setErro("")
    setAviso("")
    const resposta = await executar()
    setOcupado(null)
    if (resposta.ok) setAviso(sucesso)
    else setErro(resposta.status === 404 ? textos.erros.mudou : mensagemDaRecusa(resposta, textos.erros))
    setVersao((v) => v + 1)
    return resposta.ok
  }

  async function confirmarPendente() {
    if (!pendente) return
    if (pendente.tipo === "remover") {
      const { membro } = pendente
      await agir(
        `remover-${membro.usuarioId}`,
        () => familia.removerMembro(pessoa.id, membro.usuarioId),
        preencher(textos.membros.removido, { nome: membro.nome })
      )
    } else {
      // Deu certo, a pessoa sai da conta e o store troca a tela sozinho.
      await agir("sair", () => familia.sair(pessoa.id), "")
    }
    setPendente(null)
  }

  async function encerrar() {
    if (!confirmacaoConfere(frase, pessoa.nome)) {
      setErroFrase(textos.erros.confirmacao_errada)
      return
    }
    setErroFrase("")
    setOcupado("encerrar")
    setErro("")
    const resposta = await familia.encerrar(pessoa.id, frase)
    setOcupado(null)
    if (resposta.ok) return
    if (resposta.codigo === "confirmacao_errada") setErroFrase(textos.erros.confirmacao_errada)
    else setErro(resposta.status === 404 ? textos.erros.mudou : mensagemDaRecusa(resposta, textos.erros))
    setVersao((v) => v + 1)
  }

  const ultimo = membros !== null && membros.length === 1 && membros[0].usuarioId === euId
  const fraseCerta = fraseDeEncerramento(pessoa.nome)

  return (
    <>
      <Card>
        <CardCabecalho>
          <CardTitulo como="h2">{preencher(textos.membros.titulo, { nome: pessoa.nome })}</CardTitulo>
          <CardDescricao>{preencher(textos.membros.descricao, { nome: pessoa.nome })}</CardDescricao>
        </CardCabecalho>
        <CardConteudo>
          {falhouCarga ? (
            <p className="text-base text-ink">{falhouCarga}</p>
          ) : membros === null ? (
            <p role="status" className="text-sm text-muted">
              {textos.carregando}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline">
              {membros.map((membro) => {
                const souEu = membro.usuarioId === euId
                const podeRemover = vinculo.administra && !souEu && membro.papel === "cuidador"
                return (
                  <li key={membro.usuarioId} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium text-ink">
                        {membro.nome}
                        {souEu && <span className="font-normal text-muted"> ({textos.voce})</span>}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                        <Badge>{textos.papeis[membro.papel]}</Badge>
                        {membro.administra && <Badge variante="destaque">{textos.administra}</Badge>}
                        <span>{preencher(textos.desde, { data: formatarCarimbo(membro.desde) })}</span>
                      </p>
                    </div>
                    {podeRemover && (
                      <Button
                        variante="secundaria"
                        disabled={ocupado !== null}
                        carregando={ocupado === `remover-${membro.usuarioId}`}
                        aria-label={preencher(textos.membros.rotuloRemover, { nome: membro.nome })}
                        onClick={() => setPendente({ tipo: "remover", membro })}
                        className="pointer-coarse:min-h-11"
                      >
                        {textos.membros.remover}
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardConteudo>
      </Card>

      {vinculo.administra && pedidos !== null && (
        <Card>
          <CardCabecalho>
            <CardTitulo como="h2">{textos.pedidos.titulo}</CardTitulo>
            <CardDescricao>{preencher(textos.pedidos.descricao, { nome: pessoa.nome })}</CardDescricao>
          </CardCabecalho>
          <CardConteudo>
            {pedidos.length === 0 ? (
              <p className="text-base text-muted">{textos.pedidos.vazio}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-hairline">
                {pedidos.map((pedido) => (
                  <li key={pedido.usuarioId} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium text-ink">{pedido.nome}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {preencher(textos.pedidos.pediuComo, {
                          papel: textos.papeisNoPedido[pedido.papel],
                          quando: tempoDesde(pedido.criadoEm, new Date()),
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variante="secundaria"
                        disabled={ocupado !== null}
                        carregando={ocupado === `recusar-${pedido.usuarioId}`}
                        aria-label={preencher(textos.pedidos.rotuloRecusar, { nome: pedido.nome })}
                        onClick={() =>
                          agir(
                            `recusar-${pedido.usuarioId}`,
                            () => familia.recusar(pessoa.id, pedido.usuarioId),
                            preencher(textos.pedidos.recusado, { nome: pedido.nome })
                          )
                        }
                        className="pointer-coarse:min-h-11"
                      >
                        {textos.pedidos.recusar}
                      </Button>
                      <Button
                        iconeEsquerda={<Icone nome="check" />}
                        disabled={ocupado !== null}
                        carregando={ocupado === `aprovar-${pedido.usuarioId}`}
                        aria-label={preencher(textos.pedidos.rotuloAprovar, { nome: pedido.nome })}
                        onClick={() =>
                          agir(
                            `aprovar-${pedido.usuarioId}`,
                            () => familia.aprovar(pessoa.id, pedido.usuarioId),
                            preencher(textos.pedidos.aprovado, { nome: pedido.nome })
                          )
                        }
                        className="pointer-coarse:min-h-11"
                      >
                        {textos.pedidos.aprovar}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardConteudo>
        </Card>
      )}

      <Recados aviso={aviso} erro={erro} />

      {membros !== null && !ultimo && (
        <Card>
          <CardCabecalho>
            <CardTitulo como="h2">{textos.sair.titulo}</CardTitulo>
            <CardDescricao>{preencher(textos.sair.texto, { nome: pessoa.nome })}</CardDescricao>
          </CardCabecalho>
          <CardConteudo>
            <Button
              variante="secundaria"
              iconeEsquerda={<Icone nome="sair" />}
              disabled={ocupado !== null}
              carregando={ocupado === "sair"}
              onClick={() => setPendente({ tipo: "sair" })}
              className="pointer-coarse:min-h-11"
            >
              {preencher(textos.sair.acao, { nome: pessoa.nome })}
            </Button>
          </CardConteudo>
        </Card>
      )}

      {ultimo && (
        <Card>
          <CardCabecalho>
            <CardTitulo como="h2">{textos.encerrar.titulo}</CardTitulo>
            <CardDescricao>
              {preencher(textos.encerrar.texto, { nome: pessoa.nome, dias: DIAS_PARA_RECUPERAR })}
            </CardDescricao>
          </CardCabecalho>
          <CardConteudo>
            <form
              noValidate
              onSubmit={(evento) => {
                evento.preventDefault()
                void encerrar()
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <p className="text-sm text-muted">{textos.encerrar.instrucao}</p>
                {/* A frase em bloco próprio, para ser lida pelo leitor de tela sem
                    nada colado nela. Sem moldura de campo: parecer caixa de texto
                    faria a pessoa tentar escrever ali. */}
                <p className="mt-2 border-l-2 border-primary pl-3 text-lg font-medium text-ink">
                  {fraseCerta}
                </p>
              </div>
              <Input
                rotulo={textos.encerrar.rotulo}
                ajuda={textos.encerrar.ajuda}
                erro={erroFrase}
                obrigatorio
                value={frase}
                onChange={(e) => {
                  setFrase(e.target.value)
                  if (erroFrase) setErroFrase("")
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
                  disabled={ocupado !== null || !confirmacaoConfere(frase, pessoa.nome)}
                  carregando={ocupado === "encerrar"}
                >
                  {textos.encerrar.acao}
                </Button>
              </div>
            </form>
          </CardConteudo>
        </Card>
      )}

      <Confirmar
        aberto={pendente?.tipo === "remover"}
        destrutivo={false}
        titulo={
          pendente?.tipo === "remover" ? preencher(textos.membros.confirmar.titulo, { nome: pendente.membro.nome }) : ""
        }
        texto={
          pendente?.tipo === "remover"
            ? preencher(textos.membros.confirmar.texto, { nome: pendente.membro.nome, pessoa: pessoa.nome })
            : undefined
        }
        rotuloConfirmar={textos.membros.confirmar.confirmar}
        carregando={ocupado !== null}
        aoConfirmar={confirmarPendente}
        aoCancelar={() => setPendente(null)}
      />

      <Confirmar
        aberto={pendente?.tipo === "sair"}
        destrutivo={false}
        titulo={preencher(textos.sair.confirmar.titulo, { nome: pessoa.nome })}
        texto={textos.sair.confirmar.texto}
        rotuloConfirmar={textos.sair.confirmar.confirmar}
        carregando={ocupado !== null}
        aoConfirmar={confirmarPendente}
        aoCancelar={() => setPendente(null)}
      />
    </>
  )
}
