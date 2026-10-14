"use client";

/*
  Sono: o detalhe do momento da manhã. Mostra a noite escolhida minuto a minuto, quando a
  pessoa provavelmente pegou no sono e acordou, e compara com o costume dela.
*/

import { useState } from "react";
import { useDados, usePreferencias } from "@/lib/store";
import { noitesDe, pessoaAtiva, serieDosUltimosDias } from "@/lib/consultas";
import { diasPorData, faixaNormal, situacao } from "@/lib/normal";
import { estimarSono, horaDaNoite } from "@/lib/sono";
import { dataPorExtenso, diaEMes, diaDaSemana, duracao, duracaoFalada, numero } from "@/lib/formato";
import { useAgora } from "@/lib/use-agora";
import { sono as copy, comum, vazio } from "@/content/app";
import { rotas } from "@/content/site";
import { CabecalhoTela } from "@/components/app/cabecalho-tela";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { LinkBotao } from "@/components/ui/botao";
import { Icone, type NomeIcone } from "@/components/ui/icone";
import { SeloSituacao } from "@/components/ui/selo";
import { GraficoNoite } from "@/components/graficos/noite";
import { GraficoTendencia } from "@/components/graficos/tendencia";

function Numero({ icone, rotulo, valor, detalhe }: { icone: NomeIcone; rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-cartao border border-borda bg-superficie p-4">
      <dt className="flex items-center gap-2 text-[0.95rem] text-tinta-suave">
        <Icone nome={icone} tamanho={18} />
        {rotulo}
      </dt>
      <dd className="mt-1 text-[1.6rem] font-bold leading-tight">{valor}</dd>
      {detalhe && <dd className="mt-0.5 text-[0.9rem] text-tinta-suave">{detalhe}</dd>}
    </div>
  );
}

export function TelaSono() {
  const dados = useDados();
  const preferencias = usePreferencias();
  const agora = useAgora();
  const [indice, setIndice] = useState(0);

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

  const noites = noitesDe(dados, pessoa.id);
  if (noites.length === 0) {
    return (
      <>
        <CabecalhoTela titulo={copy.titulo} apoio={copy.apoio} />
        <EstadoVazio icone="sono" titulo={copy.semNoites.titulo} texto={copy.semNoites.texto} />
      </>
    );
  }

  const atual = Math.min(indice, noites.length - 1);
  const dia = noites[atual];
  const estimativa = dia.noite ? estimarSono(dia.noite.contagens) : null;
  const porData = diasPorData(dados.dias, pessoa.id);
  const faixa = faixaNormal(porData, "sono", dia.data);
  const sit = situacao(estimativa ? estimativa.minutosDormindo : null, faixa);
  const serie = serieDosUltimosDias(dados, pessoa.id, "sono", agora, 14);

  const resumo = estimativa
    ? copy.grafico.resumoLeitor(horaDaNoite(estimativa.inicio), horaDaNoite(estimativa.fim), duracaoFalada(estimativa.minutosDormindo), estimativa.despertares)
    : copy.emAndamento;

  return (
    <>
      <CabecalhoTela titulo={copy.titulo} apoio={copy.apoio} sobretitulo={pessoa.comoChamar} />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setIndice(Math.min(noites.length - 1, atual + 1))}
          disabled={atual >= noites.length - 1}
          className="flex size-12 items-center justify-center rounded-campo border border-borda-campo bg-superficie hover:bg-suave disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={copy.anterior}
        >
          <Icone nome="anterior" />
        </button>
        <label className="relative min-w-0 flex-1 sm:flex-none">
          <span className="sr-only">{copy.escolherNoite}</span>
          <select
            value={atual}
            onChange={(e) => setIndice(Number(e.target.value))}
            className="min-h-12 w-full appearance-none rounded-campo border border-borda-campo bg-superficie py-2 pl-4 pr-10 font-bold text-tinta sm:w-auto"
          >
            {noites.map((n, i) => (
              <option key={n.data} value={i}>
                {copy.noiteDe(`${diaDaSemana(n.data)}, ${diaEMes(n.data)}`)}
              </option>
            ))}
          </select>
          <Icone nome="abrir" tamanho={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tinta-suave" />
        </label>
        <button
          type="button"
          onClick={() => setIndice(Math.max(0, atual - 1))}
          disabled={atual === 0}
          className="flex size-12 items-center justify-center rounded-campo border border-borda-campo bg-superficie hover:bg-suave disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={copy.proxima}
        >
          <Icone nome="proximo" />
        </button>
      </div>

      <section aria-labelledby="noite-escolhida" className="cartao p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="noite-escolhida" className="text-[1.15rem] font-bold">
            {copy.noiteDe(dataPorExtenso(dia.data).toLowerCase())}
          </h2>
          {estimativa && <SeloSituacao situacao={sit} />}
        </div>

        {estimativa ? (
          <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Numero
              icone="sono"
              rotulo={copy.dormiu}
              valor={duracao(estimativa.minutosDormindo)}
              detalhe={faixa ? `${copy.costume}: ${copy.costumeValor(duracao(faixa.baixo), duracao(faixa.alto))}` : undefined}
            />
            <Numero icone="cama" rotulo={copy.foiDormir} valor={horaDaNoite(estimativa.inicio)} />
            <Numero icone="relogio" rotulo={copy.acordou} valor={horaDaNoite(estimativa.fim)} />
            <Numero icone="atividade" rotulo={copy.despertares} valor={numero(estimativa.despertares)} />
          </dl>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-tinta-suave">
            <Icone nome="relogio" />
            {copy.emAndamento}
          </p>
        )}

        {dia.noite && (
          <div className="mt-8">
            <h3 className="font-bold">{copy.grafico.titulo}</h3>
            <p className="mt-1 text-[0.95rem] text-tinta-suave">{copy.grafico.apoio}</p>
            <div className="mt-3">
              <GraficoNoite
                contagens={dia.noite.contagens}
                sono={estimativa}
                rotulo={copy.grafico.titulo}
                resumo={resumo}
                legendaMovimento={copy.grafico.legendaMovimento}
                legendaSono={copy.grafico.legendaSono}
                instrucoes={comum.instrucoesGrafico}
                semDado={copy.grafico.semDado}
                cabecalhosTabela={[copy.grafico.tabela.hora, copy.grafico.tabela.movimento]}
                formatarMovimento={copy.grafico.movimento}
              />
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="semana-sono" className="cartao mt-5 p-5 sm:p-6">
        <h2 id="semana-sono" className="text-[1.15rem] font-bold">
          {copy.semana.titulo}
        </h2>
        <div className="mt-4">
          <GraficoTendencia
            pontos={serie}
            formatar={(v) => duracao(v)}
            formatarEixo={(v) => `${Math.round(v / 60)} h`}
            marcasEixo={[0, 120, 240, 360, 480, 600, 720]}
            rotulo={copy.semana.titulo}
            resumo={copy.semana.resumo(serie.filter((p) => p.situacao === "abaixo").length)}
            legendaSerie={copy.semana.legendaSerie}
            legendaFaixa={copy.costume}
            legendaFora={comum.foraDoNormal}
            cabecalhosTabela={[copy.semana.tabela.data, copy.semana.tabela.valor, copy.semana.tabela.faixa, copy.semana.tabela.situacao]}
            instrucoes={comum.instrucoesGrafico}
            semDado={comum.semDados}
            altura={230}
          />
        </div>
      </section>

      <details className="cartao group mt-5 p-5 sm:p-6">
        <summary className="flex min-h-11 list-none items-center justify-between gap-3 font-bold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Icone nome="ajuda" className="text-primaria" />
            {copy.como.titulo}
          </span>
          <Icone nome="abrir" className="transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <p className="mt-3 max-w-3xl leading-relaxed text-tinta-suave">{copy.como.texto}</p>
      </details>
    </>
  );
}
