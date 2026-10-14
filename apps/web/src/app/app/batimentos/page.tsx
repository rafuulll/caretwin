"use client"

import { Medicao } from "@/components/app/batimentos/medicao"
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { EstadoDaPessoa } from "@/components/app/estado-da-pessoa"
import { GraficoMedicoes } from "@/components/app/graficos/grafico-medicoes"
import { Icone } from "@/components/app/icone"
import { Card, CardCabecalho, CardConteudo, CardDescricao, CardTitulo, EstadoVazio } from "@/components/ui"
import { sistema } from "@/content/site"
import { useAgora } from "@/lib/agora"
import { faixaDosBatimentos, medicoesDe } from "@/lib/consultas"
import { diaEMes, horaDoCarimbo, paraISO, preencher } from "@/lib/formato"
import { useDados, usePessoaNaTela } from "@/lib/store"

const textos = sistema.batimentos

/** Quantas medições a lista mostra. O resto continua no gráfico e nos números dele. */
const NA_LISTA = 8

/**
 * Batimentos: quando a pessoa quiser, uma medição e o histórico. O botão de
 * medir vem primeiro porque é o motivo de alguém abrir esta tela.
 */
export default function PaginaBatimentos() {
  const { dados } = useDados()
  const pessoa = usePessoaNaTela()
  const agora = useAgora()
  if (!agora) return null

  return (
    <>
      <CabecalhoPagina
        titulo={textos.titulo}
        descricao={pessoa ? preencher(textos.descricao, { nome: pessoa.nome }) : undefined}
      />

      <EstadoDaPessoa pessoa={pessoa}>
        {(pessoa) => {
          const faixa = faixaDosBatimentos(dados, pessoa.id, agora)
          const medicoes = medicoesDe(dados, pessoa.id)
          return (
            <div className="flex flex-col gap-5 sm:gap-6">
              <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                <Medicao pessoa={pessoa} faixa={faixa} />

                <Card className="flex flex-col">
                  <CardCabecalho>
                    <CardTitulo como="h2">{textos.historico.titulo}</CardTitulo>
                    <CardDescricao>{textos.historico.descricao}</CardDescricao>
                  </CardCabecalho>
                  <CardConteudo className="flex-1">
                    {medicoes.length === 0 ? (
                      <EstadoVazio tamanho="sm" icone={<Icone nome="batimentos" />} titulo={textos.historico.vazio} />
                    ) : (
                      <ol className="divide-y divide-hairline">
                        {medicoes.slice(0, NA_LISTA).map((m) => (
                          <li key={m.em} className="flex items-center justify-between gap-4 py-3">
                            <span className="text-base text-ink">
                              {m.data === paraISO(agora) ? sistema.comum.hoje : diaEMes(m.data)}
                              <span className="text-muted">, {horaDoCarimbo(m.em)}</span>
                            </span>
                            <span className="font-display text-xl tabular-nums text-ink">
                              {m.bpm}
                              <span className="ml-1.5 font-body text-sm text-muted">{textos.historico.porMinuto}</span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardConteudo>
                </Card>
              </div>

              {medicoes.length > 0 && (
                <Card>
                  <CardCabecalho>
                    <CardTitulo como="h2">{textos.historico.grafico}</CardTitulo>
                  </CardCabecalho>
                  <CardConteudo>
                    <GraficoMedicoes medicoes={medicoes} faixa={faixa} hoje={paraISO(agora)} />
                  </CardConteudo>
                </Card>
              )}

              <p className="flex gap-2 rounded-ds-surface border border-hairline bg-surface p-4 text-base text-ink">
                <Icone nome="info" className="mt-1 size-4 shrink-0 text-muted" />
                {textos.aviso}
              </p>
            </div>
          )
        }}
      </EstadoDaPessoa>
    </>
  )
}
