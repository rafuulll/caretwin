"use client";
import Image from "next/image";
import Link from "next/link";
import { redesignCopy, redesignFooter } from "@/content/site";
import { Logo } from "@/components/app/logo";
import React, { useEffect } from "react";
import {
  motion,
  MotionConfig,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, ArrowDown } from "@phosphor-icons/react";
import {
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui";
import "./landing.css";
import { Header, Arrow, ScrollHeading, useInputModality } from "./interaction";
import { DayNight, History, Family } from "./sections-r2";
import { useSmoothScroll } from "./use-smooth-scroll";

const A = "/brand/";

function Brand() {
  return (
    <Link className="brand" href="/" aria-label={redesignCopy.caretwin_inicio}>
      <Logo />
    </Link>
  );
}
function Tilt({ children, className = "", strength = 3 }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rx = useSpring(x, { stiffness: 90, damping: 24 }),
    ry = useSpring(y, { stiffness: 90, damping: 24 });
  function move(e) {
    if (reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((-(e.clientY - r.top - r.height / 2) / r.height) * strength);
    y.set(((e.clientX - r.left - r.width / 2) / r.width) * strength);
  }
  return (
    <motion.div
      className={`tilt ${className}`}
      style={{
        rotateX: reduced ? 0 : rx,
        rotateY: reduced ? 0 : ry,
        transformPerspective: 1000,
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
function Hero({ variant }) {
  return (
    <section className={`hero wrap${variant ? " hero-concept" : ""}`} id="inicio">
      {variant && <div className="hero-concept-scene" aria-hidden="true"><Image src={`${A}${variant === "janela" ? "hero-janela-completa" : `hero-estudo-${variant}`}.webp`} alt="" fill priority unoptimized sizes="(max-width: 1023px) 175vw, 100vw" /></div>}
      <div className="hero-copy">
        <h1>
          {redesignCopy.cada_pessoa_tem}
          <br />
          {redesignCopy.seu_proprio}
          <span className="hero-emphasis">
            {redesignCopy.ritmo}
            <svg
              viewBox="0 0 220 96"
              fill="none"
              aria-hidden="true"
              focusable="false"
              preserveAspectRatio="none"
            >
              <path
                d="M202 22C170 3 74 3 30 20C-4 33 6 69 39 82C79 98 178 90 205 70C230 51 208 20 178 16"
                pathLength="1"
              />
            </svg>
          </span>
        </h1>
        <p>
          {
            redesignCopy.acompanhe_seu_dia_ou_o_de_quem_voce_cuida_o_caretwin_compara
          }
        </p>
        <div className="hero-actions">
          <Button asChild>
            <Link href="/app/painel">
              {redesignCopy.explorar_o_painel}
              <Arrow />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href="#como-funciona">
              {redesignCopy.ver_como_funciona}
              <ArrowDown size={17} aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
      {!variant && <div className="hero-art">
        <Tilt strength={5}>
          <Image
            sizes="(max-width: 767px) 90vw, 540px"
            priority
            className="hero-image"
            src={A + "ritmo-hero.webp"}
            alt={
              redesignCopy.ritmo_reclinado_descansando_sobre_uma_base_clara_e_ondas_sua
            }
            fetchPriority="high"
            width="1448"
            height="1086"
          />
        </Tilt>
        <div className="hero-art-caption">
          {redesignCopy.no_seu_tempo_do_seu_jeito}
        </div>
      </div>}
    </section>
  );
}

const faq = [
  [
    redesignCopy.o_que_a_pulseira_acompanha,
    redesignCopy.passos_e_movimentos_que_ajudam_a_estimar_periodos_de_sono_o_,
  ],
  [
    redesignCopy.como_funciona_a_comparacao_com_a_rotina,
    redesignCopy.o_caretwin_precisa_de_um_periodo_inicial_de_registros_para_f,
  ],
  [
    redesignCopy.o_sono_e_medido_ou_estimado,
    redesignCopy.e_uma_estimativa_baseada_nos_movimentos_registrados_pela_pul,
  ],
  [
    redesignCopy.quem_pode_acompanhar_meus_registros,
    redesignCopy.quem_usa_a_pulseira_e_familiares_com_vinculo_aprovado_a_part,
  ],
  [
    redesignCopy.posso_criar_uma_conta_por_aqui,
    redesignCopy.o_cadastro_publico_nao_esta_disponivel_para_entrar_no_caretw,
  ],
  [
    redesignCopy.o_caretwin_faz_diagnosticos,
    redesignCopy.nao_o_caretwin_acompanha_registros_da_rotina_e_destaca_mudan,
  ],
];
function FAQ() {
  return (
    <section className="faq-section wrap section-pad" id="duvidas">
      <div className="faq-heading">
        <ScrollHeading
          lines={[redesignCopy.antes_de_entrar, redesignCopy.vamos_conversar]}
        />
        <p>
          {redesignCopy.respostas_claras_tambem}
          <br />
          {redesignCopy.fazem_parte_do_cuidado}
        </p>
      </div>
      <Accordion type="single" collapsible className="faq-list">
        {faq.map(([q, a], i) => (
          <AccordionItem value={"faq-" + i} key={q}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent>
              <p>{a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
function Footer() {
  return (
    <footer id="rodape" className="signature-footer">
      <div className="signature-footer-inner">
        <div className="signature-footer-panel">
          <div className="signature-footer-top">
            <div className="signature-footer-help">
              <h2>
                {redesignCopy.seu_dia_com_mais_contexto}
              </h2>
              <p className="signature-footer-description">
                {redesignCopy.entre_para_acompanhar_sua_rotina}{" "}
                {redesignCopy.ou_a_de_uma_pessoa_da_sua_familia}
              </p>
              <Link className="signature-footer-help-link" href="/app/painel">
                {redesignCopy.explorar_o_painel}
                <Arrow size={17} />
              </Link>
            </div>
            <Brand />
          </div>
          <nav
            className="signature-footer-navigation"
            aria-label={redesignFooter.navigation}
          >
            {redesignFooter.groups.map((group) => (
              <div className="signature-footer-group" key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {link.href.startsWith("/") ? (
                        <Link href={link.href}>{link.label}</Link>
                      ) : (
                        <a href={link.href}>{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="signature-footer-meta">
          <span>{redesignFooter.signature}</span>
          <a href="#inicio">
            {redesignCopy.voltar_ao_inicio}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="signature-footer-wordmark" aria-hidden="true">
          <span>{redesignCopy.caretwin}</span>
          <span className="signature-footer-dot" />
        </div>
      </div>
    </footer>
  );
}
function SectionWave({ surface }) {
  return (
    <div className={`section-wave section-wave--${surface}`} aria-hidden="true">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" focusable="false">
        <path d="M0 0H1440V28C1130 115 930 102 700 58C430 6 235 8 0 75Z" />
      </svg>
    </div>
  );
}
function SectionBridge() {
  return (
    <div className="section-bridge">
      <svg viewBox="0 0 160 60" aria-hidden="true">
        <path
          d="M0 0H160C125 0 123 58 80 58S35 0 0 0Z"
          fill={"var(--ds-primary-ink)"}
        />
      </svg>
      <a
        href="#como-funciona"
        className="bridge-link"
        aria-label={redesignCopy.continuar_para_como_funciona}
      >
        <ArrowDown size={22} aria-hidden="true" />
      </a>
    </div>
  );
}
function Landing({ heroVariant }) {
  useSmoothScroll();
  return (
    <>
      <a className="skip-link" href="#inicio">
        {redesignCopy.pular_para_o_conteudo}
      </a>
      <Header brand={<Brand />} />
      <main>
        <Hero variant={heroVariant} />
        <SectionBridge />
        <DayNight />
        <SectionWave surface="routine" />
        <History />
        <div className="family-flow">
          <Family />
        </div>
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

export default function ApprovedLanding({ heroVariant = "" }) {
  useInputModality();
  useEffect(() => {
    document.documentElement.dataset.ready = "true";
    return () => {
      delete document.documentElement.dataset.ready;
    };
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <div className="ct-landing">
        <Landing heroVariant={heroVariant} />
      </div>
    </MotionConfig>
  );
}
