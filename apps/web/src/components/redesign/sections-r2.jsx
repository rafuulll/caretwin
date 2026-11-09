"use client";
import Image from "next/image";
import Link from "next/link";
import { redesignCopy } from "@/content/site";
import React, { useEffect, useId, useRef, useState } from "react";
import {
  animate,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./components/ui";
import { Arrow, ScrollHeading, SegmentedTabs } from "./interaction";
import { RoutineScene } from "./routine-scene";
import { PhoneScene } from "./phone-scene";

const A = "/brand/";
const ease = [0.16, 1, 0.3, 1];
const historyRoute = "M55 184V203Q55 214 66 214H350Q361 214 361 203";
const compareRoute = "H408Q420 195 420 183V174";
function BrandIcon({ name, size = 24 }) {
  return (
    <Image
      sizes={size + "px"}
      className="brand-icon"
      src={`${A}brand/icon-${name}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
    />
  );
}

const moments = {
  dia: {
    title: redesignCopy.um_passeio_tambem_conta,
    text: redesignCopy.a_ida_a_feira_a_volta_no_quarteirao_os_passos_pela_casa_a_pu,
    detail: redesignCopy.passos_no_contexto_da_sua_rotina,
    icon: "movement",
  },
  noite: {
    title: redesignCopy.a_noite_tambem_conta_uma_historia,
    text: redesignCopy.enquanto_voce_descansa_os_movimentos_registrados_pela_pulsei,
    detail: redesignCopy.sono_estimado_a_partir_do_movimento,
    icon: "sleep",
  },
};
export function DayNight() {
  const [period, setPeriod] = useState("dia");
  return (
    <section className="day-section section-pad" id="como-funciona">
      <div className="wrap">
        <div className="section-intro">
          <ScrollHeading
            lines={[
              redesignCopy.o_dia_tem_movimento,
              redesignCopy.a_noite_outro_ritmo,
            ]}
          />
          <p>
            {
              redesignCopy.o_caretwin_acompanha_os_dois_e_ajuda_voce_a_olhar_para_cada_
            }
          </p>
        </div>
        <Tabs value={period} onValueChange={setPeriod} className="day-tabs">
          <SegmentedTabs
            value={period}
            onValueChange={setPeriod}
            label={redesignCopy.explorar_momentos_da_rotina}
            items={[
              {
                value: "dia",
                label: redesignCopy.durante_o_dia,
                icon: <BrandIcon name="movement" size={21} />,
              },
              {
                value: "noite",
                label: redesignCopy.durante_a_noite,
                icon: <BrandIcon name="sleep" size={21} />,
              },
            ]}
          />
          <div className="day-composition">
            <svg className="routine-squiggle" viewBox="0 0 640 420" fill="none" aria-hidden="true" focusable="false">
              <path d="M18 330C95 395 190 396 226 342C270 276 162 250 158 310C153 390 371 408 450 346C538 277 493 141 623 91" />
            </svg>
            <div className="day-text">
              {Object.entries(moments).map(([key, data]) => (
                <TabsContent
                  value={key}
                  key={key}
                  forceMount
                  aria-hidden={key !== period}
                  tabIndex={key === period ? 0 : -1}
                >
                  <h3>{data.title}</h3>
                  <p>{data.text}</p>
                  <div className="plain-detail">
                    <BrandIcon name={data.icon} size={22} />
                    <span>{data.detail}</span>
                  </div>
                </TabsContent>
              ))}
            </div>
            <RoutineScene period={period} />
          </div>
        </Tabs>
      </div>
    </section>
  );
}

const steps = [
  {
    label: redesignCopy.registrar,
    icon: "movement",
    title: redesignCopy.o_cotidiano_vira_registro,
    text: redesignCopy.os_passos_e_os_movimentos_da_noite_sao_o_comeco_cada_dia_reu,
    diagramTitle: redesignCopy.um_dia_de_cada_vez,
    diagramText: redesignCopy.cada_peca_representa_um_dia_de_registros,
  },
  {
    label: redesignCopy.conhecer,
    icon: "history",
    title: redesignCopy.os_dias_formam_um_historico,
    text: redesignCopy.com_o_tempo_os_registros_se_conectam_o_caretwin_forma_uma_re,
    diagramTitle: redesignCopy.os_dias_vistos_em_conjunto,
    diagramText: redesignCopy.e_desse_conjunto_que_nasce_a_referencia_pessoal,
  },
  {
    label: redesignCopy.comparar,
    icon: "link",
    title: redesignCopy.mudancas_ganham_contexto,
    text: redesignCopy.os_registros_sao_comparados_com_esse_historico_durante_o_dia,
    diagramTitle: redesignCopy.hoje_encontra_o_seu_contexto,
    diagramText:
      redesignCopy.a_comparacao_considera_o_historico_da_propria_pessoa,
  },
];
function RecordsDiagram({ step }) {
  const reduced = useReducedMotion();
  const route = useRef(null);
  const traceX = useMotionValue(55),
    traceY = useMotionValue(184),
    traceOpacity = useMotionValue(0);
  const data = steps[step];
  const duration = reduced ? 0 : 0.52;
  useEffect(() => {
    traceOpacity.set(0);
    if (step !== 2 || reduced || !route.current) return;
    const path = route.current,
      length = path.getTotalLength();
    const control = animate(0, 1, {
      duration: 0.95,
      delay: 0.2,
      ease: "linear",
      onUpdate: (progress) => {
        const point = path.getPointAtLength(progress * length);
        traceX.set(point.x);
        traceY.set(point.y);
        traceOpacity.set(Math.min(1, progress / 0.08, (1 - progress) / 0.08));
      },
      onComplete: () => traceOpacity.set(0),
    });
    return () => control.stop();
  }, [step, reduced, traceX, traceY, traceOpacity]);
  return (
    <div className={"records-diagram diagram-step-" + step}>
      <svg
        className="records-canvas"
        viewBox="0 0 480 260"
        role="img"
        aria-label={
          data.diagramTitle +
          " " +
          data.diagramText +
          redesignCopy.dias_anteriores_a_esquerda_hoje_a_direita
        }
      >
        <path
          d="M27 179H453"
          fill="none"
          stroke={"var(--ds-art-e1e7f2)"}
          strokeWidth="1.5"
        />
        <motion.path
          className="history-connector"
          d={historyRoute + "V184"}
          fill="none"
          stroke={"var(--ds-art-8fa5e9)"}
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: step > 0 ? 1 : 0, opacity: step > 0 ? 1 : 0 }}
          transition={{ duration, ease }}
        />
        <motion.path
          className="compare-connection"
          d={"M361 195" + compareRoute}
          fill="none"
          stroke={"var(--ds-primary-accent)"}
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={false}
          animate={{
            opacity: step === 2 ? 1 : 0,
            pathLength: step === 2 ? 1 : 0,
          }}
          transition={{
            duration,
            delay: reduced || step !== 2 ? 0 : 0.18,
            ease,
          }}
        />
        <motion.circle
          className="compare-endpoint"
          cx="420"
          cy="174"
          r="3"
          fill={"var(--ds-primary-accent)"}
          initial={false}
          animate={{ opacity: step === 2 ? 1 : 0, scale: step === 2 ? 1 : 0.5 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
        />
        <path
          ref={route}
          className="reference-route"
          d={historyRoute + "V195" + compareRoute}
          fill="none"
          stroke="none"
          aria-hidden="true"
        />
        <motion.circle
          className="reference-trace"
          r="3.5"
          fill={"var(--ds-primary-accent)"}
          cx={traceX}
          cy={traceY}
          style={{ opacity: traceOpacity }}
        />
        {Array.from({ length: 6 }, (_, n) => {
          const today = n === 5;
          const active = step > 0 || today;
          return (
            <motion.g
              key={n}
              className={
                "day-record " + (today ? "record-today" : "record-past")
              }
              initial={false}
              animate={{ x: 27 + n * 73, y: today && step === 2 ? -12 : 0 }}
              transition={{ duration, ease }}
            >
              <text
                x="28"
                y="52"
                textAnchor="middle"
                className="record-day-label"
              >
                {today ? redesignCopy.hoje : redesignCopy.dia + (n + 1)}
              </text>
              <motion.rect
                x="0"
                y="70"
                width="56"
                height="103"
                rx="13"
                initial={false}
                animate={{
                  fill: today
                    ? "var(--ds-primary-accent)"
                    : active
                      ? "var(--ds-art-edf2ff)"
                      : "var(--ds-art-fafbfe)",
                  stroke: today
                    ? "var(--ds-primary-accent)"
                    : active
                      ? "var(--ds-art-a9bbed)"
                      : "var(--ds-art-e2e8f3)",
                }}
                transition={{
                  duration: reduced ? 0 : 0.36,
                  delay: reduced ? 0 : n * 0.025,
                  ease,
                }}
              />
              <motion.g
                initial={false}
                animate={{ opacity: active ? 1 : 0.4 }}
                transition={{ duration, ease }}
              >
                <path
                  d="M15 101h26M15 113h18M15 125h26"
                  fill="none"
                  stroke={
                    today ? "var(--ds-primary-ink)" : "var(--ds-art-8ea5d0)"
                  }
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx="18"
                  cy="151"
                  r="3"
                  fill={today ? "var(--ds-art-cbd9ff)" : "var(--ds-art-a2b5db)"}
                />
              </motion.g>
            </motion.g>
          );
        })}
        <motion.text
          x="208"
          y="239"
          textAnchor="middle"
          className="record-group-label"
          initial={false}
          animate={{ opacity: step > 0 ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
        >
          {redesignCopy.historico_pessoal}
        </motion.text>
      </svg>
      <div className="records-caption" key={step}>
        <strong>{data.diagramTitle}</strong>
        <span>{data.diagramText}</span>
      </div>
    </div>
  );
}
export function History() {
  const [step, setStep] = useState("0");
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <section className="history-section wrap" id="seu-historico">
      <div className="history-heading">
        <ScrollHeading
          lines={[redesignCopy.a_sua_referencia, redesignCopy.e_voce]}
        />
        <p>
          {redesignCopy.cada_pessoa_tem_um_costume}
          <br />
          {redesignCopy.a_comparacao_precisa_respeitar_isso}
        </p>
      </div>
      <Tabs value={step} onValueChange={setStep} className="history-flow">
        <LayoutGroup id={id}>
          <TabsList
            aria-label={redesignCopy.como_a_comparacao_pessoal_funciona}
          >
            {steps.map((data, i) => (
              <TabsTrigger value={String(i)} key={data.label}>
                <BrandIcon name={data.icon} size={25} />
                <span>{data.label}</span>
                <Arrow size={17} />
                {step === String(i) && (
                  <motion.span
                    className="history-tab-line"
                    layoutId="history-line"
                    initial={false}
                    transition={{ duration: reduced ? 0 : 0.32, ease }}
                    aria-hidden="true"
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </LayoutGroup>
        <div className="history-stage">
          <div className="history-explanation">
            <div className="history-copy-panels">
              {steps.map((data, i) => (
                <TabsContent
                  value={String(i)}
                  key={data.label}
                  forceMount
                  aria-hidden={String(i) !== step}
                  tabIndex={String(i) === step ? 0 : -1}
                >
                  <h3>{data.title}</h3>
                  <p>{data.text}</p>
                </TabsContent>
              ))}
            </div>
            <div className="ritmo-guide">
              <Image
                sizes="88px"
                src={A + "ritmo-guia.webp"}
                alt=""
                width="1276"
                height="1276"
                loading="lazy"
              />
              <p>
                {redesignCopy.o_seu_costume_e}
                <br />
                {redesignCopy.o_ponto_de_partida}
              </p>
            </div>
          </div>
          <RecordsDiagram step={Number(step)} />
        </div>
      </Tabs>
    </section>
  );
}
export function Family() {
  const [perspective, setPerspective] = useState("voce");
  return (
    <section className="family-section" id="para-quem">
      <div className="wrap family-layout">
        <PhoneScene perspective={perspective} />
        <div className="family-copy">
          <ScrollHeading
            lines={[redesignCopy.estar_perto_tambem, redesignCopy.e_dar_espaco]}
          />
          <p>
            {redesignCopy.um_olhar_para_a_rotina_de_quem_usa}
            <br />
            {redesignCopy.um_jeito_de_acompanhar_para_quem_se_importa}
          </p>
          <Tabs
            value={perspective}
            onValueChange={setPerspective}
            className="family-tabs"
          >
            <SegmentedTabs
              value={perspective}
              onValueChange={setPerspective}
              label={redesignCopy.escolher_perspectiva_de_uso}
              items={[
                {
                  value: "voce",
                  label: redesignCopy.para_quem_usa,
                  icon: <BrandIcon name="movement" size={20} />,
                },
                {
                  value: "familia",
                  label: redesignCopy.para_a_familia,
                  icon: <BrandIcon name="family" size={20} />,
                },
              ]}
            />
            <div className="family-copy-panels">
              <TabsContent
                value="voce"
                forceMount
                aria-hidden={perspective !== "voce"}
                tabIndex={perspective === "voce" ? 0 : -1}
              >
                <h3>{redesignCopy.sua_rotina_continua_sendo_sua}</h3>
                <p>
                  {
                    redesignCopy.veja_seus_passos_acompanhe_a_estimativa_de_sono_e_saiba_quem
                  }
                </p>
              </TabsContent>
              <TabsContent
                value="familia"
                forceMount
                aria-hidden={perspective !== "familia"}
                tabIndex={perspective === "familia" ? 0 : -1}
              >
                <h3>{redesignCopy.acompanhar_comeca_com_um_vinculo}</h3>
                <p>
                  {
                    redesignCopy.familiares_com_vinculo_aprovado_acompanham_os_registros_e_as
                  }
                </p>
              </TabsContent>
            </div>
          </Tabs>
          <div className="permission-note">
            <BrandIcon name="link" size={21} />
            <span>
              {redesignCopy.o_acompanhamento_depende_de_vinculo_aprovado}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
export function Close() {
  return (
    <section className="close-section">
      <div className="wrap close-content">
        <Image
          sizes="146px"
          className="close-ritmo"
          src={A + "ritmo-oi-r2.webp"}
          alt={redesignCopy.ritmo_aparece_de_cabeca_para_baixo_para_dar_um_oi}
          width="1536"
          height="1024"
          loading="lazy"
        />
        <h2>{redesignCopy.seu_dia_com_mais_contexto}</h2>
        <p>
          {redesignCopy.entre_para_acompanhar_sua_rotina}
          <br />
          {redesignCopy.ou_a_de_uma_pessoa_da_sua_familia}
        </p>
        <Button asChild>
          <Link href="/app/painel">
            {redesignCopy.explorar_o_painel}
            <Arrow />
          </Link>
        </Button>
        <a className="close-help" href="#duvidas">
          {redesignCopy.tenho_uma_duvida}
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
