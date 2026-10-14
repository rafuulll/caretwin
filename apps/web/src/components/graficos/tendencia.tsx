"use client";

/*
  Linha do tempo de uma métrica com a faixa do normal de cada dia por trás.
  Uma série só (sem legenda de série dupla nem eixo duplo), faixa em lavagem de 12%,
  pontos fora do normal com contorno grosso e o rótulo direto só no último valor.
  Teclado: o gráfico recebe foco e as setas andam de dia em dia, mostrando a mesma
  leitura do mouse. A tabela com os mesmos números fica logo abaixo.
*/

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import type { PontoDaSerie } from "@/lib/consultas";
import { diaDaSemana, diaEMes } from "@/lib/formato";
import { situacoes } from "@/content/app";
import { compacto, escalaLinear, Leitura, Legenda, marcasRedondas, TabelaDoGrafico, useLargura } from "./base";

type Props = {
  pontos: PontoDaSerie[];
  formatar: (valor: number) => string;
  formatarEixo?: (valor: number) => string;
  rotulo: string;
  resumo: string;
  legendaSerie: string;
  legendaFaixa: string;
  legendaFora: string;
  cabecalhosTabela: [string, string, string, string];
  instrucoes: string;
  semDado: string;
  altura?: number;
  /** Marcas fixas do eixo (por exemplo, de 2 em 2 horas no sono). */
  marcasEixo?: number[];
};

const MARGEM = { topo: 28, direita: 16, baixo: 30, esquerda: 52 };

export function GraficoTendencia({
  pontos,
  formatar,
  formatarEixo = compacto,
  rotulo,
  resumo,
  legendaSerie,
  legendaFaixa,
  legendaFora,
  cabecalhosTabela,
  instrucoes,
  semDado,
  altura = 260,
  marcasEixo,
}: Props) {
  const { ref, largura } = useLargura<HTMLDivElement>();
  const [ativo, setAtivo] = useState<number | null>(null);
  const [viaTeclado, setViaTeclado] = useState(false);
  const idInstrucoes = useId();

  const maximo = useMemo(() => {
    let m = 0;
    for (const p of pontos) {
      if (p.valor !== null) m = Math.max(m, p.valor);
      if (p.faixa) m = Math.max(m, p.faixa.alto);
    }
    return m * 1.12 || 1;
  }, [pontos]);

  const marcas = marcasEixo
    ? [...marcasEixo.filter((m) => m < maximo), marcasEixo.find((m) => m >= maximo) ?? marcasEixo[marcasEixo.length - 1]]
    : marcasRedondas(maximo, 4);
  const topoEscala = marcas[marcas.length - 1];
  const w = Math.max(largura, 280);
  const x = escalaLinear([0, pontos.length - 1], [MARGEM.esquerda + 8, w - MARGEM.direita - 8]);
  const y = escalaLinear([0, topoEscala], [altura - MARGEM.baixo, MARGEM.topo]);
  const passoX = pontos.length > 1 ? x(1) - x(0) : w;

  // Faixa: polígono que passa pelo alto de cada dia e volta pelo baixo.
  const comFaixa = pontos.map((p, i) => ({ p, i })).filter(({ p }) => p.faixa);
  const caminhoFaixa =
    comFaixa.length > 1
      ? [
          ...comFaixa.map(({ p, i }, k) => `${k === 0 ? "M" : "L"}${x(i)} ${y(p.faixa!.alto)}`),
          ...[...comFaixa].reverse().map(({ p, i }) => `L${x(i)} ${y(p.faixa!.baixo)}`),
          "Z",
        ].join(" ")
      : "";

  // Linha: quebra onde não há dado.
  const segmentos: string[] = [];
  let atual = "";
  pontos.forEach((p, i) => {
    if (p.valor === null) {
      if (atual) segmentos.push(atual);
      atual = "";
      return;
    }
    atual += `${atual ? "L" : "M"}${x(i)} ${y(p.valor)} `;
  });
  if (atual) segmentos.push(atual);

  const ultimoComValor = [...pontos].map((p, i) => ({ p, i })).reverse().find(({ p }) => p.valor !== null);

  const passoRotulo = w < 520 ? 3 : w < 760 ? 2 : 1;

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
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
  const descricaoAtiva = pontoAtivo
    ? `${diaDaSemana(pontoAtivo.data)}, ${diaEMes(pontoAtivo.data)}: ${pontoAtivo.valor === null ? semDado : formatar(pontoAtivo.valor)}. ${
        pontoAtivo.faixa ? `${legendaFaixa}: ${formatar(pontoAtivo.faixa.baixo)} a ${formatar(pontoAtivo.faixa.alto)}.` : ""
      } ${situacoes[pontoAtivo.situacao].rotulo}.`
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
          setAtivo((a) => a ?? (ultimoComValor?.i ?? pontos.length - 1));
        }}
        onBlur={() => setAtivo(null)}
        onPointerLeave={() => !viaTeclado && setAtivo(null)}
        onPointerMove={(evento) => {
          const caixa = evento.currentTarget.getBoundingClientRect();
          const px = evento.clientX - caixa.left;
          const indice = Math.round((px - x(0)) / passoX);
          setViaTeclado(false);
          setAtivo(Math.min(pontos.length - 1, Math.max(0, indice)));
        }}
        className="relative mt-4 touch-pan-y select-none rounded-campo"
      >
        <span id={idInstrucoes} className="sr-only">
          {instrucoes}
        </span>
        {largura > 0 && (
          <svg width={w} height={altura} role="presentation" className="block overflow-visible">
            {marcas.map((m) => (
              <g key={m}>
                <line x1={MARGEM.esquerda} x2={w - MARGEM.direita} y1={y(m)} y2={y(m)} stroke="var(--ct-grafico-grade)" strokeWidth={1} />
                <text x={MARGEM.esquerda - 10} y={y(m)} dy="0.35em" textAnchor="end" className="fill-tinta-suave text-[0.78rem] numeros-tabulares">
                  {formatarEixo(m)}
                </text>
              </g>
            ))}

            {caminhoFaixa && <path d={caminhoFaixa} fill="var(--ct-grafico-faixa)" />}

            {pontoAtivo && ativo !== null && (
              <line x1={x(ativo)} x2={x(ativo)} y1={MARGEM.topo - 8} y2={altura - MARGEM.baixo} stroke="var(--ct-borda-campo)" strokeWidth={1} />
            )}

            {segmentos.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="var(--ct-grafico-serie)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}

            {pontos.map((p, i) => {
              if (p.valor === null) return null;
              const fora = p.situacao === "abaixo" || p.situacao === "acima";
              const destacado = ativo === i;
              return (
                <g key={p.data}>
                  {fora && <circle cx={x(i)} cy={y(p.valor)} r={8} fill="var(--ct-superficie)" stroke="var(--ct-atencao)" strokeWidth={3} />}
                  <circle
                    cx={x(i)}
                    cy={y(p.valor)}
                    r={destacado ? 6 : 4.5}
                    fill="var(--ct-grafico-serie)"
                    stroke="var(--ct-superficie)"
                    strokeWidth={2}
                  />
                </g>
              );
            })}

            {ultimoComValor && ultimoComValor.p.valor !== null && w >= 520 && (
              <text
                x={x(ultimoComValor.i)}
                y={y(ultimoComValor.p.valor) - 16}
                textAnchor={ultimoComValor.i > pontos.length - 3 ? "end" : "middle"}
                className="fill-tinta text-[0.85rem] font-bold"
                stroke="var(--ct-superficie)"
                strokeWidth={4}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                {formatar(ultimoComValor.p.valor)}
              </text>
            )}

            {pontos.map((p, i) =>
              (pontos.length - 1 - i) % passoRotulo === 0 ? (
                <text key={p.data} x={x(i)} y={altura - 8} textAnchor="middle" className={p.hoje ? "fill-tinta text-[0.78rem] font-bold" : "fill-tinta-suave text-[0.78rem]"}>
                  {diaDaSemana(p.data).slice(0, 3)}
                </text>
              ) : null,
            )}
          </svg>
        )}

        {pontoAtivo && ativo !== null && (
          <Leitura x={x(ativo)} largura={w}>
            <p className="font-bold numeros-tabulares">{pontoAtivo.valor === null ? semDado : formatar(pontoAtivo.valor)}</p>
            <p className="text-tinta-suave">
              {diaDaSemana(pontoAtivo.data)}, {diaEMes(pontoAtivo.data)}
            </p>
            {pontoAtivo.faixa && (
              <p className="text-tinta-suave">
                {legendaFaixa}: {formatar(pontoAtivo.faixa.baixo)} a {formatar(pontoAtivo.faixa.alto)}
              </p>
            )}
          </Leitura>
        )}
        <span className="sr-only" aria-live="polite">
          {viaTeclado ? descricaoAtiva : ""}
        </span>
      </div>
      <figcaption className="sr-only">{resumo}</figcaption>

      <TabelaDoGrafico
        legenda={rotulo}
        cabecalhos={cabecalhosTabela}
        linhas={[...pontos].reverse().map((p) => [
          `${diaDaSemana(p.data)}, ${diaEMes(p.data)}`,
          p.valor === null ? semDado : formatar(p.valor),
          p.faixa ? `${formatar(p.faixa.baixo)} a ${formatar(p.faixa.alto)}` : semDado,
          situacoes[p.situacao].rotulo,
        ])}
      />
    </figure>
  );
}
