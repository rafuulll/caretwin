"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Card } from "@/components/ui"
import { sistema } from "@/content/site"
import { SEGUNDOS_MEDICAO } from "@/lib/modelo"
import type { Faixa } from "@/lib/normal"
import { situacao } from "@/lib/normal"
import { numero, preencher } from "@/lib/formato"
import { useDados } from "@/lib/store"
import type { Pessoa } from "@/lib/types"
import { Icone } from "../icone"
import { SeloSituacao } from "../selo-situacao"

const textos = sistema.batimentos.medir

type Fase = { tipo: "pronta" } | { tipo: "medindo"; restam: number } | { tipo: "pronto"; bpm: number }

/**
 * A medição guiada: a pessoa aperta um botão grande, fica parada doze
 * segundos e vê o número. Três fases, e cada uma tem uma ação só, porque quem
 * mede batimentos às vezes está cansado, sem óculos ou com pressa.
 *
 * Nesta versão o número é simulado em volta do normal da pessoa. Com a
 * pulseira de verdade, é aqui que chega a leitura do sensor do pulso.
 */
export function Medicao({ pessoa, faixa }: { pessoa: Pessoa; faixa: Faixa | null }) {
  const { registrarMedicao } = useDados()
  const [fase, setFase] = useState<Fase>({ tipo: "pronta" })
  const [aviso, setAviso] = useState("")
  const refResultado = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (fase.tipo !== "medindo") return
    const relogio = window.setTimeout(() => {
      const restam = fase.restam - 1
      if (restam > 0) {
        setFase({ tipo: "medindo", restam })
        return
      }
      const base = faixa?.normal ?? 70
      const bpm = Math.round(base + (Math.random() - 0.5) * 8)
      registrarMedicao(pessoa.id, bpm)
      setFase({ tipo: "pronto", bpm })
      setAviso(`${numero(bpm)} ${textos.resultado}. ${textos.guardada}`)
    }, 1000)
    return () => window.clearTimeout(relogio)
  }, [fase, faixa, pessoa.id, registrarMedicao])

  // O foco vai pro resultado: quem usa leitor de tela ouve o número sem caçar.
  useEffect(() => {
    if (fase.tipo === "pronto") refResultado.current?.focus()
  }, [fase.tipo])

  function comecar() {
    setAviso("")
    setFase({ tipo: "medindo", restam: SEGUNDOS_MEDICAO })
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg text-ink">
        <Icone nome="batimentos" className="size-5 text-[var(--ds-primary-accent)]" />
        {textos.titulo}
      </h2>

      <div className="mt-5 flex min-h-56 flex-col items-center justify-center gap-5 rounded-ds-surface border border-hairline bg-surface px-5 py-8 text-center">
        {fase.tipo === "pronta" && (
          <>
            <p className="max-w-sm text-base leading-relaxed text-ink">
              {preencher(textos.instrucao, { segundos: SEGUNDOS_MEDICAO })}
            </p>
            <Button tamanho="lg" onClick={comecar} iconeEsquerda={<Icone nome="batimentos" />} className="h-14 px-8 text-lg">
              {textos.comecar}
            </Button>
          </>
        )}

        {fase.tipo === "medindo" && (
          <>
            <p className="text-lg font-medium text-ink">{textos.medindo}</p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full origin-left rounded-full bg-primary transition-transform duration-1000 ease-linear"
                style={{ transform: `scaleX(${(SEGUNDOS_MEDICAO - fase.restam) / SEGUNDOS_MEDICAO})` }}
              />
            </div>
            <p className="text-base tabular-nums text-muted">{preencher(textos.faltam, { n: fase.restam })}</p>
            <Button
              variante="secundaria"
              onClick={() => {
                setFase({ tipo: "pronta" })
                setAviso(textos.cancelada)
              }}
            >
              {textos.cancelar}
            </Button>
          </>
        )}

        {fase.tipo === "pronto" && (
          <>
            <p ref={refResultado} tabIndex={-1} className="flex flex-col items-center focus:outline-none">
              <span className="font-display text-6xl leading-none tabular-nums text-ink">{fase.bpm}</span>
              <span className="mt-2 text-base text-muted">{textos.resultado}</span>
            </p>
            <SeloSituacao situacao={situacao(fase.bpm, faixa)} />
            <p className="flex items-center gap-1.5 text-sm text-success">
              <Icone nome="check" className="size-4" />
              {textos.guardada}
            </p>
            <Button variante="secundaria" tamanho="lg" onClick={comecar} iconeEsquerda={<Icone nome="restaurar" />}>
              {textos.deNovo}
            </Button>
          </>
        )}
      </div>

      {faixa && (
        <p className="mt-4 text-base text-ink">
          {preencher(textos.costume, { baixo: Math.round(faixa.baixo), alto: Math.round(faixa.alto) })}
        </p>
      )}
      <p className="mt-2 flex gap-2 text-sm text-muted">
        <Icone nome="info" className="mt-0.5 size-4 shrink-0" />
        {textos.simulada}
      </p>

      {/* Mudança silenciosa anunciada: o número aparece sem a pessoa clicar em nada. */}
      <p role="status" className="sr-only">
        {aviso}
      </p>
    </Card>
  )
}
