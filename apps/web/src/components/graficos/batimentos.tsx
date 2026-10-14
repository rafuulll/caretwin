"use client";

/*
  Histórico de medições de batimentos: um ponto por medição, ao longo dos últimos 14 dias,
  com a faixa de costume da pessoa como uma lavagem horizontal. Pontos fora da faixa
  ganham contorno grosso. O eixo começa perto dos valores (não em zero) porque a variação
  que importa aqui é de poucos batimentos; as marcas do eixo deixam isso claro.
*/

import { useId, useState, type KeyboardEvent } from "react";
import type { Faixa } from "@/lib/normal";
import type { MedicaoBatimentos } from "@/lib/types";
import { chaveDia, diaDaSemana, diaEMes, hora, somarDias } from "@/lib/formato";
import { escalaLinear, Leitura, Legenda, TabelaDoGrafico, useLargura } from "./base";

type Props = {
  medicoes: MedicaoBatimentos[];
  faixa: Faixa | null;
  hoje: string;
  rotulo: string;
  resumo: string;
  legendaSerie: string;
  legendaFaixa: string;
  legendaFora: string;
  instrucoes: string;
  cabecalhosTabela: [string, string, string];
  situacaoDe: (bpm: number) => string;
};

const MARGEM = { topo: 20, direita: 16, baixo: 30, esquerda: 44 };
const ALTURA = 220;
const DIAS = 14;

export function GraficoBatimentos({ medicoes, faixa, hoje, rotulo, resumo, legendaSerie, legendaFaixa, legendaFora, instrucoes, cabecalhosTabela, situacaoDe }: Props) {
  const { ref, largura } = useLargura<HTMLDivElement>();
  const [ativo, setAtivo] = useState<number | null>(null);
  const [viaTeclado, setViaTeclado] = useState(false);
  const idInstrucoes = useId();

  const inicio = new Date(`${somarDias(hoje, -(DIAS - 1))}T00:00:00`).getTime();
  const fim = new Date(`${hoje}T23:59:59`).getTime();
  const pontos = medicoes.filter((m) => new Date(m.em).getTime() >= inicio).sort((a, b) => a.em.localeCompare(b.em));

  const valores = pontos.map((p) => p.bpm);
  const minimo = Math.floor((Math.min(...valores, faixa?.baixo ?? 60) - 6) / 5) * 5;
  const maximo = Math.ceil((Math.max(...valores, faixa?.alto ?? 80) + 6) / 5) * 5;
  const marcas: number[] = [];
  for (let v = minimo; v <= maximo; v += 10) marcas.push(v);

  const w = Math.max(largura, 280);
  const x = escalaLinear([inicio, fim], [MARGEM.esquerda + 6, w - MARGEM.direita - 6]);
  const y = escalaLinear([minimo, maximo], [ALTURA - MARGEM.baixo, MARGEM.topo]);
  const dias = Array.from({ length: DIAS }, (_, i) => somarDias(hoje, -(DIAS - 1) + i));
  const passoRotulo = w < 520 ? 4 : 2;

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (pontos.length === 0) return;
    const ultimo = pontos.length - 1;
    let proximo = ativo ?? ultimo;
    if (evento.key === "ArrowRight") proximo = Math.min(ultimo, proximo + 1);
    else if (evento.key === "ArrowLeft") proximo = Math.max(0, proximo - 1);
    else if (evento.key === "Home") proximo = 0;
    else if (evento.key === "End") proximo = ultimo;
    else return;
    evento.preventDefault();
    setViaTeclado(true);
    setAtivo(proximo);
  }

  const pontoAtivo = ativo !== null ? pontos[ativo] : null;
  const leitura = pontoAtivo
    ? `${pontoAtivo.bpm} por minuto, ${diaDaSemana(chaveDia(new Date(pontoAtivo.em)))} às ${hora(pontoAtivo.em)}. ${situacaoDe(pontoAtivo.bpm)}.`
    : "";

  return (
    <figure className="m-0">
      <Legenda
        itens={[
          { rotulo: legendaSerie, marca: "linha" },
          { rotulo: legendaFaixa, marca: "faixa" },
          { rotulo: legendaFora, marca: "fora" },
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
          setAtivo((a) => a ?? (pontos.length ? pontos.length - 1 : null));
        }}
        onBlur={() => setAtivo(null)}
        onPointerLeave={() => !viaTeclado && setAtivo(null)}
        onPointerMove={(evento) => {
          if (pontos.length === 0) return;
          const caixa = evento.currentTarget.getBoundingClientRect();
          const px = evento.clientX - caixa.left;
          let melhor = 0;
          let distancia = Infinity;
          pontos.forEach((p, i) => {
            const d = Math.abs(x(new Date(p.em).getTime()) - px);
            if (d < distancia) {
              distancia = d;
              melhor = i;
            }
          });
          setViaTeclado(false);
          setAtivo(melhor);
        }}
        className="relative mt-4 touch-pan-y select-none rounded-campo"
      >
        <span id={idInstrucoes} className="sr-only">
          {instrucoes}
        </span>
        {largura > 0 && (
          <svg width={w} height={ALTURA} role="presentation" className="block overflow-visible">
            {faixa && (
              <rect
                x={MARGEM.esquerda}
                width={w - MARGEM.esquerda - MARGEM.direita}
                y={y(faixa.alto)}
                height={Math.max(2, y(faixa.baixo) - y(faixa.alto))}
                fill="var(--ct-grafico-faixa)"
                rx={6}
              />
            )}
            {marcas.map((m) => (
              <g key={m}>
                <line x1={MARGEM.esquerda} x2={w - MARGEM.direita} y1={y(m)} y2={y(m)} stroke="var(--ct-grafico-grade)" />
                <text x={MARGEM.esquerda - 8} y={y(m)} dy="0.35em" textAnchor="end" className="fill-tinta-suave text-[0.78rem] numeros-tabulares">
                  {m}
                </text>
              </g>
            ))}
            {pontos.length > 1 && (
              <path
                d={pontos.map((p, i) => `${i === 0 ? "M" : "L"}${x(new Date(p.em).getTime())} ${y(p.bpm)}`).join(" ")}
                fill="none"
                stroke="var(--ct-grafico-serie)"
                strokeOpacity={0.35}
                strokeWidth={1.5}
              />
            )}
            {pontos.map((p, i) => {
              const fora = faixa ? p.bpm < faixa.baixo || p.bpm > faixa.alto : false;
              const cx = x(new Date(p.em).getTime());
              return (
                <g key={p.em}>
                  {fora && <circle cx={cx} cy={y(p.bpm)} r={8} fill="var(--ct-superficie)" stroke="var(--ct-atencao)" strokeWidth={3} />}
                  <circle cx={cx} cy={y(p.bpm)} r={ativo === i ? 6 : 4.5} fill="var(--ct-grafico-serie)" stroke="var(--ct-superficie)" strokeWidth={2} />
                </g>
              );
            })}
            {dias.map((d, i) =>
              (DIAS - 1 - i) % passoRotulo === 0 ? (
                <text
                  key={d}
                  x={x(new Date(`${d}T12:00:00`).getTime())}
                  y={ALTURA - 8}
                  textAnchor="middle"
                  className={d === hoje ? "fill-tinta text-[0.78rem] font-bold" : "fill-tinta-suave text-[0.78rem]"}
                >
                  {diaEMes(d)}
                </text>
              ) : null,
            )}
          </svg>
        )}
        {pontoAtivo && (
          <Leitura x={x(new Date(pontoAtivo.em).getTime())} largura={w}>
            <p className="font-bold">{pontoAtivo.bpm} por minuto</p>
            <p className="text-tinta-suave">
              {diaDaSemana(chaveDia(new Date(pontoAtivo.em)))}, {diaEMes(chaveDia(new Date(pontoAtivo.em)))} às {hora(pontoAtivo.em)}
            </p>
          </Leitura>
        )}
        <span className="sr-only" aria-live="polite">
          {viaTeclado ? leitura : ""}
        </span>
      </div>
      <figcaption className="sr-only">{resumo}</figcaption>
      <TabelaDoGrafico
        legenda={rotulo}
        cabecalhos={cabecalhosTabela}
        linhas={[...pontos].reverse().map((p) => [
          `${diaDaSemana(chaveDia(new Date(p.em)))}, ${diaEMes(chaveDia(new Date(p.em)))} às ${hora(p.em)}`,
          String(p.bpm),
          situacaoDe(p.bpm),
        ])}
      />
    </figure>
  );
}
