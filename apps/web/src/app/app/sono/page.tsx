"use client"

import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { AindaAprendendo, EstadoDaPessoa } from "@/components/app/estado-da-pessoa"
import { EstadoDaPulseiraCartao } from "@/components/app/estado-da-pulseira"
import { GraficoDias } from "@/components/app/graficos/grafico-dias"
import { GraficoNoite } from "@/components/app/graficos/grafico-noite"
import { Icone } from "@/components/app/icone"
import { CartaoMetrica } from "@/components/app/painel/cartao-metrica"
import { SeloSituacao } from "@/components/app/selo-situacao"
import { Card, CardCabecalho, CardConteudo, CardDescricao, CardTitulo } from "@/components/ui"
import { sistema } from "@/content/site"
import { useAgora } from "@/lib/agora"
import { estadoDaPulseira, noiteMaisRecente, pulseiraDe, ultimosDias } from "@/lib/consultas"
import { duracao, formatarDiaDaSemana, preencher } from "@/lib/formato"
import { horaDaNoite } from "@/lib/sono"
import { useDados, usePessoaNaTela } from "@/lib/store"

const textos = sistema.sono

/**
 * Como foi a noite: o momento de manhã, ao acordar. A pessoa quer saber duas
 * coisas, e nesta ordem: quanto dormiu e se a pulseira já mandou os dados.
 */
export default function PaginaSono() {
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
          const noite = noiteMaisRecente(dados, pessoa.id, agora)
          const estado = estadoDaPulseira(pulseiraDe(dados, pessoa.id), agora)
          const vezes = noite
            ? noite.sono.despertares === 0
              ? textos.noite.vezes.nenhuma
              : noite.sono.despertares === 1
                ? textos.noite.vezes.uma
                : preencher(textos.noite.vezes.varias, { n: noite.sono.despertares })
            : ""

          return (
            <div className="flex flex-col gap-5 sm:gap-6">
              <AindaAprendendo pessoa={pessoa} />

              <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
                <Card className="p-5 sm:p-6">
                  {noite ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-lg text-ink">
                          <Icone nome="sono" className="size-5 text-[var(--ds-primary-accent)]" />
                          {preencher(textos.noite.titulo, { data: formatarDiaDaSemana(noite.data) })}
                        </h2>
                        <SeloSituacao situacao={noite.situacao} />
                      </div>
                      {noite.deOntem && <p className="mt-2 text-sm text-muted">{textos.noite.chegando}</p>}

                      <dl className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                        <CartaoMetrica icone="sono" rotulo={textos.noite.dormiu} valor={duracao(noite.sono.minutosDormindo)} />
                        <CartaoMetrica icone="relogio" rotulo={textos.noite.deitou} valor={horaDaNoite(noite.sono.inicio)} />
                        <CartaoMetrica icone="acordou" rotulo={textos.noite.levantou} valor={horaDaNoite(noite.sono.fim)} />
                        <CartaoMetrica icone="alertas" rotulo={textos.noite.despertares} valor={vezes} />
                      </dl>

                      {noite.faixa && (
                        <p className="mt-4 text-base text-ink">
                          {preencher(textos.noite.normal, {
                            baixo: duracao(noite.faixa.baixo),
                            alto: duracao(noite.faixa.alto),
                          })}
                        </p>
                      )}
                      <p className="mt-3 flex gap-2 text-sm text-muted">
                        <Icone nome="info" className="mt-0.5 size-4 shrink-0" />
                        {textos.noite.estimativa}
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-muted">{textos.noite.semNoite}</p>
                  )}
                </Card>

                {estado && <EstadoDaPulseiraCartao estado={estado} agora={agora} />}
              </div>

              {noite && (
                <Card>
                  <CardCabecalho>
                    <CardTitulo como="h2">{textos.movimento.titulo}</CardTitulo>
                    <CardDescricao>{textos.movimento.descricao}</CardDescricao>
                  </CardCabecalho>
                  <CardConteudo>
                    <GraficoNoite contagens={noite.contagens} sono={noite.sono} />
                  </CardConteudo>
                </Card>
              )}

              <Card>
                <CardCabecalho>
                  <CardTitulo como="h2">{textos.historico.titulo}</CardTitulo>
                  <CardDescricao>{textos.historico.descricao}</CardDescricao>
                </CardCabecalho>
                <CardConteudo>
                  <GraficoDias
                    pontos={ultimosDias(dados, pessoa.id, "sono", agora)}
                    rotulo={textos.historico.rotulo}
                    formatar={duracao}
                    formatarEixo={(v) => `${Math.round(v / 60)} h`}
                    passoDoEixo={120}
                    semValorHoje={textos.noite.chegando}
                  />
                </CardConteudo>
              </Card>
            </div>
          )
        }}
      </EstadoDaPessoa>
    </>
  )
}
