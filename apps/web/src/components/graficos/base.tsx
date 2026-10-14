"use client";

/*
  Peças comuns dos gráficos do CareTwin, escritos à mão em SVG (sem biblioteca):
  medida do contêiner, escalas, marcas de eixo e a tabela que é o gêmeo acessível de
  todo gráfico. Regras da skill de dataviz: uma série só por gráfico, linha de 2px,
  marcadores de 8px com anel da cor da superfície, grade em linha fina e contínua,
  texto sempre na cor de texto (nunca na cor da série).
*/

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icone } from "@/components/ui/icone";
import { comum } from "@/content/app";

export function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(0);
  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => setLargura(Math.round(entrada.contentRect.width)));
    observador.observe(elemento);
    setLargura(Math.round(elemento.getBoundingClientRect().width));
    return () => observador.disconnect();
  }, []);
  return { ref, largura };
}

export function escalaLinear(dominio: [number, number], faixa: [number, number]) {
  const [d0, d1] = dominio;
  const [r0, r1] = faixa;
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * k;
}

/** Marcas "redondas" do eixo: 0, 2.000, 4.000... */
export function marcasRedondas(maximo: number, quantas = 4): number[] {
  if (maximo <= 0) return [0];
  const passoBruto = maximo / quantas;
  const potencia = 10 ** Math.floor(Math.log10(passoBruto));
  const opcoes = [1, 2, 2.5, 5, 10].map((m) => m * potencia);
  const passo = opcoes.find((o) => o >= passoBruto) ?? opcoes[opcoes.length - 1];
  const marcas: number[] = [];
  for (let v = 0; v <= maximo + passo * 0.001; v += passo) marcas.push(Math.round(v * 1000) / 1000);
  if (marcas[marcas.length - 1] < maximo) marcas.push(marcas[marcas.length - 1] + passo);
  return marcas;
}

/** Valor compacto para o eixo: 1.500 vira "1,5 mil". */
export function compacto(valor: number): string {
  if (Math.abs(valor) >= 1000) {
    const mil = valor / 1000;
    return `${Number.isInteger(mil) ? mil : mil.toFixed(1).replace(".", ",")} mil`;
  }
  return String(Math.round(valor));
}

/** O gêmeo acessível do gráfico: os mesmos números, em tabela, atrás de um botão. */
export function TabelaDoGrafico({ legenda, cabecalhos, linhas }: { legenda: string; cabecalhos: string[]; linhas: ReactNode[][] }) {
  const [aberta, setAberta] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setAberta((a) => !a)}
        aria-expanded={aberta}
        className="inline-flex min-h-11 items-center gap-2 rounded-campo px-2 font-bold text-primaria hover:bg-info-fundo"
      >
        <Icone nome="tabela" tamanho={18} />
        {aberta ? comum.esconderTabela : comum.verTabela}
      </button>
      {aberta && (
        <div className="mt-2 overflow-x-auto rounded-campo border border-borda">
          <table className="w-full min-w-[28rem] border-collapse text-left text-[0.95rem]">
            <caption className="sr-only">{legenda}</caption>
            <thead className="bg-suave">
              <tr>
                {cabecalhos.map((c) => (
                  <th key={c} scope="col" className="px-3 py-2.5 font-bold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, i) => (
                <tr key={i} className="border-t border-borda">
                  {linha.map((celula, j) =>
                    j === 0 ? (
                      <th key={j} scope="row" className="px-3 py-2 font-normal">
                        {celula}
                      </th>
                    ) : (
                      <td key={j} className="numeros-tabulares px-3 py-2">
                        {celula}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Legenda visível: a marca ao lado do texto carrega a identidade, nunca a cor do texto. */
export function Legenda({ itens }: { itens: { rotulo: string; marca: "linha" | "faixa" | "barra" | "fora" }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.9rem] text-tinta-suave">
      {itens.map((item) => (
        <li key={item.rotulo} className="inline-flex items-center gap-2">
          {item.marca === "linha" && <span aria-hidden="true" className="h-0.5 w-5 rounded-full bg-[var(--ct-grafico-serie)]" />}
          {item.marca === "faixa" && <span aria-hidden="true" className="h-3 w-5 rounded-[3px] bg-[var(--ct-grafico-faixa)] ring-1 ring-inset ring-primaria/30" />}
          {item.marca === "barra" && <span aria-hidden="true" className="h-3 w-2 rounded-[2px] bg-[var(--ct-grafico-serie)]" />}
          {item.marca === "fora" && <span aria-hidden="true" className="size-3 rounded-full border-[3px] border-atencao bg-superficie" />}
          {item.rotulo}
        </li>
      ))}
    </ul>
  );
}

/** Caixa de leitura que segue o ponteiro ou o foco do teclado. O valor vem antes do rótulo. */
export function Leitura({ x, largura, children }: { x: number; largura: number; children: ReactNode }) {
  const larguraCaixa = 200;
  const esquerda = Math.min(Math.max(x - larguraCaixa / 2, 0), Math.max(0, largura - larguraCaixa));
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 rounded-campo border border-borda-forte bg-superficie px-3 py-2 text-[0.9rem] shadow-ct-lg"
      style={{ left: esquerda, width: larguraCaixa }}
    >
      {children}
    </div>
  );
}
