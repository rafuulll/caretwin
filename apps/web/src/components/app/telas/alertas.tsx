"use client";

/*
  Alertas: o momento de quem cuida, à noite. Primeiro um resumo curto do dia, depois
  cada mudança explicada em palavras simples, numa linha do tempo agrupada por dia.
  Alerta tem dois estados (novo e lido), então ele é um botão de marcar e não um quadro.
*/

import { marcarAlerta, marcarTodosComoLidos, useDados, usePreferencias } from "@/lib/store";
import { alertasDe, alertasNovos, pessoaAtiva, resumoDeHoje } from "@/lib/consultas";
import { dataPorExtenso, somarDias } from "@/lib/formato";
import { useAgora } from "@/lib/use-agora";
import type { Metrica } from "@/lib/modelo";
import type { Alerta } from "@/lib/types";
import { RESUMOS_PARA_QUEM_CUIDA, type FatosDoDia } from "@/content/ia";
import { alertas as copy, comum, ia, vazio } from "@/content/app";
import { rotas } from "@/content/site";
import { CabecalhoTela } from "@/components/app/cabecalho-tela";
import { ResumoIA } from "@/components/app/resumo-ia";
import { Botao, LinkBotao } from "@/components/ui/botao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Icone, type NomeIcone } from "@/components/ui/icone";
import { Selo } from "@/components/ui/selo";
import { useAnunciar } from "@/components/ui/anunciador";
import { cn } from "@/lib/cn";

const ICONE_DA_METRICA: Record<Metrica, NomeIcone> = {
  passos: "passos",
  atividade: "atividade",
  sono: "sono",
  batimentos: "batimentos",
};

function agrupar(lista: Alerta[]): [string, Alerta[]][] {
  const grupos = new Map<string, Alerta[]>();
  for (const alerta of lista) grupos.set(alerta.data, [...(grupos.get(alerta.data) ?? []), alerta]);
  return [...grupos.entries()].sort(([a], [b]) => b.localeCompare(a));
}

export function TelaAlertas() {
  const dados = useDados();
  const preferencias = usePreferencias();
  const agora = useAgora();
  const anunciar = useAnunciar();

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

  const lista = alertasDe(dados, pessoa.id);
  const novos = alertasNovos(dados, pessoa.id);
  const r = resumoDeHoje(dados, pessoa.id, agora);
  const hoje = r.hoje;
  const pessoaId = pessoa.id;

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

  function rotuloDoDia(data: string) {
    if (data === hoje) return comum.hoje;
    if (data === somarDias(hoje, -1)) return comum.ontem;
    return dataPorExtenso(data);
  }

  return (
    <>
      <CabecalhoTela
        sobretitulo={pessoa.comoChamar}
        titulo={copy.titulo}
        apoio={copy.apoio}
        acoes={
          novos > 0 ? (
            <Botao
              variante="secundario"
              icone="ok"
              onClick={() => {
                marcarTodosComoLidos(pessoaId);
                anunciar(copy.anunciarTodos);
              }}
            >
              {copy.marcarTodos}
            </Botao>
          ) : undefined
        }
      />

      <ResumoIA titulo={ia.tituloQuemCuida} fatos={fatos} modelos={RESUMOS_PARA_QUEM_CUIDA} />

      <div className="mt-8 flex items-center gap-3">
        <h2 className="text-[1.3rem] font-bold">{copy.novos(novos)}</h2>
      </div>

      {lista.length === 0 ? (
        <div className="mt-4">
          <EstadoVazio icone="dentro" titulo={copy.vazio.titulo} texto={copy.vazio.texto} />
        </div>
      ) : (
        <ol className="mt-4 space-y-8">
          {agrupar(lista).map(([data, doDia]) => (
            <li key={data}>
              <h3 className="mb-3 flex items-center gap-2 font-bold text-tinta-suave">
                <Icone nome="calendario" tamanho={18} />
                <time dateTime={data}>{rotuloDoDia(data)}</time>
              </h3>
              <ul className="space-y-3">
                {doDia.map((alerta) => (
                  <li key={alerta.id}>
                    <article
                      className={cn(
                        "cartao relative overflow-hidden p-5",
                        !alerta.lido && "border-atencao/40",
                      )}
                      aria-labelledby={`alerta-${alerta.id}`}
                    >
                      {!alerta.lido && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-atencao" />}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h4 id={`alerta-${alerta.id}`} className="flex items-center gap-2 text-[1.1rem] font-bold">
                          <Icone nome={ICONE_DA_METRICA[alerta.metrica]} className="text-primaria" />
                          {copy.titulos[alerta.metrica][alerta.direcao]}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {!alerta.lido && (
                            <Selo tom="atencao" icone="alertas">
                              {copy.novo}
                            </Selo>
                          )}
                          <Selo tom={alerta.direcao === "abaixo" ? "atencao" : "info"} icone={alerta.direcao === "abaixo" ? "abaixo" : "acima"}>
                            {copy.desvio(alerta.desvio, alerta.direcao)}
                          </Selo>
                        </div>
                      </div>
                      <p className="mt-2 max-w-3xl leading-relaxed">{alerta.texto}</p>
                      <div className="mt-3">
                        <Botao
                          variante="fantasma"
                          tamanho="pequeno"
                          icone={alerta.lido ? "restaurar" : "ok"}
                          className="-ml-3"
                          onClick={() => {
                            marcarAlerta(alerta.id, !alerta.lido);
                            anunciar(alerta.lido ? copy.anunciarNovo : copy.anunciarLido);
                          }}
                        >
                          {alerta.lido ? copy.marcarNovo : copy.marcarLido}
                        </Botao>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
