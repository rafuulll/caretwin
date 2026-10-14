"use client";

/*
  Resumo escrito pela "IA". Nesta versão o texto vem de modelos escritos à mão em
  src/content/ia.ts, montados com os números reais do dia e sorteados sem repetir.
  O aviso logo abaixo diz isso com todas as letras, e o "Como ligar" explica o caminho
  para a IA local de verdade.
*/

import { useRef, useState } from "react";
import type { FatosDoDia } from "@/content/ia";
import { ia, comum } from "@/content/app";
import { Botao } from "@/components/ui/botao";
import { Dialogo } from "@/components/ui/dialogo";
import { Icone } from "@/components/ui/icone";

type Props = {
  titulo: string;
  fatos: FatosDoDia;
  modelos: ((f: FatosDoDia) => string)[];
};

function embaralhar(n: number): number[] {
  const ordem = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  return ordem;
}

export function ResumoIA({ titulo, fatos, modelos }: Props) {
  const [indice, setIndice] = useState<number | null>(null);
  const [escrevendo, setEscrevendo] = useState(false);
  const [comoAberto, setComoAberto] = useState(false);
  const fila = useRef<number[]>([]);

  function escrever() {
    if (fila.current.length === 0) fila.current = embaralhar(modelos.length).filter((i) => i !== indice);
    const proximo = fila.current.shift() ?? 0;
    setEscrevendo(true);
    window.setTimeout(() => {
      setIndice(proximo);
      setEscrevendo(false);
    }, 700);
  }

  const texto = indice !== null ? modelos[indice](fatos).replace(/\s+/g, " ").trim() : null;

  return (
    <section aria-labelledby="resumo-ia-titulo" className="rounded-cartao border border-borda bg-info-fundo/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="resumo-ia-titulo" className="flex items-center gap-2 text-[1.15rem] font-bold">
          <Icone nome="ia" className="text-info" />
          {titulo}
        </h2>
      </div>

      <div aria-live="polite" aria-busy={escrevendo} className="mt-3 min-h-[3.5rem]">
        {escrevendo ? (
          <div className="space-y-2" aria-hidden="true">
            <div className="esqueleto h-4 w-full" />
            <div className="esqueleto h-4 w-11/12" />
            <div className="esqueleto h-4 w-2/3" />
          </div>
        ) : texto ? (
          <p className="text-[1.05rem] leading-relaxed">{texto}</p>
        ) : (
          <p className="text-tinta-suave">{ia.vazio}</p>
        )}
        {escrevendo && <span className="sr-only">{ia.gerando}</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Botao variante={texto ? "secundario" : "primario"} icone={texto ? "sincronizar" : "ia"} onClick={escrever} carregando={escrevendo} textoCarregando={ia.gerando}>
          {texto ? ia.gerarDeNovo : ia.gerar}
        </Botao>
      </div>

      {texto && (
        <p className="mt-4 flex flex-wrap items-start gap-x-2 gap-y-1 text-[0.92rem] text-tinta-suave">
          <Icone nome="info" tamanho={17} className="mt-0.5" />
          <span className="flex-1">{ia.aviso}</span>
          <button type="button" onClick={() => setComoAberto(true)} className="min-h-11 font-bold text-primaria underline underline-offset-4 sm:min-h-0">
            {ia.como}
          </button>
        </p>
      )}

      <Dialogo aberto={comoAberto} aoFechar={() => setComoAberto(false)} titulo={ia.modal.titulo} descricao={ia.modal.intro} rotuloFechar={comum.fechar} rodape={<Botao onClick={() => setComoAberto(false)}>{comum.fechar}</Botao>}>
        <ol className="list-decimal space-y-3 pl-5">
          {ia.modal.passos.map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
        </ol>
        <div className="mt-5 rounded-campo border border-borda-forte bg-suave p-4">
          <p className="flex items-center gap-2 font-bold">
            <Icone nome="seguro" className="text-primaria" />
            {ia.modal.regraTitulo}
          </p>
          <p className="mt-1.5 text-tinta-suave">{ia.modal.regra}</p>
        </div>
      </Dialogo>
    </section>
  );
}
