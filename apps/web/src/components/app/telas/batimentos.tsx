"use client";

/*
  Batimentos: o momento "quando quiser". A pessoa pede uma medição, fica parada alguns
  segundos e vê o valor ao lado da faixa de costume dela. A medição fica guardada no dia.
  Nesta versão o valor é simulado pelo app; com a pulseira conectada, vem do MAX30102.
*/

import { useEffect, useRef, useState } from "react";
import { registrarMedicao, useDados, usePreferencias } from "@/lib/store";
import { medicoesDe, pessoaAtiva, resumoDeHoje } from "@/lib/consultas";
import { situacao } from "@/lib/normal";
import { SEGUNDOS_MEDICAO } from "@/lib/modelo";
import { useAgora } from "@/lib/use-agora";
import { batimentos as copy, comum, situacoes, vazio } from "@/content/app";
import { rotas } from "@/content/site";
import { CabecalhoTela } from "@/components/app/cabecalho-tela";
import { Botao, LinkBotao } from "@/components/ui/botao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Icone } from "@/components/ui/icone";
import { SeloSituacao } from "@/components/ui/selo";
import { useAnunciar } from "@/components/ui/anunciador";
import { GraficoBatimentos } from "@/components/graficos/batimentos";

type Estado = { fase: "pronto" } | { fase: "medindo"; restante: number } | { fase: "resultado"; bpm: number };

export function TelaBatimentos() {
  const dados = useDados();
  const preferencias = usePreferencias();
  const agora = useAgora();
  const anunciar = useAnunciar();
  const [estado, setEstado] = useState<Estado>({ fase: "pronto" });
  const timer = useRef<number | null>(null);
  const refResultado = useRef<HTMLParagraphElement>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  if (!dados || !agora) return null;
  const pessoa = pessoaAtiva(dados, preferencias);
  if (!pessoa) {
    return (
      <EstadoVazio
        icone="pulseira"
        titulo={vazio.semPessoas.titulo}
        texto={vazio.semPessoas.texto}
        acao={
          <LinkBotao href={rotas.primeiroUso} tamanho="grande" icone="mais">
            {vazio.semPessoas.botao}
          </LinkBotao>
        }
      />
    );
  }

  const r = resumoDeHoje(dados, pessoa.id, agora);
  const faixa = r.faixaBatimentos;
  const medicoes = medicoesDe(dados, pessoa.id);
  const pessoaId = pessoa.id;

  function comecar() {
    setEstado({ fase: "medindo", restante: SEGUNDOS_MEDICAO });
    let restante = SEGUNDOS_MEDICAO;
    timer.current = window.setInterval(() => {
      restante -= 1;
      if (restante > 0) {
        setEstado({ fase: "medindo", restante });
        return;
      }
      if (timer.current) window.clearInterval(timer.current);
      const base = faixa?.mediana ?? 70;
      const bpm = Math.round(base + (Math.random() - 0.5) * 8);
      registrarMedicao(pessoaId, bpm);
      setEstado({ fase: "resultado", bpm });
      anunciar(`${copy.medir.resultado(bpm)}. ${copy.medir.guardado}`);
      requestAnimationFrame(() => refResultado.current?.focus());
    }, 1000);
  }

  function cancelar() {
    if (timer.current) window.clearInterval(timer.current);
    setEstado({ fase: "pronto" });
  }

  const sitResultado = estado.fase === "resultado" ? situacao(estado.bpm, faixa) : null;

  return (
    <>
      <CabecalhoTela titulo={copy.titulo} apoio={copy.apoio} sobretitulo={pessoa.comoChamar} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="medir-titulo" className="cartao flex flex-col p-5 sm:p-6">
          <h2 id="medir-titulo" className="flex items-center gap-2 text-[1.15rem] font-bold">
            <Icone nome="batimentos" className="text-primaria" />
            {copy.medir.titulo}
          </h2>

          <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-cartao bg-suave px-4 py-8 text-center">
            {estado.fase === "pronto" && (
              <>
                <span className="flex size-20 items-center justify-center rounded-full bg-superficie text-primaria shadow-ct-sm">
                  <Icone nome="batimentos" tamanho={38} />
                </span>
                <p className="mt-5 max-w-xs">{copy.medir.instrucao}</p>
                <Botao className="mt-6" tamanho="grande" icone="batimentos" onClick={comecar}>
                  {copy.medir.botao}
                </Botao>
              </>
            )}

            {estado.fase === "medindo" && (
              <>
                <span className="relative flex size-20 items-center justify-center rounded-full bg-superficie text-primaria shadow-ct-sm">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primaria/15 motion-reduce:hidden" aria-hidden="true" />
                  <Icone nome="batimentos" tamanho={38} />
                </span>
                <p className="mt-5 font-bold" role="status">
                  {copy.medir.medindo}
                </p>
                <p className="mt-1 text-tinta-suave numeros-tabulares">{copy.medir.restante(estado.restante)}</p>
                <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-superficie" aria-hidden="true">
                  <div
                    className="h-full origin-left rounded-full bg-primaria"
                    style={{ animation: `ct-progresso ${SEGUNDOS_MEDICAO}s linear forwards` }}
                  />
                </div>
                <Botao className="mt-6" variante="suave" icone="fechar" onClick={cancelar}>
                  {copy.medir.cancelar}
                </Botao>
              </>
            )}

            {estado.fase === "resultado" && sitResultado && (
              <>
                <p ref={refResultado} tabIndex={-1} className="focus:outline-none">
                  <span className="block text-[3.5rem] font-bold leading-none tracking-[-0.02em]">{estado.bpm}</span>
                  <span className="mt-1 block text-tinta-suave">{copy.medir.unidade}</span>
                </p>
                <SeloSituacao situacao={sitResultado} className="mt-4" />
                <p className="mt-3 flex items-center gap-2 font-bold text-bom">
                  <Icone nome="ok" tamanho={18} />
                  {copy.medir.guardado}
                </p>
                <Botao className="mt-6" variante="secundario" icone="restaurar" onClick={comecar}>
                  {copy.medir.novamente}
                </Botao>
              </>
            )}
          </div>

          <p className="mt-4 text-[0.95rem] text-tinta-suave">
            {faixa ? copy.faixa(Math.round(faixa.baixo), Math.round(faixa.alto)) : copy.semFaixa}
          </p>
          <p className="mt-2 flex items-start gap-2 text-[0.9rem] text-tinta-suave">
            <Icone nome="info" tamanho={17} className="mt-0.5" />
            {copy.medir.simulada}
          </p>
        </section>

        <section aria-labelledby="historico-titulo" className="cartao p-5 sm:p-6">
          <h2 id="historico-titulo" className="text-[1.15rem] font-bold">
            {copy.historico.titulo}
          </h2>
          <p className="mt-1 text-tinta-suave">{copy.historico.apoio}</p>
          {medicoes.length === 0 ? (
            <p className="mt-6 text-tinta-suave">{copy.historico.vazio}</p>
          ) : (
            <div className="mt-4">
              <GraficoBatimentos
                medicoes={medicoes}
                faixa={faixa}
                hoje={r.hoje}
                rotulo={copy.historico.titulo}
                resumo={faixa ? copy.faixa(Math.round(faixa.baixo), Math.round(faixa.alto)) : copy.semFaixa}
                legendaSerie={copy.historico.legendaSerie}
                legendaFaixa={copy.historico.legendaFaixa}
                legendaFora={comum.foraDoNormal}
                instrucoes={comum.instrucoesGrafico}
                cabecalhosTabela={[copy.historico.tabela.quando, copy.historico.tabela.valor, copy.historico.tabela.situacao]}
                situacaoDe={(bpm) => situacoes[situacao(bpm, faixa)].rotulo}
              />
            </div>
          )}
        </section>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-cartao border border-borda bg-superficie p-4 text-tinta-suave">
        <Icone nome="seguro" className="mt-0.5 text-primaria" />
        {copy.aviso}
      </p>
    </>
  );
}
