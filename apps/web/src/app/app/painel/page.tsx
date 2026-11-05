"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ArrowRight,
  ArrowUpRight,
  MoonStar,
  Footprints,
  Bell,
} from "lucide-react";
import {
  AindaAprendendo,
  EstadoDaPessoa,
} from "@/components/app/estado-da-pessoa";
import { EstadoDaPulseiraCartao } from "@/components/app/estado-da-pulseira";
import { GraficoDias } from "@/components/app/graficos/grafico-dias";
import { PassosDeHojeCartao } from "@/components/app/painel/passos-de-hoje";
import { SeletorPessoa } from "@/components/app/seletor-pessoa";
import { redesign, sistema } from "@/content/site";
import { useAgora } from "@/lib/agora";
import {
  alertasDe,
  estadoDaPulseira,
  noiteMaisRecente,
  passosDeHoje,
  pulseiraDe,
  ultimosDias,
} from "@/lib/consultas";
import {
  dataPorExtenso,
  duracao,
  numero,
  paraISO,
  preencher,
} from "@/lib/formato";
import { useConta, useDados, usePessoaNaTela } from "@/lib/store";

export default function PaginaPainel() {
  const { dados } = useDados();
  const pessoa = usePessoaNaTela();
  const conta = useConta();
  const agora = useAgora();
  const [dias, setDias] = useState(7);
  const [metrica, setMetrica] = useState<"passos" | "sono">("passos");
  if (!agora) return null;
  const propria = pessoa
    ? conta?.vinculos[pessoa.id]?.papel === "acompanhada"
    : false;
  return (
    <>
      <div className="ct-section-heading">
        <div>
          <h1>
            {pessoa && !propria && conta
              ? preencher(redesign.titleOther, { nome: pessoa.nome })
              : redesign.title}
          </h1>
          <p>
            <CalendarDays aria-hidden="true" />
            {dataPorExtenso(paraISO(agora))}
          </p>
        </div>
        <SeletorPessoa />
      </div>
      <EstadoDaPessoa pessoa={pessoa}>
        {(p) => {
          const estado = estadoDaPulseira(pulseiraDe(dados, p.id), agora);
          const noite = noiteMaisRecente(dados, p.id, agora);
          const alertas = alertasDe(dados, p.id);
          const novos = alertas.filter((a) => !a.lido);
          const recente = novos[0] ?? alertas[0];
          return (
            <div className="ct-overview">
              <AindaAprendendo pessoa={p} />
              <div className="ct-summary-grid">
                <PassosDeHojeCartao dados={passosDeHoje(dados, p.id, agora)} />
                <div className="ct-summary-side">
                  <Link className="ct-summary-night" href="/app/sono">
                    <span>
                      <MoonStar aria-hidden="true" />
                      {redesign.lastNight}
                      <ArrowRight
                        className="ct-metric-arrow"
                        aria-hidden="true"
                      />
                    </span>
                    <strong>
                      {noite
                        ? duracao(noite.sono.minutosDormindo)
                        : sistema.comum.semDado}
                    </strong>
                    <small>
                      {noite ? redesign.sleepEstimate : redesign.noNight}
                    </small>
                  </Link>
                  {estado && (
                    <EstadoDaPulseiraCartao
                      estado={estado}
                      agora={agora}
                      className={
                        estado.atrasada || estado.bateriaBaixa
                          ? "ct-device-summary ct-device-attention"
                          : "ct-device-summary"
                      }
                    />
                  )}
                </div>
              </div>
              <div className="ct-data-grid">
                <section
                  className="ct-chart"
                  aria-labelledby="historico-titulo"
                >
                  <div className="ct-chart-heading">
                    <h2 id="historico-titulo">{redesign.history}</h2>
                    <div
                      className="ct-chart-filter"
                      role="group"
                      aria-label={redesign.historyLabel}
                    >
                      {[7, 14].map((n) => (
                        <button
                          type="button"
                          key={n}
                          aria-pressed={dias === n}
                          onClick={() => setDias(n)}
                        >
                          {n === 7 ? redesign.sevenDays : redesign.fourteenDays}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    className="ct-chart-metrics"
                    role="group"
                    aria-label={redesign.historyMetric}
                  >
                    <button
                      type="button"
                      aria-pressed={metrica === "passos"}
                      onClick={() => setMetrica("passos")}
                    >
                      <Footprints aria-hidden="true" />
                      {redesign.historySteps}
                    </button>
                    <button
                      type="button"
                      aria-pressed={metrica === "sono"}
                      onClick={() => setMetrica("sono")}
                    >
                      <MoonStar aria-hidden="true" />
                      {redesign.historySleep}
                    </button>
                  </div>
                  <GraficoDias
                    pontos={ultimosDias(dados, p.id, metrica, agora, dias)}
                    rotulo={
                      metrica === "passos"
                        ? sistema.painel.grafico.rotulo
                        : sistema.sono.historico.rotulo
                    }
                    formatar={
                      metrica === "passos"
                        ? (v) =>
                            numero(v) + " " + sistema.metricas.passos.unidade
                        : duracao
                    }
                    formatarEixo={
                      metrica === "passos"
                        ? (v) =>
                            v >= 1000
                              ? numero(v / 1000) + " " + sistema.comum.mil
                              : numero(v)
                        : (v) => Math.round(v / 60) + " " + redesign.hours
                    }
                    passoDoEixo={metrica === "sono" ? 120 : undefined}
                    semValorHoje={
                      metrica === "passos"
                        ? sistema.painel.grafico.hojeParcial
                        : sistema.sono.noite.chegando
                    }
                    acimaEhBom={metrica === "passos"}
                  />
                </section>
                <section className="ct-changes">
                  <div className="ct-changes-top">
                    <Bell aria-hidden="true" />
                    <span>
                      {novos.length === 1
                        ? redesign.oneNewChange
                        : novos.length
                          ? preencher(redesign.newChanges, { n: novos.length })
                          : redesign.noNewChanges}
                    </span>
                  </div>
                  <h2>{recente ? redesign.changes : redesign.noChanges}</h2>
                  <p>{recente?.texto ?? redesign.noChangesBody}</p>
                  <Link href="/app/alertas">
                    {redesign.viewChanges}
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </section>
              </div>
              <aside className="ct-context">
                <Image
                  sizes="74px"
                  src="/brand/ritmo-guia.webp"
                  width="1276"
                  height="1276"
                  alt=""
                />
                <div>
                  <h2>{redesign.brandTitle}</h2>
                  <p>{redesign.brandBody}</p>
                </div>
                <Link href="/como-usar">
                  {redesign.brandLink}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </aside>
            </div>
          );
        }}
      </EstadoDaPessoa>
    </>
  );
}
