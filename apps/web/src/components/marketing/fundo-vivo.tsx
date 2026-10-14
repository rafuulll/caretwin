"use client";

/*
  Fundo da dobra de abertura: linhas de pulso que derivam devagar, como o traço de
  atividade de um dia tranquilo. Família e parâmetros saem de uma semente calculada
  do nome do produto, então este app sempre tem o mesmo fundo e outro app teria outro.

  Regras de movimento: o laço para quando a dobra sai da tela ou a aba é escondida,
  e com "reduzir movimento" fica um quadro parado (o CSS global zera a animação).
  É decoração pura: aria-hidden, e o texto da dobra nasce legível antes dele.
*/

import { useEffect, useRef } from "react";
import { marca } from "@/content/site";

function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function sequencia(semente: number) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LARGURA = 2400;
const ALTURA = 640;

/** Um traço de pulso que se repete a cada "periodo" pixels, para a deriva não ter emenda. */
function caminhoDePulso(rand: () => number, y: number, amplitude: number, periodo: number): string {
  const partes = [`M0 ${y}`];
  for (let x = 0; x < LARGURA; x += periodo) {
    const pico = amplitude * (0.6 + 0.4 * ((x / periodo) % 2 === 0 ? 1 : 0.7));
    partes.push(
      `L${x + periodo * 0.38} ${y}`,
      `L${x + periodo * 0.44} ${y - pico * 0.35}`,
      `L${x + periodo * 0.5} ${y + pico * 0.2}`,
      `L${x + periodo * 0.56} ${y - pico}`,
      `L${x + periodo * 0.62} ${y + pico * 0.45}`,
      `L${x + periodo * 0.68} ${y}`,
      `L${x + periodo} ${y}`,
    );
  }
  void rand;
  return partes.join(" ");
}

function caminhoDeOnda(y: number, amplitude: number, periodo: number): string {
  const partes = [`M0 ${y}`];
  for (let x = 0; x < LARGURA; x += periodo / 2) {
    const sobe = (x / (periodo / 2)) % 2 === 0;
    partes.push(`Q${x + periodo / 4} ${y + (sobe ? -amplitude : amplitude)} ${x + periodo / 2} ${y}`);
  }
  return partes.join(" ");
}

const semente = hash(marca.nome);
const rand = sequencia(semente);
// Períodos que dividem 1200 sem resto: a deriva de 50% fecha o ciclo sem emenda.
const PERIODOS = [200, 240, 300, 400];
const linhas = Array.from({ length: 5 }, (_, i) => {
  const periodo = PERIODOS[Math.floor(rand() * PERIODOS.length)];
  const y = 120 + i * 95 + rand() * 30;
  const pulso = i === 2;
  return {
    d: pulso ? caminhoDePulso(rand, y, 70 + rand() * 30, 600) : caminhoDeOnda(y, 10 + rand() * 18, periodo),
    opacidade: pulso ? 0.32 : 0.1 + rand() * 0.1,
    espessura: pulso ? 2 : 1.25,
    duracao: 70 + Math.round(rand() * 50),
  };
});

export function FundoVivo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    let visivel = true;
    const atualizar = () => {
      elemento.dataset.pausado = String(!visivel || document.hidden);
    };
    const observador = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      atualizar();
    });
    observador.observe(elemento);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      observador.disconnect();
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fundo-vivo pointer-events-none absolute inset-0 overflow-hidden text-primaria [mask-image:linear-gradient(to_right,transparent_0%,transparent_30%,black_70%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,transparent_42%,black_75%)]"
      data-pausado="false"
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,color-mix(in_oklab,var(--ct-secundaria)_14%,transparent),transparent)]" />
      <svg className="absolute inset-y-0 left-0 hidden h-full w-[200%] lg:block" viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="none">
        {linhas.map((linha, i) => (
          <g key={i} className="fundo-vivo-linha" style={{ animationDuration: `${linha.duracao}s` }}>
            <path d={linha.d} stroke="currentColor" strokeWidth={linha.espessura} strokeOpacity={linha.opacidade} fill="none" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-fundo" />
    </div>
  );
}
