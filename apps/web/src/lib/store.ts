"use client";

/*
  A camada de dados do CareTwin. Nenhum componente lê ou grava dado por fora daqui.

  Hoje os dados moram no navegador (localStorage), com estado externo via
  useSyncExternalStore, cache de snapshot para a identidade ficar estável, leitura
  tolerante a dado corrompido e cascata (sair uma pessoa leva junto a pulseira, os dias
  e os alertas dela).

  Quando a API do CareTwin (apps/api) estiver no ar, é este arquivo que troca as
  leituras e gravações por chamadas HTTP. Nenhuma tela precisa mudar: elas só conhecem
  os hooks e as ações exportados abaixo.
*/

import { useSyncExternalStore } from "react";
import type { Dados, DiaRegistrado, Pessoa, Preferencias, Pulseira, Sessao } from "./types";
import { gerarDadosDeExemplo, recalcularAlertas, totalPrevistoHoje } from "./seed";
import { chaveDia, hojeChave } from "./formato";
import { fracaoDoDia } from "./normal";

const CHAVE_DADOS = "caretwin:dados:v1";
const CHAVE_SESSAO = "caretwin:sessao:v1";
const CHAVE_PREFERENCIAS = "caretwin:preferencias:v1";

const PREFERENCIAS_PADRAO: Preferencias = { tema: "sistema", texto: "padrao", pessoaAtivaId: null };

type Ouvinte = () => void;
const ouvintes = new Set<Ouvinte>();

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

function inscrever(ouvinte: Ouvinte) {
  ouvintes.add(ouvinte);
  const aoMudarEmOutraAba = (evento: StorageEvent) => {
    if (evento.key && evento.key.startsWith("caretwin:")) {
      cache.delete(evento.key);
      avisar();
    }
  };
  window.addEventListener("storage", aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

/* Cache por chave: o mesmo texto guardado devolve sempre o mesmo objeto. */
const cache = new Map<string, { bruto: string | null; valor: unknown }>();

function ler<T>(chave: string, validar: (valor: unknown) => T | null): T | null {
  let bruto: string | null = null;
  try {
    bruto = window.localStorage.getItem(chave);
  } catch {
    // Armazenamento bloqueado: usa o que ficou em memória nesta visita.
    return (cache.get(chave)?.valor as T | null) ?? null;
  }
  const guardado = cache.get(chave);
  if (guardado && guardado.bruto === bruto) return guardado.valor as T | null;
  let valor: T | null = null;
  if (bruto !== null) {
    try {
      valor = validar(JSON.parse(bruto));
    } catch {
      // Dado corrompido não derruba a tela: é tratado como ausente.
      valor = null;
    }
  }
  cache.set(chave, { bruto, valor });
  return valor;
}

function gravar(chave: string, valor: unknown) {
  const bruto = valor === null ? null : JSON.stringify(valor);
  try {
    if (bruto === null) window.localStorage.removeItem(chave);
    else window.localStorage.setItem(chave, bruto);
  } catch {
    // Sem espaço ou navegação privada: segue com o valor só em memória.
  }
  cache.set(chave, { bruto, valor });
  avisar();
}

/* ---------- validação leve do que vem do armazenamento ---------- */

function ehDados(valor: unknown): Dados | null {
  if (!valor || typeof valor !== "object") return null;
  const v = valor as Partial<Dados>;
  if (v.versao !== 1 || !Array.isArray(v.pessoas) || !Array.isArray(v.pulseiras) || !Array.isArray(v.dias) || !Array.isArray(v.alertas)) {
    return null;
  }
  return { origem: "proprio", geradoEm: "", ...v } as Dados;
}

function ehSessao(valor: unknown): Sessao | null {
  if (!valor || typeof valor !== "object") return null;
  const v = valor as Partial<Sessao>;
  return typeof v.nome === "string" && typeof v.entrouEm === "string" ? (v as Sessao) : null;
}

function ehPreferencias(valor: unknown): Preferencias | null {
  if (!valor || typeof valor !== "object") return null;
  return { ...PREFERENCIAS_PADRAO, ...(valor as Partial<Preferencias>) };
}

/* ---------- leitura dos dados, com os exemplos se renovando a cada dia ---------- */

let exemplosEmMemoria: Dados | null = null;

function lerDados(): Dados {
  const atual = ler(CHAVE_DADOS, ehDados);
  const exemplosVencidos = atual?.origem === "exemplos" && atual.geradoEm !== hojeChave();
  if (atual && !exemplosVencidos) return atual;
  if (!atual && exemplosEmMemoria && exemplosEmMemoria.geradoEm === hojeChave()) return exemplosEmMemoria;
  const novos = gerarDadosDeExemplo();
  exemplosEmMemoria = novos;
  let bruto: string | null = null;
  try {
    bruto = JSON.stringify(novos);
    window.localStorage.setItem(CHAVE_DADOS, bruto);
  } catch {
    bruto = null;
  }
  cache.set(CHAVE_DADOS, { bruto, valor: novos });
  return novos;
}

function gravarDados(atualizar: (dados: Dados) => Dados) {
  const atual = lerDados();
  const proximo = atualizar(atual);
  const comAlertas: Dados = { ...proximo, alertas: recalcularAlertas(proximo, hojeChave()) };
  gravar(CHAVE_DADOS, comAlertas);
}

/* ---------- hooks ---------- */

const nadaNoServidor = () => null;

/** Os dados do app. É null só durante a primeira pintura, antes de ler o navegador. */
export function useDados(): Dados | null {
  return useSyncExternalStore(inscrever, lerDados, nadaNoServidor);
}

/** A sessão: undefined antes de ler o navegador, null quando ninguém entrou. */
export function useSessao(): Sessao | null | undefined {
  return useSyncExternalStore(
    inscrever,
    () => ler(CHAVE_SESSAO, ehSessao),
    () => undefined,
  );
}

const preferenciasNoServidor = () => PREFERENCIAS_PADRAO;
let ultimasPreferencias: Preferencias = PREFERENCIAS_PADRAO;

export function usePreferencias(): Preferencias {
  return useSyncExternalStore(
    inscrever,
    () => {
      const lidas = ler(CHAVE_PREFERENCIAS, ehPreferencias);
      if (lidas) return lidas;
      return ultimasPreferencias;
    },
    preferenciasNoServidor,
  );
}

/* ---------- sessão ---------- */

export function entrar(nome: string) {
  gravar(CHAVE_SESSAO, { nome: nome.trim(), entrouEm: new Date().toISOString() } satisfies Sessao);
}

export function atualizarNomeDaSessao(nome: string) {
  const atual = ler(CHAVE_SESSAO, ehSessao);
  if (!atual) return;
  gravar(CHAVE_SESSAO, { ...atual, nome: nome.trim() } satisfies Sessao);
}

export function sair() {
  gravar(CHAVE_SESSAO, null);
}

/* ---------- preferências ---------- */

export function definirPreferencias(mudancas: Partial<Preferencias>) {
  const atuais = ler(CHAVE_PREFERENCIAS, ehPreferencias) ?? PREFERENCIAS_PADRAO;
  const proximas = { ...atuais, ...mudancas };
  ultimasPreferencias = proximas;
  gravar(CHAVE_PREFERENCIAS, proximas);
  aplicarPreferenciasNaPagina(proximas);
}

/** Aplica tema e tamanho de texto no <html>, do mesmo jeito que o script do layout faz. */
export function aplicarPreferenciasNaPagina(p: Preferencias) {
  const raiz = document.documentElement;
  const escuro = p.tema === "escuro" || (p.tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  raiz.dataset.tema = escuro ? "escuro" : "claro";
  raiz.dataset.texto = p.texto;
}

/* ---------- ações do produto ---------- */

export function marcarAlerta(id: string, lido: boolean) {
  gravarDados((d) => ({ ...d, alertas: d.alertas.map((a) => (a.id === id ? { ...a, lido } : a)) }));
}

export function marcarTodosComoLidos(pessoaId: string) {
  gravarDados((d) => ({ ...d, alertas: d.alertas.map((a) => (a.pessoaId === pessoaId ? { ...a, lido: true } : a)) }));
}

/**
 * Sincronização simulada: faz o papel do POST /v1/device/live da pulseira.
 * Atualiza os passos de hoje até o horário atual, a bateria e a hora da sincronização.
 */
export function sincronizarAgora(pessoaId: string) {
  const agora = new Date();
  const hoje = chaveDia(agora);
  gravarDados((d) => {
    const pulseiras = d.pulseiras.map((p) =>
      p.pessoaId === pessoaId
        ? { ...p, ultimaSincronizacao: agora.toISOString(), bateria: Math.max(5, p.bateria - (p.ultimaSincronizacao ? 1 : 0)) }
        : p,
    );
    const previsto = totalPrevistoHoje(pessoaId, hoje);
    const existente = d.dias.find((dia) => dia.pessoaId === pessoaId && dia.data === hoje);
    const passos = Math.max(existente?.passos ?? 0, Math.round(previsto * fracaoDoDia(agora)));
    const minutosAtivos = Math.max(existente?.minutosAtivos ?? 0, Math.round(passos / 95));
    const dias = existente
      ? d.dias.map((dia) => (dia === existente ? { ...dia, passos, minutosAtivos } : dia))
      : [...d.dias, diaVazio(pessoaId, hoje, passos, minutosAtivos)];
    return { ...d, pulseiras, dias };
  });
}

function diaVazio(pessoaId: string, data: string, passos = 0, minutosAtivos = 0): DiaRegistrado {
  return { id: `dia:${pessoaId}:${data}`, pessoaId, data, passos, minutosAtivos, noite: null, batimentos: [] };
}

/** Guarda uma medição de batimentos no dia registrado de hoje. */
export function registrarMedicao(pessoaId: string, bpm: number) {
  const agora = new Date();
  const hoje = chaveDia(agora);
  gravarDados((d) => {
    const existente = d.dias.find((dia) => dia.pessoaId === pessoaId && dia.data === hoje);
    const medicao = { em: agora.toISOString(), bpm };
    const dias = existente
      ? d.dias.map((dia) => (dia === existente ? { ...dia, batimentos: [...dia.batimentos, medicao] } : dia))
      : [...d.dias, { ...diaVazio(pessoaId, hoje), batimentos: [medicao] }];
    return { ...d, dias };
  });
}

export type NovaPessoa = Pick<Pessoa, "nome" | "comoChamar" | "idadeAproximada" | "quemAcompanha"> & {
  codigoPulseira: string;
};

/** Primeiro uso: cria a pessoa e liga a pulseira a ela. Devolve o id da pessoa. */
export function cadastrarPessoaComPulseira(nova: NovaPessoa): string {
  const agora = new Date();
  const id = `pessoa-${agora.getTime().toString(36)}`;
  const pessoa: Pessoa = {
    id,
    nome: nova.nome.trim(),
    comoChamar: nova.comoChamar.trim() || nova.nome.trim().split(" ")[0],
    idadeAproximada: nova.idadeAproximada,
    quemAcompanha: nova.quemAcompanha.trim(),
    criadoEm: agora.toISOString(),
  };
  const pulseira: Pulseira = {
    id: `pulseira-${agora.getTime().toString(36)}`,
    pessoaId: id,
    codigo: nova.codigoPulseira.trim().toUpperCase(),
    bateria: 100,
    versao: "0.4.2",
    ultimaSincronizacao: null,
  };
  gravarDados((d) => ({ ...d, origem: "proprio", pessoas: [...d.pessoas, pessoa], pulseiras: [...d.pulseiras, pulseira] }));
  definirPreferencias({ pessoaAtivaId: id });
  return id;
}

export function atualizarPessoa(id: string, mudancas: Partial<Pick<Pessoa, "nome" | "comoChamar" | "idadeAproximada" | "quemAcompanha">>) {
  gravarDados((d) => ({ ...d, origem: "proprio", pessoas: d.pessoas.map((p) => (p.id === id ? { ...p, ...mudancas } : p)) }));
}

/** Cascata: sai a pessoa, saem a pulseira, os dias e os alertas dela. */
export function removerPessoa(id: string) {
  gravarDados((d) => ({
    ...d,
    origem: "proprio",
    pessoas: d.pessoas.filter((p) => p.id !== id),
    pulseiras: d.pulseiras.filter((p) => p.pessoaId !== id),
    dias: d.dias.filter((dia) => dia.pessoaId !== id),
    alertas: d.alertas.filter((a) => a.pessoaId !== id),
  }));
}

export function restaurarExemplos() {
  gravar(CHAVE_DADOS, gerarDadosDeExemplo());
  definirPreferencias({ pessoaAtivaId: null });
}

export function apagarTudo() {
  const vazio: Dados = { versao: 1, origem: "proprio", geradoEm: hojeChave(), pessoas: [], pulseiras: [], dias: [], alertas: [] };
  gravar(CHAVE_DADOS, vazio);
  definirPreferencias({ pessoaAtivaId: null });
}

