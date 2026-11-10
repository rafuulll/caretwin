"use client"

import { useEffect, useRef, useState } from "react"
import { Button, Card } from "@/components/ui"
import { sistema } from "@/content/site"
import { medicoesDe, noiteMaisRecente, passosDeHoje, quantosNovos } from "@/lib/consultas"
import { paraISO } from "@/lib/formato"
import { RESUMOS_DO_DIA } from "@/lib/respostas-ia"
import { ia, useDados } from "@/lib/store"
import type { Pessoa } from "@/lib/types"
import { Icone } from "../icone"
import { ModalIa } from "./modal-ia"

const textos = sistema.alertas

/** Uma ordem embaralhada dos textos: cada clique pega o próximo, e só repete depois de usar todos. */
function embaralhar(quantos: number) {
  const ordem = Array.from({ length: quantos }, (_, i) => i)
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ordem[i], ordem[j]] = [ordem[j], ordem[i]]
  }
  return ordem
}

/**
 * O resumo do dia, o que quem cuida veio ler à noite. A IA nasce funcionando:
 * clicou, sai texto. O texto é de exemplo, montado com os números de verdade
 * do dia, e o aviso logo embaixo diz isso sem rodeio.
 */
export function ResumoDoDia({ pessoa, agora }: { pessoa: Pessoa; agora: Date }) {
  const { dados } = useDados()
  const [texto, setTexto] = useState("")
  const [escrevendo, setEscrevendo] = useState(false)
  const [daIa, setDaIa] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const fila = useRef<number[]>([])
  const relogio = useRef<number | null>(null)

  useEffect(() => () => {
    if (relogio.current !== null) window.clearTimeout(relogio.current)
  }, [])

  async function escrever() {
    if (fila.current.length === 0) fila.current = embaralhar(RESUMOS_DO_DIA.length)
    const indice = fila.current.shift() ?? 0

    const passos = passosDeHoje(dados, pessoa.id, agora)
    const noite = noiteMaisRecente(dados, pessoa.id, agora)
    const ultima = medicoesDe(dados, pessoa.id).find((m) => m.data === paraISO(agora))
    const fatos = {
      nome: pessoa.nome,
      passos: passos.passos,
      normalDePassos: passos.faixaAteAgora?.normal ?? null,
      situacaoPassos: passos.situacao,
      sono: noite && !noite.deOntem ? noite.sono.minutosDormindo : null,
      situacaoSono: noite && !noite.deOntem ? noite.situacao : "aprendendo",
      ultimoBpm: ultima?.bpm ?? null,
      alertasNovos: quantosNovos(dados, pessoa.id),
    } as const
    const reserva = RESUMOS_DO_DIA[indice](fatos)

    // Primeiro tenta a IA (a rota confere o texto contra os números antes de
    // responder). Sem modelo ligado, reprovado ou fora do ar, entra o texto de
    // exemplo, e o aviso embaixo diz qual dos dois está na tela.
    setEscrevendo(true)
    const [resposta] = await Promise.all([
      ia.resumirDia(fatos, `${pessoa.id}:${paraISO(agora)}:${indice}`),
      new Promise((ok) => (relogio.current = window.setTimeout(ok, 600))),
    ])
    const daModelo = resposta.ok && resposta.corpo.origem === "ia"
    setTexto(daModelo && resposta.ok ? resposta.corpo.texto : reserva)
    setDaIa(daModelo)
    setEscrevendo(false)
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg text-ink">
        <Icone nome="escrever" className="size-5 text-[var(--ds-primary-accent)]" />
        {textos.resumo.titulo}
      </h2>
      <p className="mt-1.5 text-base text-muted">{textos.resumo.descricao}</p>

      <div aria-live="polite">
        {texto && (
          <>
            <p className="mt-4 rounded-ds-surface border border-hairline bg-surface p-4 text-lg leading-relaxed text-ink">
              {texto}
            </p>
            <p className="mt-2 text-sm text-muted">
              {daIa ? textos.resumo.daIa : textos.ia.aviso}{" "}
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4 pointer-fine:min-h-0"
              >
                {textos.ia.como}
              </button>
            </p>
          </>
        )}
      </div>

      <Button
        tamanho="lg"
        variante={texto ? "secundaria" : "primaria"}
        carregando={escrevendo}
        onClick={escrever}
        iconeEsquerda={<Icone nome="escrever" />}
        className="mt-4 h-14 text-lg"
      >
        {escrevendo ? textos.resumo.escrevendo : texto ? textos.resumo.outro : textos.resumo.escrever}
      </Button>

      <ModalIa aberto={modalAberto} aoFechar={() => setModalAberto(false)} />
    </Card>
  )
}
