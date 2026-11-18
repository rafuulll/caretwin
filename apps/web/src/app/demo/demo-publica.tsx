"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Footprints, MoonStar, Bell, CalendarDays } from "lucide-react"
import { EstadoDaPulseiraCartao } from "@/components/app/estado-da-pulseira"
import { GraficoDias } from "@/components/app/graficos/grafico-dias"
import { PassosDeHojeCartao } from "@/components/app/painel/passos-de-hoje"
import { CabecalhoPublico, MensagemPublica } from "@/components/publico/cabecalho-publico"
import { publico } from "@/content/publico"
import { redesign, sistema } from "@/content/site"
import { useAgora } from "@/lib/agora"
import { alertasDe, estadoDaPulseira, noiteMaisRecente, passosDeHoje, pulseiraDe, ultimosDias } from "@/lib/consultas"
import { dataPorExtenso, duracao, numero, paraISO, preencher } from "@/lib/formato"
import type { Dados } from "@/lib/types"

type Resposta = { pulseira: string; pulseiras: string[]; dados: Dados }
type Situacao = { tipo: "carregando" } | { tipo: "desligada" } | { tipo: "erro" } | { tipo: "pronta"; resposta: Resposta }

/**
 * /demo: o painel de verdade, com os dados da pessoa de demonstração, sem
 * login. Usa os mesmos cartões, gráficos e contas (`lib/consultas.ts`) do
 * painel de quem tem conta; só a origem dos dados muda.
 */
export function DemoPublica({ inicial }: { inicial: string | null }) {
  const agora = useAgora()
  const [pedida, setPedida] = useState<string | null>(inicial)
  const [situacao, setSituacao] = useState<Situacao>({ tipo: "carregando" })
  const [dias, setDias] = useState(14)
  const [metrica, setMetrica] = useState<"passos" | "sono">("passos")

  // Um contador, não só `pedida`, para o "tentar de novo" repetir o pedido.
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controle = new AbortController()
    async function buscar() {
      try {
        const url = "/api/publico/demo" + (pedida ? `?pulseira=${encodeURIComponent(pedida)}` : "")
        const resposta = await fetch(url, { cache: "no-store", signal: controle.signal })
        if (resposta.status === 404) return setSituacao({ tipo: "desligada" })
        if (!resposta.ok) return setSituacao({ tipo: "erro" })
        setSituacao({ tipo: "pronta", resposta: (await resposta.json()) as Resposta })
      } catch {
        if (!controle.signal.aborted) setSituacao({ tipo: "erro" })
      }
    }
    void buscar()
    return () => controle.abort()
  }, [pedida, tentativa])

  // Quem muda de pulseira ou tenta de novo põe a tela em "carregando" no clique.
  const trocarPulseira = (codigo: string) => {
    setSituacao({ tipo: "carregando" })
    setPedida(codigo)
  }
  const tentarDeNovo = () => {
    setSituacao({ tipo: "carregando" })
    setTentativa((n) => n + 1)
  }

  return (
    <div className="ct-app min-h-dvh bg-canvas">
      <CabecalhoPublico />
      <main id="conteudo" className="ct-app-content">
        <Conteudo
          situacao={situacao}
          agora={agora}
          dias={dias}
          metrica={metrica}
          aoMudarDias={setDias}
          aoMudarMetrica={setMetrica}
          aoTrocarPulseira={trocarPulseira}
          aoTentarDeNovo={tentarDeNovo}
        />
      </main>
    </div>
  )
}

function Conteudo({
  situacao,
  agora,
  dias,
  metrica,
  aoMudarDias,
  aoMudarMetrica,
  aoTrocarPulseira,
  aoTentarDeNovo,
}: {
  situacao: Situacao
  agora: Date | null
  dias: number
  metrica: "passos" | "sono"
  aoMudarDias: (n: number) => void
  aoMudarMetrica: (m: "passos" | "sono") => void
  aoTrocarPulseira: (codigo: string) => void
  aoTentarDeNovo: () => void
}) {
  if (situacao.tipo === "desligada") return <MensagemPublica titulo={publico.desligada.titulo} corpo={publico.desligada.corpo} />
  if (situacao.tipo === "erro") {
    return (
      <MensagemPublica
        titulo={publico.erro.titulo}
        corpo={publico.erro.corpo}
        acao={{ texto: publico.erro.tentar, aoClicar: aoTentarDeNovo }}
      />
    )
  }
  if (situacao.tipo === "carregando" || !agora) {
    return <p role="status" className="py-16 text-center text-muted">{publico.carregando}</p>
  }

  const { dados, pulseira: codigo, pulseiras } = situacao.resposta
  const pessoa = dados.pessoas[0]
  if (!pessoa) return <MensagemPublica titulo={publico.desligada.titulo} corpo={publico.desligada.corpo} />

  const estado = estadoDaPulseira(pulseiraDe(dados, pessoa.id), agora)
  const noite = noiteMaisRecente(dados, pessoa.id, agora)
  const alertas = alertasDe(dados, pessoa.id)
  const novos = alertas.filter((a) => !a.lido)
  const recente = novos[0] ?? alertas[0]
  const aoVivo = `/ao-vivo?pulseira=${encodeURIComponent(codigo)}`

  return (
    <>
      <div className="ct-section-heading">
        <div>
          <h1>{pessoa.nome || publico.demo.semNome}</h1>
          <p>
            <CalendarDays aria-hidden="true" />
            {dataPorExtenso(paraISO(agora))}
          </p>
          <p className="mt-1 text-sm text-muted">{preencher(publico.demo.subtitulo, { codigo })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {pulseiras.length > 1 && (
            <label className="flex items-center gap-2 text-sm text-muted">
              {publico.demo.trocar}
              <select
                value={codigo}
                onChange={(e) => aoTrocarPulseira(e.target.value)}
                className="rounded-ds border border-hairline bg-surface px-2 py-1 text-ink"
              >
                {pulseiras.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Link
            href={aoVivo}
            className="inline-flex items-center gap-2 rounded-ds border border-hairline bg-surface px-3 py-2 text-sm text-ink"
          >
            {publico.demo.verAoVivo}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="ct-overview">
        <div className="ct-summary-grid">
          <PassosDeHojeCartao dados={passosDeHoje(dados, pessoa.id, agora)} />
          <div className="ct-summary-side">
            <div className="ct-summary-night">
              <span>
                <MoonStar aria-hidden="true" />
                {redesign.lastNight}
              </span>
              <strong>{noite ? duracao(noite.sono.minutosDormindo) : sistema.comum.semDado}</strong>
              <small>{noite ? redesign.sleepEstimate : redesign.noNight}</small>
            </div>
            {estado && (
              <EstadoDaPulseiraCartao
                estado={estado}
                agora={agora}
                className={
                  estado.atrasada || estado.bateriaBaixa ? "ct-device-summary ct-device-attention" : "ct-device-summary"
                }
              />
            )}
          </div>
        </div>

        <div className="ct-data-grid">
          <section className="ct-chart" aria-labelledby="historico-titulo">
            <div className="ct-chart-heading">
              <h2 id="historico-titulo">{redesign.history}</h2>
              <div className="ct-chart-filter" role="group" aria-label={redesign.historyLabel}>
                {[7, 14].map((n) => (
                  <button type="button" key={n} aria-pressed={dias === n} onClick={() => aoMudarDias(n)}>
                    {n === 7 ? redesign.sevenDays : redesign.fourteenDays}
                  </button>
                ))}
              </div>
            </div>
            <div className="ct-chart-metrics" role="group" aria-label={redesign.historyMetric}>
              <button type="button" aria-pressed={metrica === "passos"} onClick={() => aoMudarMetrica("passos")}>
                <Footprints aria-hidden="true" />
                {redesign.historySteps}
              </button>
              <button type="button" aria-pressed={metrica === "sono"} onClick={() => aoMudarMetrica("sono")}>
                <MoonStar aria-hidden="true" />
                {redesign.historySleep}
              </button>
            </div>
            <GraficoDias
              pontos={ultimosDias(dados, pessoa.id, metrica, agora, dias)}
              rotulo={metrica === "passos" ? sistema.painel.grafico.rotulo : sistema.sono.historico.rotulo}
              formatar={
                metrica === "passos" ? (v) => numero(v) + " " + sistema.metricas.passos.unidade : duracao
              }
              formatarEixo={
                metrica === "passos"
                  ? (v) => (v >= 1000 ? numero(v / 1000) + " " + sistema.comum.mil : numero(v))
                  : (v) => Math.round(v / 60) + " " + redesign.hours
              }
              passoDoEixo={metrica === "sono" ? 120 : undefined}
              semValorHoje={metrica === "passos" ? sistema.painel.grafico.hojeParcial : sistema.sono.noite.chegando}
              acimaEhBom={metrica === "passos"}
            />
          </section>

          <section className="ct-changes">
            <div className="ct-changes-top">
              <Bell aria-hidden="true" />
              <span>
                {novos.length === 1
                  ? redesign.oneNewChange
                  : novos.length
                    ? preencher(redesign.newChanges, { n: novos.length })
                    : redesign.noNewChanges}
              </span>
            </div>
            <h2>{recente ? redesign.changes : redesign.noChanges}</h2>
            <p>{recente?.texto ?? redesign.noChangesBody}</p>
          </section>
        </div>
      </div>
    </>
  )
}
