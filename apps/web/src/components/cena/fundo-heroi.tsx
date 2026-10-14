"use client"

import { useEffect, useRef } from "react"
import { marca } from "@/content/site"

/**
 * O fundo vivo da abertura do site.
 *
 * A FAMÍLIA do desenho (ondas, pontilhado, malha ou gradiente) e os PARÂMETROS
 * dela saem de uma semente calculada do nome do produto. O mesmo nome dá sempre
 * o mesmo fundo, e outro nome daria outro, entre milhares de combinações.
 *
 * O tom é contido de propósito: o visual do CareTwin é sóbrio, de tinta escura
 * sobre branco, e o fundo existe pra dar respiro à promessa, não pra competir
 * com ela. As regras de movimento valem inteiras aqui:
 *   - o título, o texto e o botão nascem no HTML, legíveis, antes de isto rodar;
 *   - o laço para quando a dobra sai da tela e quando a aba fica escondida;
 *   - com "reduzir movimento" ligado, desenha UM quadro parado e não anima;
 *   - a densidade de pixel vai no máximo a 2, pro celular não esquentar;
 *   - tudo que foi montado é desmontado quando a página sai.
 * Canvas puro, sem biblioteca: as quatro famílias cabem em poucas linhas.
 */

const FAMILIAS = ["ondas", "pontilhado", "malha", "gradiente"] as const
type Familia = (typeof FAMILIAS)[number]

function hashDoNome(texto: string) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function sorteador(semente: number) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Tudo que o desenho precisa, decidido uma vez a partir do nome. */
function parametros(nome: string) {
  const semente = hashDoNome(nome)
  const s = sorteador(semente)
  const entre = (min: number, max: number) => min + s() * (max - min)
  const familia: Familia = FAMILIAS[semente % FAMILIAS.length]
  return {
    familia,
    // ondas
    linhas: Math.round(entre(6, 10)),
    amplitude: entre(14, 30),
    comprimento: entre(260, 520),
    // pontilhado e malha
    espaco: Math.round(entre(20, 30)),
    // todas
    velocidade: entre(0.00012, 0.00024),
    fase: entre(0, Math.PI * 2),
    intensidade: entre(0.1, 0.16),
  }
}

type Parametros = ReturnType<typeof parametros>

function desenhar(ctx: CanvasRenderingContext2D, l: number, a: number, t: number, p: Parametros, cor: string) {
  ctx.clearRect(0, 0, l, a)
  ctx.strokeStyle = cor
  ctx.fillStyle = cor

  if (p.familia === "ondas") {
    ctx.lineWidth = 1.25
    for (let i = 0; i < p.linhas; i++) {
      const base = a * (0.18 + (0.7 * i) / p.linhas)
      ctx.globalAlpha = p.intensidade * (0.55 + 0.45 * Math.sin(i + p.fase))
      ctx.beginPath()
      for (let x = 0; x <= l; x += 8) {
        const y =
          base +
          p.amplitude * Math.sin((x / p.comprimento) * Math.PI * 2 + t * p.velocidade * (1 + i * 0.15) + p.fase + i)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }

  if (p.familia === "pontilhado") {
    const cx = l * 0.7
    const cy = a * 0.35
    for (let y = p.espaco / 2; y < a; y += p.espaco) {
      for (let x = p.espaco / 2; x < l; x += p.espaco) {
        const d = Math.hypot(x - cx, y - cy)
        const onda = 0.5 + 0.5 * Math.sin(d / 38 - t * p.velocidade * 6 + p.fase)
        ctx.globalAlpha = p.intensidade * (0.35 + onda)
        ctx.beginPath()
        ctx.arc(x, y, 0.7 + onda * 1.3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  if (p.familia === "malha") {
    // Triângulos, e não quadrado: a grade quadriculada é justamente o fundo que
    // todo site gerado já tem.
    ctx.lineWidth = 1
    ctx.globalAlpha = p.intensidade * 0.8
    const passo = p.espaco * 2.4
    const ponto = (i: number, j: number) => {
      const x = i * passo + (j % 2) * (passo / 2)
      const y = j * passo * 0.86
      const deriva = Math.sin(i * 0.9 + j * 1.3 + t * p.velocidade * 5 + p.fase) * 6
      return [x + deriva, y + deriva * 0.6] as const
    }
    ctx.beginPath()
    for (let j = 0; j * passo * 0.86 < a + passo; j++) {
      for (let i = 0; i * passo < l + passo; i++) {
        const [x, y] = ponto(i, j)
        const [x2, y2] = ponto(i + 1, j)
        const [x3, y3] = ponto(i + (j % 2), j + 1)
        ctx.moveTo(x, y)
        ctx.lineTo(x2, y2)
        ctx.moveTo(x, y)
        ctx.lineTo(x3, y3)
      }
    }
    ctx.stroke()
  }

  if (p.familia === "gradiente") {
    for (let i = 0; i < 3; i++) {
      const x = l * (0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * p.velocidade * 2 + i * 2.1 + p.fase)))
      const y = a * (0.2 + 0.5 * (0.5 + 0.5 * Math.cos(t * p.velocidade * 1.6 + i * 1.7)))
      const raio = Math.max(l, a) * 0.35
      const g = ctx.createRadialGradient(x, y, 0, x, y, raio)
      g.addColorStop(0, cor)
      g.addColorStop(1, "transparent")
      ctx.globalAlpha = p.intensidade * 0.6
      ctx.fillStyle = g
      ctx.fillRect(0, 0, l, a)
    }
  }

  ctx.globalAlpha = 1
}

export function FundoHeroi() {
  const refCanvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = refCanvas.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const p = parametros(marca.nome)
    // A cor é LIDA do tema na hora de desenhar, nunca escrita aqui: trocar o
    // design system repinta o fundo junto.
    const cor = getComputedStyle(document.documentElement).getPropertyValue("--ds-primary").trim()
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let largura = 0
    let altura = 0
    let quadro = 0
    let visivel = true
    let abaAberta = document.visibilityState === "visible"

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      largura = canvas.clientWidth
      altura = canvas.clientHeight
      canvas.width = Math.round(largura * dpr)
      canvas.height = Math.round(altura * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      desenhar(ctx, largura, altura, parado ? 0 : performance.now(), p, cor)
    }

    const laco = (t: number) => {
      desenhar(ctx, largura, altura, t, p, cor)
      quadro = requestAnimationFrame(laco)
    }

    const atualizar = () => {
      cancelAnimationFrame(quadro)
      quadro = 0
      if (!parado && visivel && abaAberta) quadro = requestAnimationFrame(laco)
    }

    const redimensionar = new ResizeObserver(medir)
    redimensionar.observe(canvas)

    const naTela = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting
      atualizar()
    })
    naTela.observe(canvas)

    const aoTrocarDeAba = () => {
      abaAberta = document.visibilityState === "visible"
      atualizar()
    }
    document.addEventListener("visibilitychange", aoTrocarDeAba)

    medir()
    atualizar()

    return () => {
      cancelAnimationFrame(quadro)
      redimensionar.disconnect()
      naTela.disconnect()
      document.removeEventListener("visibilitychange", aoTrocarDeAba)
    }
  }, [])

  return (
    <canvas
      ref={refCanvas}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      style={{
        maskImage: "radial-gradient(ellipse 75% 70% at 70% 35%, black 25%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 70% 35%, black 25%, transparent 80%)",
      }}
    />
  )
}
