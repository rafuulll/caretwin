"use client";

/*
  Hoje: a tela que abre o app. Resolve dois momentos da mesma pessoa:
  - de manhã, ao acordar: como foi a noite e se a pulseira sincronizou;
  - durante o dia: os passos até agora comparados com o normal deste horário, e a bateria.
  Também leva ao momento dos batimentos e avisa quando há alerta novo para quem cuida.
*/

import { useState } from "react";
import Link from "next/link";
import { useDados, usePreferencias, useSessao, sincronizarAgora } from "@/lib/store";
import { alertasNovos, estadoDaPulseira, pessoaAtiva, pulseiraDe, resumoDeHoje, serieDosUltimosDias } from "@/lib/consultas";
import { dataPorExtenso, duracao, numero, plural, tempoDesde } from "@/lib/formato";
import { useAgora } from "@/lib/use-agora";
import { horaDaNoite } from "@/lib/sono";
import { RESUMOS_DO_DIA, type FatosDoDia } from "@/content/ia";
import { hoje as copy, comum, ia, metricas, vazio } from "@/content/app";
import { rotas } from "@/content/site";
import { CabecalhoTela } from "@/components/app/cabecalho-tela";
import { ResumoIA } from "@/components/app/resumo-ia";
import { Botao, LinkBotao } from "@/components/ui/botao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Icone } from "@/components/ui/icone";
import { SeloSituacao } from "@/components/ui/selo";
import { useAnunciar } from "@/components/ui/anunciador";
import { FaixaNormal } from "@/components/graficos/faixa-normal";
import { GraficoTendencia } from "@/components/graficos/tendencia";

export function TelaHoje() {
  const dados = useDados();
  const preferencias = usePreferencias();
  const sessao = useSessao();
  const agora = useAgora();
  const anunciar = useAnunciar();
  const [sincronizando, setSincronizando] = useState(false);

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
  const pulseira = estadoDaPulseira(pulseiraDe(dados, pessoa.id), agora);
  const novos = alertasNovos(dados, pessoa.id);
  const serie = serieDosUltimosDias(dados, pessoa.id, "passos", agora, 14);
  const foraDoNormal = serie.filter((p) => p.situacao === "abaixo" || p.situacao === "acima").length;

  function sincronizar() {
    setSincronizando(true);
    window.setTimeout(() => {
      sincronizarAgora(pessoa!.id);
      setSincronizando(false);
      anunciar(copy.pulseira.sincronizada);
    }, 900);
  }

  const cabecalho = (
    <CabecalhoTela
      sobretitulo={dataPorExtenso(r.hoje)}
      titulo={copy.saudacao(sessao?.nome ?? "", agora.getHours())}
      apoio={copy.apoio(pessoa.comoChamar)}
    />
  );

  if (r.semHistorico) {
    return (
      <>
        {cabecalho}
        <EstadoVazio
          icone="relogio"
          titulo={vazio.semDias.titulo}
          texto={vazio.semDias.texto}
          acao={
            <Botao tamanho="grande" icone="sincronizar" onClick={sincronizar} carregando={sincronizando} textoCarregando={copy.pulseira.sincronizando}>
              {vazio.semDias.botao}
            </Botao>
          }
        />
      </>
    );
  }

  const fatos: FatosDoDia = {
    comoChamar: pessoa.comoChamar,
    passos: r.passos,
    passosBaixo: r.faixaPassosAgora?.baixo ?? null,
    passosAlto: r.faixaPassosAgora?.alto ?? null,
    situacaoPassos: r.situacaoPassos,
    sonoMinutos: r.sono?.minutosDormindo ?? null,
    sonoNormal: r.faixaSono?.mediana ?? null,
    situacaoSono: r.situacaoSono,
    despertares: r.sono?.despertares ?? null,
    ultimoBpm: r.ultimaMedicao?.bpm ?? null,
    alertasNovos: novos,
  };

  return (
    <>
      {cabecalho}

      {novos > 0 && (
        <Link
          href={rotas.alertas}
          className="cartao-clicavel mb-6 flex items-center gap-3 rounded-cartao border border-atencao/40 bg-atencao-fundo px-4 py-3.5 font-bold text-atencao"
        >
          <Icone nome="alertas" />
          <span className="flex-1">{copy.alertas.novos(novos)}</span>
          <span className="inline-flex items-center gap-1">
            {copy.alertas.ver}
            <Icone nome="seta" tamanho={18} />
          </span>
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Passos até agora */}
        <section aria-labelledby="passos-titulo" className="cartao p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="passos-titulo" className="flex items-center gap-2 text-[1.15rem] font-bold">
              <Icone nome="passos" className="text-primaria" />
              {copy.passos.titulo}
            </h2>
            <SeloSituacao situacao={r.situacaoPassos} />
          </div>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[3.25rem] font-bold leading-none tracking-[-0.02em]">{r.passos === null ? "0" : numero(r.passos)}</span>
            <span className="text-lg text-tinta-suave">{metricas.passos.unidade}</span>
          </p>
          {r.faixaPassosAgora && r.passos !== null ? (
            <>
              <FaixaNormal
                className="mt-5"
                valor={r.passos}
                baixo={r.faixaPassosAgora.baixo}
                alto={r.faixaPassosAgora.alto}
                situacao={r.situacaoPassos}
                rotulo={`${copy.passos.legendaGrafico} ${numero(r.passos)} passos; normal entre ${numero(r.faixaPassosAgora.baixo)} e ${numero(r.faixaPassosAgora.alto)}.`}
              />
              <p className="mt-3 font-bold">{copy.passos.faixa(numero(r.faixaPassosAgora.baixo), numero(r.faixaPassosAgora.alto))}</p>
              {r.faixaPassosDia && (
                <p className="mt-1 text-[0.95rem] text-tinta-suave">{copy.passos.faixaDia(numero(r.faixaPassosDia.baixo), numero(r.faixaPassosDia.alto))}</p>
              )}
            </>
          ) : (
            <p className="mt-4 text-tinta-suave">{copy.passos.aprendendo}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-borda pt-4">
            <p className="flex items-center gap-2">
              <Icone nome="atividade" className="text-primaria" />
              <span className="text-tinta-suave">{copy.passos.ativos}:</span>
              <span className="font-bold">{copy.passos.ativosValor(r.minutosAtivos ?? 0)}</span>
            </p>
            <p className="text-[0.9rem] text-tinta-suave">{comum.naoEhDiagnostico}</p>
          </div>
        </section>

        <div className="grid gap-5">
          {/* Pulseira */}
          {pulseira && (
            <section aria-labelledby="pulseira-titulo" className="cartao p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 id="pulseira-titulo" className="flex items-center gap-2 text-[1.05rem] font-bold">
                  <Icone nome="pulseira" className="text-primaria" />
                  {copy.pulseira.codigo(pulseira.codigo)}
                </h2>
                <span className={pulseira.bateriaBaixa ? "inline-flex items-center gap-1.5 font-bold text-atencao" : "inline-flex items-center gap-1.5 font-bold"}>
                  <Icone nome={pulseira.bateriaBaixa ? "bateriaBaixa" : pulseira.bateria > 70 ? "bateriaCheia" : "bateriaMedia"} />
                  {pulseira.bateria}%<span className="sr-only">, {copy.pulseira.bateria(pulseira.bateria)}</span>
                </span>
              </div>
              <p className="mt-3 text-tinta-suave">
                {pulseira.ultimaSincronizacao ? copy.pulseira.sincronizou(tempoDesde(pulseira.ultimaSincronizacao, agora)) : copy.pulseira.nunca}
              </p>
              {(pulseira.dadoAntigo || pulseira.bateriaBaixa) && (
                <ul className="mt-2 space-y-1">
                  {pulseira.dadoAntigo && (
                    <li className="flex items-start gap-2 font-bold text-atencao">
                      <Icone nome="relogio" tamanho={18} className="mt-0.5" />
                      {copy.pulseira.antigo}
                    </li>
                  )}
                  {pulseira.bateriaBaixa && (
                    <li className="flex items-start gap-2 font-bold text-atencao">
                      <Icone nome="bateriaBaixa" tamanho={18} className="mt-0.5" />
                      {copy.pulseira.bateriaBaixa}
                    </li>
                  )}
                </ul>
              )}
              <Botao className="mt-4" variante="secundario" icone="sincronizar" onClick={sincronizar} carregando={sincronizando} textoCarregando={copy.pulseira.sincronizando} larguraTotal>
                {copy.pulseira.sincronizar}
              </Botao>
            </section>
          )}

          {/* Batimentos */}
          <section aria-labelledby="bpm-titulo" className="cartao p-5">
            <h2 id="bpm-titulo" className="flex items-center gap-2 text-[1.05rem] font-bold">
              <Icone nome="batimentos" className="text-primaria" />
              {copy.batimentos.titulo}
            </h2>
            <p className="mt-2">
              {r.ultimaMedicao ? (
                <>
                  <span className="text-[1.75rem] font-bold">{r.ultimaMedicao.bpm}</span>{" "}
                  <span className="text-tinta-suave">{copy.batimentos.ultima(tempoDesde(r.ultimaMedicao.em, agora))}</span>
                </>
              ) : (
                <span className="text-tinta-suave">{copy.batimentos.nenhuma}</span>
              )}
            </p>
            <LinkBotao href={rotas.batimentos} variante="fantasma" iconeDepois="seta" className="-ml-3 mt-2">
              {copy.batimentos.medir}
            </LinkBotao>
          </section>
        </div>

        {/* Noite */}
        <section aria-labelledby="noite-titulo" className="cartao p-5 sm:p-6 lg:col-span-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="noite-titulo" className="flex items-center gap-2 text-[1.15rem] font-bold">
              <Icone nome="sono" className="text-primaria" />
              {copy.noite.titulo}
            </h2>
            {r.sono && <SeloSituacao situacao={r.situacaoSono} />}
          </div>
          {r.sono ? (
            <>
              <p className="mt-3 text-tinta-suave">{copy.noite.dormiu}</p>
              <p className="text-[2.4rem] font-bold leading-tight tracking-[-0.015em]">{duracao(r.sono.minutosDormindo)}</p>
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-center gap-2">
                  <Icone nome="relogio" tamanho={18} className="text-tinta-suave" />
                  {copy.noite.janela(horaDaNoite(r.sono.inicio), horaDaNoite(r.sono.fim))}
                </li>
                <li className="flex items-center gap-2">
                  <Icone nome="cama" tamanho={18} className="text-tinta-suave" />
                  {copy.noite.despertares(r.sono.despertares)}
                </li>
                {r.faixaSono && (
                  <li className="flex items-center gap-2 text-tinta-suave">
                    <Icone nome="calendario" tamanho={18} />
                    {copy.noite.costume(`de ${duracao(r.faixaSono.baixo)} a ${duracao(r.faixaSono.alto)}`)}
                  </li>
                )}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-tinta-suave">{r.dia?.noite ? copy.noite.emAndamento : copy.noite.semNoite}</p>
          )}
          <LinkBotao href={rotas.sono} variante="fantasma" iconeDepois="seta" className="-ml-3 mt-3">
            {copy.noite.verNoite}
          </LinkBotao>
        </section>

        <div className="lg:row-span-1">
          <ResumoIA titulo={ia.titulo} fatos={fatos} modelos={RESUMOS_DO_DIA} />
        </div>

        {/* Últimos 14 dias */}
        <section aria-labelledby="tendencia-titulo" className="cartao p-5 sm:p-6 lg:col-span-2">
          <h2 id="tendencia-titulo" className="text-[1.15rem] font-bold">
            {copy.tendencia.titulo}
          </h2>
          <p className="mt-1 text-tinta-suave">{copy.tendencia.apoio}</p>
          <div className="mt-4">
            <GraficoTendencia
              pontos={serie}
              formatar={(v) => plural(v, "passo", "passos")}
              rotulo={copy.tendencia.titulo}
              resumo={copy.tendencia.resumoLeitor(foraDoNormal)}
              legendaSerie={copy.tendencia.legendaSerie}
              legendaFaixa={copy.tendencia.legendaFaixa}
              legendaFora={comum.foraDoNormal}
              cabecalhosTabela={[copy.tendencia.tabela.data, copy.tendencia.tabela.valor, copy.tendencia.tabela.faixa, copy.tendencia.tabela.situacao]}
              instrucoes={comum.instrucoesGrafico}
              semDado={comum.semDados}
            />
          </div>
        </section>
      </div>
    </>
  );
}
