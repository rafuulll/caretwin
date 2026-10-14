"use client"

import { useState } from "react"
import { CartaoAlerta } from "@/components/app/alertas/cartao-alerta"
import { ResumoDoDia } from "@/components/app/alertas/resumo-do-dia"
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { EstadoDaPessoa } from "@/components/app/estado-da-pessoa"
import { Icone } from "@/components/app/icone"
import { Button, Card, EstadoVazio } from "@/components/ui"
import { sistema } from "@/content/site"
import { useAgora } from "@/lib/agora"
import { alertasDe } from "@/lib/consultas"
import { formatarDataPorExtenso, paraISO, preencher, somarDias } from "@/lib/formato"
import { useDados, usePessoaNaTela } from "@/lib/store"
import type { Alerta } from "@/lib/types"

const textos = sistema.alertas

/** Os alertas por dia, do mais novo para o mais antigo. */
function porDia(alertas: Alerta[]) {
  const grupos = new Map<string, Alerta[]>()
  for (const alerta of alertas) grupos.set(alerta.data, [...(grupos.get(alerta.data) ?? []), alerta])
  return [...grupos.entries()].sort(([a], [b]) => b.localeCompare(a))
}

/**
 * Alertas: o momento de quem acompanha, à noite. Primeiro o resumo do dia,
 * que é o que essa pessoa veio ler, depois as mudanças, com as novas marcadas.
 * Dois estados por alerta (novo e lido), então é um botão de marcar e não um
 * quadro de etapas.
 */
export default function PaginaAlertas() {
  const { dados, marcarAlerta, marcarTodosComoLidos } = useDados()
  const pessoa = usePessoaNaTela()
  const agora = useAgora()
  const [aviso, setAviso] = useState("")
  if (!agora) return null

  const hoje = paraISO(agora)
  const ontem = somarDias(hoje, -1)
  const nomeDoDia = (data: string) =>
    data === hoje ? sistema.comum.hoje : data === ontem ? textos.lista.ontem : formatarDataPorExtenso(data)

  return (
    <>
      <CabecalhoPagina
        titulo={textos.titulo}
        descricao={pessoa ? preencher(textos.descricao, { nome: pessoa.nome }) : undefined}
      />

      <EstadoDaPessoa pessoa={pessoa}>
        {(pessoa) => {
          const alertas = alertasDe(dados, pessoa.id)
          const novos = alertas.filter((a) => !a.lido).length
          const contagem =
            novos === 0
              ? textos.lista.novos.nenhum
              : novos === 1
                ? textos.lista.novos.um
                : preencher(textos.lista.novos.varios, { n: novos })

          return (
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* A chave é a pessoa: trocar de pessoa começa um resumo novo, em
                  vez de mostrar o texto que falava do dia de outra. */}
              <ResumoDoDia key={pessoa.id} pessoa={pessoa} agora={agora} />

              <section aria-labelledby="titulo-alertas">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 id="titulo-alertas" className="text-xl text-ink">
                      {textos.lista.titulo}
                    </h2>
                    <p className="mt-1 text-base text-muted">{contagem}</p>
                  </div>
                  {novos > 0 && (
                    <Button
                      variante="secundaria"
                      iconeEsquerda={<Icone nome="lido" />}
                      onClick={() => {
                        marcarTodosComoLidos(pessoa.id)
                        setAviso(textos.lista.todosAviso)
                      }}
                    >
                      {textos.lista.marcarTodos}
                    </Button>
                  )}
                </div>

                {alertas.length === 0 ? (
                  <Card>
                    <EstadoVazio
                      icone={<Icone nome="dentro" />}
                      titulo={textos.lista.vazio.titulo}
                      texto={preencher(textos.lista.vazio.texto, { nome: pessoa.nome })}
                    />
                  </Card>
                ) : (
                  <div className="flex flex-col gap-6">
                    {porDia(alertas).map(([data, doDia]) => (
                      <div key={data}>
                        <h3 className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">{nomeDoDia(data)}</h3>
                        <ul className="flex flex-col gap-3">
                          {doDia.map((alerta) => (
                            <li key={alerta.id}>
                              <CartaoAlerta
                                alerta={alerta}
                                aoMarcar={(lido) => {
                                  marcarAlerta(alerta.id, lido)
                                  setAviso(lido ? textos.lista.lidoAviso : textos.lista.novoAviso)
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <p role="status" className="sr-only">
                {aviso}
              </p>
            </div>
          )
        }}
      </EstadoDaPessoa>
    </>
  )
}
