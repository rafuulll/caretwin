"use client";

/*
  A noite minuto a minuto, agrupada em barras (5 minutos, ou 10 em telas estreitas),
  das 20:00 às 10:00. A área destacada por trás é o período de sono estimado.
  Barras baixas são sono tranquilo; os picos dentro da área são os despertares.
*/

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { agruparNoite, horaDaNoite, type SonoEstimado } from "@/lib/sono";
import { escalaLinear, Leitura, Legenda, TabelaDoGrafico, useLargura } from "./base";

type Props = {
  contagens: (number | null)[];
  sono: SonoEstimado | null;
  rotulo: string;
  resumo: string;
  legendaMovimento: string;
  legendaSono: string;
  instrucoes: string;
  semDado: string;
  cabecalhosTabela: [string, string];
  formatarMovimento: (v: number) => string;
};

const MARGEM = { topo: 30, direita: 12, baixo: 30, esquerda: 12 };
const ALTURA = 220;

export function GraficoNoite({ contagens, sono, rotulo, resumo, legendaMovimento, legendaSono, instrucoes, semDado, cabecalhosTabela, formatarMovimento }: Props) {
  const { ref, largura } = useLargura<HTMLDivElement>();
  const [ativo, setAtivo] = useState<number | null>(null);
  const [viaTeclado, setViaTeclado] = useState(false);
  const idInstrucoes = useId();

  const w = Math.max(largura, 280);
  const bloco = w < 560 ? 10 : 5;
  const grupos = useMemo(() => agruparNoite(contagens, bloco), [contagens, bloco]);
  const maximo = Math.max(10, ...grupos.map((g) => g.media ?? 0));
  const x = escalaLinear([0, contagens.length], [MARGEM.esquerda, w - MARGEM.direita]);
  const y = escalaLinear([0, maximo], [ALTURA - MARGEM.baixo, MARGEM.topo]);
  const larguraBarra = Math.max(1, x(bloco) - x(0) - (bloco === 5 && w > 700 ? 2 : 1));
  const horasMarcadas = w < 520 ? [0, 240, 480, 720, 840] : [0, 120, 240, 360, 480, 600, 720, 840];

  const tabela = useMemo(() => agruparNoite(contagens, 30), [contagens]);

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    const ultimo = grupos.length - 1;
    const salto = evento.shiftKey ? Math.round(60 / bloco) : 1;
    let proximo = ativo ?? 0;
    if (evento.key === "ArrowRight") proximo = Math.min(ultimo, proximo + salto);
    else if (evento.key === "ArrowLeft") proximo = Math.max(0, proximo - salto);
    else if (evento.key === "Home") proximo = 0;
    else if (evento.key === "End") proximo = ultimo;
    else return;
    evento.preventDefault();
    setViaTeclado(true);
    setAtivo(proximo);
  }

  const grupoAtivo = ativo !== null ? grupos[ativo] : null;
  const faixaHoraria = grupoAtivo ? `${horaDaNoite(grupoAtivo.inicio)} às ${horaDaNoite(grupoAtivo.inicio + bloco)}` : "";
  const leituraAtiva = grupoAtivo ? (grupoAtivo.media === null ? semDado : formatarMovimento(grupoAtivo.media)) : "";

  return (
    <figure className="m-0">
      <Legenda
        itens={[
          { rotulo: legendaMovimento, marca: "barra" },
          { rotulo: legendaSono, marca: "faixa" },
        ]}
      />
      <div
        ref={ref}
        role="group"
        tabIndex={0}
        aria-label={`${rotulo}. ${resumo}`}
        aria-describedby={idInstrucoes}
        onKeyDown={aoTeclar}
        onFocus={() => {
          setViaTeclado(true);
          setAtivo((a) => a ?? 0);
        }}
        onBlur={() => setAtivo(null)}
        onPointerLeave={() => !viaTeclado && setAtivo(null)}
        onPointerMove={(evento) => {
          const caixa = evento.currentTarget.getBoundingClientRect();
          const minuto = ((evento.clientX - caixa.left - MARGEM.esquerda) / (w - MARGEM.esquerda - MARGEM.direita)) * contagens.length;
          setViaTeclado(false);
          setAtivo(Math.min(grupos.length - 1, Math.max(0, Math.floor(minuto / bloco))));
        }}
        className="relative mt-4 touch-pan-y select-none rounded-campo"
      >
        <span id={idInstrucoes} className="sr-only">
          {instrucoes}
        </span>
        {largura > 0 && (
          <svg width={w} height={ALTURA} role="presentation" className="block overflow-visible">
            {sono && (
              <g>
                <rect
                  x={x(sono.inicio)}
                  y={MARGEM.topo - 10}
                  width={x(sono.fim) - x(sono.inicio)}
                  height={ALTURA - MARGEM.baixo - MARGEM.topo + 10}
                  rx={8}
                  fill="var(--ct-grafico-faixa)"
                />
                <text x={x(sono.inicio) + 8} y={MARGEM.topo + 6} className="fill-tinta text-[0.8rem] font-bold">
                  {horaDaNoite(sono.inicio)}
                </text>
                <text x={x(sono.fim) - 8} y={MARGEM.topo + 6} textAnchor="end" className="fill-tinta text-[0.8rem] font-bold">
                  {horaDaNoite(sono.fim)}
                </text>
              </g>
            )}

            <line x1={MARGEM.esquerda} x2={w - MARGEM.direita} y1={ALTURA - MARGEM.baixo} y2={ALTURA - MARGEM.baixo} stroke="var(--ct-grafico-grade)" />

            {grupos.map((g, i) => {
              if (g.media === null) return null;
              const topo = y(g.media);
              const altura = Math.max(1.5, ALTURA - MARGEM.baixo - topo);
              return (
                <rect
                  key={g.inicio}
                  x={x(g.inicio)}
                  y={ALTURA - MARGEM.baixo - altura}
                  width={larguraBarra}
                  height={altura}
                  rx={Math.min(2, larguraBarra / 2)}
                  fill="var(--ct-grafico-serie)"
                  opacity={ativo === null || ativo === i ? 0.9 : 0.45}
                />
              );
            })}

            {horasMarcadas.map((m) => (
              <text
                key={m}
                x={x(m)}
                y={ALTURA - 8}
                textAnchor={m === 0 ? "start" : m === contagens.length ? "end" : "middle"}
                className="fill-tinta-suave text-[0.78rem] numeros-tabulares"
              >
                {horaDaNoite(m)}
              </text>
            ))}
          </svg>
        )}
        {grupoAtivo && ativo !== null && (
          <Leitura x={x(grupoAtivo.inicio)} largura={w}>
            <p className="font-bold">{leituraAtiva}</p>
            <p className="text-tinta-suave">{faixaHoraria}</p>
          </Leitura>
        )}
        <span className="sr-only" aria-live="polite">
          {viaTeclado && grupoAtivo ? `${faixaHoraria}: ${leituraAtiva}` : ""}
        </span>
      </div>
      <figcaption className="sr-only">{resumo}</figcaption>
      <TabelaDoGrafico
        legenda={rotulo}
        cabecalhos={cabecalhosTabela}
        linhas={tabela.map((g) => [`${horaDaNoite(g.inicio)} às ${horaDaNoite(g.inicio + 30)}`, g.media === null ? semDado : formatarMovimento(g.media)])}
      />
    </figure>
  );
}
