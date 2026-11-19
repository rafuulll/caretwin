"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Battery, Footprints, HeartPulse, Radio } from "lucide-react"
import { CabecalhoPublico, MensagemPublica } from "@/components/publico/cabecalho-publico"
import { GraficoBruto } from "@/components/publico/grafico-bruto"
import { publico } from "@/content/publico"
import { numero, preencher } from "@/lib/formato"
import { IR_MINIMO_COM_DEDO, pulsoDoSinal } from "@/lib/pulso"
import type { AoVivo, LoteLido } from "@/lib/ao-vivo"

/** Quanto tempo de leitura fica na tela. */
const SEGUNDOS_NA_TELA = 10
/** Sem lote novo por mais que isso, a página diz que a pulseira parou. */
const SEGUNDOS_ATE_PARAR = 4
const INTERVALO_MS = 1000

type Amostra = { ax: number; ay: number; az: number; gx: number; gy: number; gz: number; ir: number | null }

type Estado = {
  situacao: "conectando" | "pronta" | "desligada" | "erro"
  pulseira: AoVivo["pulseira"] | null
  amostras: Amostra[]
  taxa: number
  passos: number | null
  bpm: number | null
  /** A última leitura do sensor de batimentos: com o dedo apoiado passa de 50 mil. */
  ultimoIr: number | null
  /** Há quantos segundos o último lote chegou ao servidor, no momento da resposta. */
  semSinal: number | null
}

const INICIAL: Estado = {
  situacao: "conectando",
  pulseira: null,
  amostras: [],
  taxa: 50,
  passos: null,
  bpm: null,
  ultimoIr: null,
  semSinal: null,
}

const COR = { x: "#2549d8", y: "#b45309", z: "#7c3aed" }
const TRACO = { x: undefined, y: "7 4", z: "2 3" }

function amostrasDoLote(lote: LoteLido): Amostra[] {
  return lote.imu.map((l, i) => ({
    ax: l[0] / 1000,
    ay: l[1] / 1000,
    az: l[2] / 1000,
    gx: l[3] / 10,
    gy: l[4] / 10,
    gz: l[5] / 10,
    ir: lote.ir ? (lote.ir[i] ?? null) : null,
  }))
}

function tempoSemSinal(segundos: number): string {
  if (segundos < 60) return `${Math.round(segundos)} s`
  if (segundos < 3600) return `${Math.floor(segundos / 60)} min`
  return `${Math.floor(segundos / 3600)} h`
}

/**
 * /ao-vivo: os dados brutos da pulseira de demonstração, sem login. Pergunta
 * ao servidor uma vez por segundo o que chegou depois do último lote (a
 * Vercel não mantém conexão aberta), emenda as leituras novas nas últimas
 * dez segundos e redesenha os gráficos.
 */
export function AoVivoPublico({ pedida }: { pedida: string | null }) {
  const [estado, setEstado] = useState<Estado>(INICIAL)
  const parou = useRef(false)

  useEffect(() => {
    parou.current = false
    const controle = new AbortController()
    let ultimoId: number | null = null
    let esperando: ReturnType<typeof setTimeout> | undefined
    let falhasSeguidas = 0

    async function perguntar() {
      let proximoEm = INTERVALO_MS
      try {
        const consulta = new URLSearchParams()
        if (pedida) consulta.set("pulseira", pedida)
        if (ultimoId !== null) consulta.set("depois", String(ultimoId))
        const resposta = await fetch(`/api/publico/ao-vivo?${consulta}`, { cache: "no-store", signal: controle.signal })

        if (resposta.status === 404) {
          setEstado((e) => ({ ...e, situacao: "desligada" }))
          return
        }
        if (resposta.status === 429) {
          proximoEm = 10_000
        } else if (!resposta.ok) {
          throw new Error("falha")
        } else {
          falhasSeguidas = 0
          const corpo = (await resposta.json()) as AoVivo
          const ultimo = corpo.lotes.at(-1)
          if (ultimo) ultimoId = ultimo.id
          const sinal = ultimo
            ? (new Date(corpo.agora).getTime() - new Date(ultimo.recebidoEm).getTime()) / 1000
            : null

          setEstado((anterior) => {
            const taxa = ultimo?.taxaHz ?? anterior.taxa
            const limite = Math.max(taxa * SEGUNDOS_NA_TELA, 1)
            const novas = corpo.lotes.flatMap(amostrasDoLote)
            const amostras = novas.length ? [...anterior.amostras, ...novas].slice(-limite) : anterior.amostras
            return {
              situacao: "pronta",
              pulseira: corpo.pulseira,
              amostras,
              taxa,
              passos: ultimo?.passosHoje ?? anterior.passos,
              bpm: ultimo ? ultimo.bpm : anterior.bpm,
              ultimoIr: novas.reduce<number | null>((acc, a) => (a.ir !== null ? a.ir : acc), anterior.ultimoIr),
              // Sem lote novo neste pedido, o tempo sem sinal só cresce.
              semSinal: ultimo ? sinal : anterior.semSinal === null ? null : anterior.semSinal + INTERVALO_MS / 1000,
            }
          })
        }
      } catch {
        if (controle.signal.aborted) return
        falhasSeguidas += 1
        if (falhasSeguidas >= 5) setEstado((e) => ({ ...e, situacao: "erro" }))
        proximoEm = Math.min(INTERVALO_MS * 2 ** falhasSeguidas, 15_000)
      }
      if (!parou.current) esperando = setTimeout(perguntar, proximoEm)
    }

    void perguntar()
    return () => {
      parou.current = true
      controle.abort()
      if (esperando) clearTimeout(esperando)
    }
  }, [pedida])

  return (
    <div className="ct-app min-h-dvh bg-canvas">
      <CabecalhoPublico />
      <main id="conteudo" className="ct-app-content">
        <Corpo estado={estado} />
      </main>
    </div>
  )
}

function Corpo({ estado }: { estado: Estado }) {
  if (estado.situacao === "desligada") {
    return <MensagemPublica titulo={publico.desligada.titulo} corpo={publico.desligada.corpo} />
  }
  if (estado.situacao === "erro") {
    return <MensagemPublica titulo={publico.erro.titulo} corpo={publico.erro.corpo} />
  }
  if (estado.situacao === "conectando" || !estado.pulseira) {
    return (
      <p role="status" className="py-16 text-center text-muted">
        {publico.aoVivo.status.conectando}
      </p>
    )
  }

  const t = publico.aoVivo
  const { pulseira, amostras, semSinal } = estado
  const aoVivo = semSinal !== null && semSinal <= SEGUNDOS_ATE_PARAR
  const rotuloDoSinal =
    semSinal === null ? t.status.nunca : aoVivo ? t.status.ao_vivo : preencher(t.status.parado, { tempo: tempoSemSinal(semSinal) })

  const acel = (k: "ax" | "ay" | "az") => amostras.map((a) => a[k])
  const giro = (k: "gx" | "gy" | "gz") => amostras.map((a) => a[k])
  const ir = amostras.map((a) => a.ir).filter((v): v is number => v !== null)
  const pontos = Math.max(estado.taxa * SEGUNDOS_NA_TELA, 2)

  return (
    <>
      <div className="ct-section-heading">
        <div>
          <h1>{t.titulo}</h1>
          <p className="text-sm text-muted">{preencher(t.subtitulo, { codigo: pulseira.codigo })}</p>
        </div>
        <Link
          href={`/demo?pulseira=${encodeURIComponent(pulseira.codigo)}`}
          className="inline-flex items-center gap-2 rounded-ds border border-hairline bg-surface px-3 py-2 text-sm text-ink"
        >
          {t.verDemo}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-2 grid gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Cartao icone={<Radio className="size-5" aria-hidden="true" />} titulo={t.ultimoLote}>
            <span role="status" aria-live="polite" className={aoVivo ? "text-success" : "text-warning"}>
              {aoVivo ? "● " : "○ "}
              {rotuloDoSinal}
            </span>
          </Cartao>
          <Cartao icone={<HeartPulse className="size-5" aria-hidden="true" />} titulo={t.bpm}>
            {estado.bpm !== null && aoVivo ? (
              <>
                {numero(estado.bpm)} <span className="text-base text-muted">{t.bpmUnidade}</span>
              </>
            ) : (
              <span className="text-base text-muted">
                {aoVivo && estado.ultimoIr !== null && estado.ultimoIr > IR_MINIMO_COM_DEDO ? t.bpmMedindo : t.bpmSemDedo}
              </span>
            )}
          </Cartao>
          <Cartao icone={<Footprints className="size-5" aria-hidden="true" />} titulo={t.passos}>
            {estado.passos !== null ? numero(estado.passos) : "-"}
          </Cartao>
          <Cartao icone={<Battery className="size-5" aria-hidden="true" />} titulo={t.bateria}>
            {pulseira.bateria !== null ? `${numero(pulseira.bateria)}%` : "-"}
          </Cartao>
        </div>

        {amostras.length === 0 && <p className="text-sm text-muted">{t.dica}</p>}

        <GraficoBruto
          titulo={t.graficos.aceleracao}
          ajuda={t.graficos.aceleracaoAjuda}
          unidade={t.graficos.aceleracaoUnidade}
          pontos={pontos}
          casas={2}
          series={[
            { nome: t.eixos.x, cor: COR.x, traco: TRACO.x, valores: acel("ax") },
            { nome: t.eixos.y, cor: COR.y, traco: TRACO.y, valores: acel("ay") },
            { nome: t.eixos.z, cor: COR.z, traco: TRACO.z, valores: acel("az") },
          ]}
        />
        <GraficoBruto
          titulo={t.graficos.giroscopio}
          ajuda={t.graficos.giroscopioAjuda}
          unidade={t.graficos.giroscopioUnidade}
          pontos={pontos}
          casas={1}
          simetrico
          series={[
            { nome: t.eixos.x, cor: COR.x, traco: TRACO.x, valores: giro("gx") },
            { nome: t.eixos.y, cor: COR.y, traco: TRACO.y, valores: giro("gy") },
            { nome: t.eixos.z, cor: COR.z, traco: TRACO.z, valores: giro("gz") },
          ]}
        />
        <GraficoBruto
          titulo={t.graficos.infravermelho}
          ajuda={t.graficos.infravermelhoAjuda}
          unidade={t.graficos.infravermelhoUnidade}
          pontos={pontos}
          casas={0}
          series={[{ nome: t.graficos.pulso, cor: COR.x, valores: pulsoDoSinal(ir) }]}
        />
        <p className="text-sm text-muted">
          {preencher(t.janela, { segundos: SEGUNDOS_NA_TELA })} · {t.taxa}: {estado.taxa}
        </p>
      </div>
    </>
  )
}

function Cartao({ icone, titulo, children }: { icone: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-ds-surface border border-hairline bg-surface p-4">
      <p className="flex items-center gap-2 text-sm text-muted">
        {icone}
        {titulo}
      </p>
      <p className="mt-2 text-2xl text-ink">{children}</p>
    </div>
  )
}
