"use client"

import { useCallback, useSyncExternalStore } from "react"
import { paraISO } from "./formato"
import { fracaoDoDia } from "./normal"
import { gerarExemplos, passosPrevistosParaHoje, recalcularAlertas } from "./seed"
import type { Alerta, Dados, DiaRegistrado, Pessoa, Pulseira, Sessao } from "./types"

/**
 * A ÚNICA porta de dados do CareTwin. Nenhuma tela lê ou grava por fora daqui.
 *
 * Ela tem dois lados, e escolhe sozinha qual usar:
 *
 *   NAVEGADOR, o padrão. Sem configurar nada, tudo mora no localStorage. É o
 *   que faz `npm install && npm run dev` bastar: sem banco, sem conta em
 *   serviço nenhum, sem variável de ambiente.
 *
 *   BANCO. Quando a `DATABASE_URL` está no `.env.local`, a mesma porta passa a
 *   falar com o Postgres pela rota `/api/dados`.
 *
 * E é AQUI que a API do CareTwin vai entrar. Quando a pulseira estiver mandando
 * os dados para a API própria, as funções de baixo trocam o navegador por
 * chamadas a ela, e nenhuma tela fica sabendo: `useDados()` devolve os mesmos
 * dados e as mesmas funções. É por isso que a regra de nunca ler ou gravar fora
 * deste arquivo vale tanto.
 */

const CHAVE_DADOS = "caretwin-prototipo:dados:v1"
const CHAVE_SESSAO = "caretwin-prototipo:sessao:v1"
/** Em que dia os exemplos guardados foram gerados. Ver `lerDoNavegador`. */
const CHAVE_EXEMPLOS = "caretwin-prototipo:exemplos:v1"
/** Qual das pessoas acompanhadas está na tela agora. */
const CHAVE_PESSOA = "caretwin-prototipo:pessoa:v1"

const VAZIO: Dados = { pessoas: [], pulseiras: [], dias: [], alertas: [] }

type Modo = "descobrindo" | "navegador" | "banco"

/** O que as telas recebem. Um objeto só, com identidade estável. */
export type EstadoDosDados = { dados: Dados; carregando: boolean }

// --- núcleo reativo -------------------------------------------------------

type Ouvinte = () => void
const ouvintes = new Set<Ouvinte>()

let modo: Modo = "descobrindo"

/**
 * O instantâneo atual. `useSyncExternalStore` compara por identidade, então
 * este objeto só pode ser trocado quando alguma coisa realmente mudou: montar
 * um novo a cada leitura faria o React re-renderizar em laço infinito.
 */
let instantaneo: EstadoDosDados = { dados: VAZIO, carregando: true }

/** Resposta do servidor durante a renderização. Constante, pelo mesmo motivo. */
const NO_SERVIDOR: EstadoDosDados = { dados: VAZIO, carregando: true }

function publicar(dados: Dados, carregando = false) {
  instantaneo = { dados, carregando }
  for (const o of ouvintes) o()
}

function lerInstantaneo(): EstadoDosDados {
  return instantaneo
}

// --- lado do navegador ----------------------------------------------------

function lerTexto(chave: string) {
  try {
    return window.localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravarTexto(chave: string, valor: string | null) {
  try {
    if (valor === null) window.localStorage.removeItem(chave)
    else window.localStorage.setItem(chave, valor)
  } catch {
    // Cota estourada ou modo privado: seguimos com o estado em memória.
  }
}

/** Exemplos novos, já marcados como gerados hoje. */
function exemplosDeHoje(): Dados {
  const agora = new Date()
  gravarTexto(CHAVE_EXEMPLOS, paraISO(agora))
  return gerarExemplos(agora)
}

/**
 * Lê o que está guardado, tolerante a dado velho ou corrompido.
 *
 * Os exemplos são gerados em volta de HOJE. Guardados de ontem, eles mostrariam
 * uma pulseira que não sincroniza desde ontem e um dia de hoje sem passo
 * nenhum, que é o contrário do que eles existem pra mostrar. Então, enquanto o
 * que está guardado ainda for exemplo, ele é refeito a cada dia novo. Assim que
 * alguém cadastra uma pessoa de verdade ou limpa tudo, a marca sai e nada mais é
 * refeito sozinho.
 */
function lerDoNavegador(): Dados {
  const bruto = lerTexto(CHAVE_DADOS)
  if (!bruto) return exemplosDeHoje()

  const geradoEm = lerTexto(CHAVE_EXEMPLOS)
  if (geradoEm && geradoEm !== paraISO(new Date())) {
    const novos = exemplosDeHoje()
    gravarNoNavegador(novos)
    return novos
  }

  try {
    const salvo = JSON.parse(bruto) as Partial<Dados>
    // Cada coleção que vier estragada cai no vazio, sem derrubar as outras.
    return {
      pessoas: Array.isArray(salvo.pessoas) ? salvo.pessoas : [],
      pulseiras: Array.isArray(salvo.pulseiras) ? salvo.pulseiras : [],
      dias: Array.isArray(salvo.dias) ? salvo.dias : [],
      alertas: Array.isArray(salvo.alertas) ? salvo.alertas : [],
    }
  } catch {
    return exemplosDeHoje()
  }
}

function gravarNoNavegador(dados: Dados) {
  gravarTexto(CHAVE_DADOS, JSON.stringify(dados))
}

// --- lado do banco --------------------------------------------------------

async function pedir(metodo: string, corpo: unknown) {
  const resposta = await fetch("/api/dados", {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  })
  if (!resposta.ok) throw new Error(`/api/dados respondeu ${resposta.status}`)
}

/**
 * Manda a mudança pro banco depois de a tela já ter mudado.
 *
 * A tela não espera a rede: quem marcou um alerta como lido vê a marca na hora.
 * Se o banco recusar, a gente recarrega de lá e a tela volta pra verdade, em
 * vez de ficar mostrando uma mudança que não aconteceu.
 */
function enviar(metodo: string, corpo: unknown) {
  pedir(metodo, corpo).catch((erro) => {
    console.error("[dados] gravação falhou, recarregando do banco", erro)
    void recarregarDoBanco()
  })
}

const COLECOES_DO_BANCO = ["pessoas", "pulseiras", "dias", "alertas"] as const

/**
 * Sincronizar a pulseira mexe em três coleções de uma vez (a pulseira, o dia e
 * os alertas). Em vez de cada operação saber exatamente o que mudou, compara o
 * antes com o depois e manda só a diferença: o que entrou ou mudou vai como
 * gravação, o que sumiu vai como remoção.
 */
function enviarDiferencas(antes: Dados, depois: Dados) {
  for (const colecao of COLECOES_DO_BANCO) {
    const anteriores = new Map((antes[colecao] as Array<{ id: string }>).map((i) => [i.id, i]))
    for (const item of depois[colecao] as Array<{ id: string }>) {
      const antigo = anteriores.get(item.id)
      if (!antigo || JSON.stringify(antigo) !== JSON.stringify(item)) {
        enviar("POST", { colecao, item })
      }
      anteriores.delete(item.id)
    }
    for (const id of anteriores.keys()) enviar("DELETE", { colecao, id })
  }
}

async function recarregarDoBanco() {
  try {
    const resposta = await fetch("/api/dados", { cache: "no-store" })
    const corpo = (await resposta.json()) as { ligado: boolean; dados: Dados | null }
    if (corpo.ligado && corpo.dados) publicar(corpo.dados)
  } catch (erro) {
    console.error("[dados] leitura falhou", erro)
  }
}

// --- descoberta do modo ---------------------------------------------------

let descoberta: Promise<void> | null = null

/**
 * Pergunta uma vez, no primeiro componente que monta, se existe banco ligado.
 *
 * Enquanto a resposta não chega, `carregando` fica ligado e a casca do app
 * mostra o esqueleto. É de propósito: mostrar os dados de exemplo primeiro e
 * trocar depois pelos de verdade seria piscar o dia de outra pessoa na tela.
 */
function descobrirModo() {
  if (descoberta) return descoberta

  descoberta = (async () => {
    try {
      const resposta = await fetch("/api/dados", { cache: "no-store" })
      const corpo = (await resposta.json()) as { ligado: boolean; dados: Dados | null }
      if (corpo.ligado && corpo.dados) {
        modo = "banco"
        publicar(corpo.dados)
        return
      }
    } catch {
      // Rota fora do ar ou resposta estranha: o navegador dá conta sozinho.
    }
    modo = "navegador"
    const dados = lerDoNavegador()
    gravarNoNavegador(dados)
    publicar(dados)
  })()

  return descoberta
}

function inscrever(o: Ouvinte) {
  ouvintes.add(o)
  void descobrirModo()
  return () => {
    ouvintes.delete(o)
  }
}

/**
 * Aplica a mudança nos dois lados: primeiro na tela, depois onde ela mora.
 *
 * `remoto` recebe o antes e o depois, e fala com o banco. Cada operação escreve
 * as duas versões da mesma intenção, lado a lado, porque traduzir uma na outra
 * é onde os dois lados começam a divergir sem ninguém perceber.
 */
function aplicar(proximo: (atual: Dados) => Dados, remoto: (antes: Dados, depois: Dados) => void) {
  const antes = instantaneo.dados
  const depois = proximo(antes)
  publicar(depois)
  if (modo === "banco") remoto(antes, depois)
  else gravarNoNavegador(depois)
}

/** Daqui pra frente, o que está guardado é de alguém, e não é mais refeito sozinho. */
function deixaDeSerExemplo() {
  gravarTexto(CHAVE_EXEMPLOS, null)
}

export function novoId(prefixo: string) {
  return `${prefixo}-${Math.random().toString(36).slice(2, 9)}`
}

function diaVazio(pessoaId: string, data: string): DiaRegistrado {
  return { id: `dia-${pessoaId}-${data}`, pessoaId, data, passos: null, noite: null, batimentos: [] }
}

/** Troca o dia de hoje da pessoa, criando o dia se ele ainda não existe. */
function comODiaDeHoje(dados: Dados, pessoaId: string, mudar: (dia: DiaRegistrado) => DiaRegistrado) {
  const hoje = paraISO(new Date())
  const existente = dados.dias.find((d) => d.pessoaId === pessoaId && d.data === hoje)
  const novo = mudar(existente ?? diaVazio(pessoaId, hoje))
  return existente
    ? dados.dias.map((d) => (d === existente ? novo : d))
    : [...dados.dias, novo]
}

// --- hook público ---------------------------------------------------------

export type NovaPessoa = Pick<Pessoa, "nome" | "quemAcompanha"> & { codigoPulseira: string }

export function useDados() {
  const { dados, carregando } = useSyncExternalStore(inscrever, lerInstantaneo, () => NO_SERVIDOR)

  /** O primeiro uso: a pessoa e a pulseira dela nascem juntas, porque uma não existe sem a outra aqui. */
  const cadastrarPessoa = useCallback(({ nome, quemAcompanha, codigoPulseira }: NovaPessoa) => {
    const pessoa: Pessoa = {
      id: novoId("pessoa"),
      nome: nome.trim(),
      quemAcompanha: quemAcompanha.trim(),
      criadoEm: new Date().toISOString(),
    }
    const pulseira: Pulseira = {
      id: novoId("pulseira"),
      codigo: codigoPulseira.trim().toUpperCase(),
      pessoaId: pessoa.id,
      bateria: 100,
      ultimaSincronizacao: null,
    }
    deixaDeSerExemplo()
    aplicar(
      (d) => ({ ...d, pessoas: [...d.pessoas, pessoa], pulseiras: [...d.pulseiras, pulseira] }),
      () => {
        enviar("POST", { colecao: "pessoas", item: pessoa })
        enviar("POST", { colecao: "pulseiras", item: pulseira })
      }
    )
    return pessoa
  }, [])

  const atualizarPessoa = useCallback((id: string, patch: Partial<Pick<Pessoa, "nome" | "quemAcompanha">>) => {
    aplicar(
      (d) => ({ ...d, pessoas: d.pessoas.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      () => enviar("PATCH", { colecao: "pessoas", id, patch })
    )
  }, [])

  /**
   * Remove a pessoa e tudo que só existia por causa dela: a pulseira, os dias
   * registrados e os alertas. Pulseira sem pessoa não mostra nada a ninguém, e
   * alerta de quem não está mais no app seria aviso falando sozinho.
   */
  const removerPessoa = useCallback((id: string) => {
    deixaDeSerExemplo()
    aplicar(
      (d) => ({
        pessoas: d.pessoas.filter((p) => p.id !== id),
        pulseiras: d.pulseiras.filter((p) => p.pessoaId !== id),
        dias: d.dias.filter((dia) => dia.pessoaId !== id),
        alertas: d.alertas.filter((a) => a.pessoaId !== id),
      }),
      // O banco faz a mesma limpeza do lado de lá, numa chamada só.
      () => enviar("DELETE", { colecao: "pessoas", id })
    )
  }, [])

  /**
   * A sincronização de exemplo: faz o papel da pulseira mandando o resumo do
   * dia. Os passos chegam até o horário de agora, a bateria gasta um pouco e os
   * alertas são refeitos com o dia novo. Quando a API existir, é esta função
   * que passa a só reler o que a pulseira já mandou pra lá.
   */
  const sincronizarPulseira = useCallback((pessoaId: string) => {
    const agora = new Date()
    const hoje = paraISO(agora)
    aplicar(
      (d) => {
        const pulseiras = d.pulseiras.map((p) =>
          p.pessoaId === pessoaId
            ? { ...p, ultimaSincronizacao: agora.toISOString(), bateria: Math.max(5, p.bateria - 1) }
            : p
        )
        const previstos = passosPrevistosParaHoje(pessoaId, hoje)
        const dias = comODiaDeHoje(d, pessoaId, (dia) => ({
          ...dia,
          passos: Math.max(dia.passos ?? 0, Math.round(previstos * fracaoDoDia(agora))),
        }))
        const comDia = { ...d, pulseiras, dias }
        return { ...comDia, alertas: recalcularAlertas(comDia, agora) }
      },
      enviarDiferencas
    )
  }, [])

  /** Guarda uma medição de batimentos no dia de hoje da pessoa. */
  const registrarMedicao = useCallback((pessoaId: string, bpm: number) => {
    const agora = new Date()
    aplicar(
      (d) => {
        const dias = comODiaDeHoje(d, pessoaId, (dia) => ({
          ...dia,
          batimentos: [...dia.batimentos, { em: agora.toISOString(), bpm }],
        }))
        const comDia = { ...d, dias }
        return { ...comDia, alertas: recalcularAlertas(comDia, agora) }
      },
      enviarDiferencas
    )
  }, [])

  const marcarAlerta = useCallback((id: string, lido: boolean) => {
    aplicar(
      (d) => ({ ...d, alertas: d.alertas.map((a) => (a.id === id ? { ...a, lido } : a)) }),
      () => enviar("PATCH", { colecao: "alertas", id, patch: { lido } })
    )
  }, [])

  const marcarTodosComoLidos = useCallback((pessoaId: string) => {
    aplicar(
      (d) => ({
        ...d,
        alertas: d.alertas.map((a): Alerta => (a.pessoaId === pessoaId ? { ...a, lido: true } : a)),
      }),
      enviarDiferencas
    )
  }, [])

  const trocarTudo = useCallback((novos: Dados) => {
    aplicar(
      () => novos,
      () => enviar("PUT", { dados: novos })
    )
  }, [])

  const restaurarExemplos = useCallback(() => trocarTudo(exemplosDeHoje()), [trocarTudo])
  const limparTudo = useCallback(() => {
    deixaDeSerExemplo()
    trocarTudo(VAZIO)
  }, [trocarTudo])

  return {
    dados,
    /** Ligado até saber onde os dados moram. A casca do app espera nele. */
    carregando,
    cadastrarPessoa,
    atualizarPessoa,
    removerPessoa,
    sincronizarPulseira,
    registrarMedicao,
    marcarAlerta,
    marcarTodosComoLidos,
    restaurarExemplos,
    limparTudo,
  }
}

// --- pessoa na tela -------------------------------------------------------

/**
 * Quem cuida acompanha de 1 a 3 pessoas, e todas as telas mostram uma de cada
 * vez. A escolha fica no navegador porque é preferência de quem olha, e não
 * dado de ninguém: dois cuidadores da mesma pessoa podem estar olhando pessoas
 * diferentes ao mesmo tempo.
 */
const ouvintesDaPessoa = new Set<Ouvinte>()
let pessoaCrua: string | null = null
let pessoaLida = false

function lerPessoaCrua() {
  if (!pessoaLida) {
    pessoaCrua = lerTexto(CHAVE_PESSOA)
    pessoaLida = true
  }
  return pessoaCrua
}

export function escolherPessoa(id: string) {
  gravarTexto(CHAVE_PESSOA, id)
  pessoaCrua = id
  pessoaLida = true
  for (const o of ouvintesDaPessoa) o()
}

function inscreverPessoa(o: Ouvinte) {
  ouvintesDaPessoa.add(o)
  return () => {
    ouvintesDaPessoa.delete(o)
  }
}

/** A pessoa que está na tela. Se a escolhida não existe mais, cai na primeira. */
export function usePessoaNaTela(): Pessoa | null {
  const { dados } = useSyncExternalStore(inscrever, lerInstantaneo, () => NO_SERVIDOR)
  const escolhida = useSyncExternalStore(inscreverPessoa, lerPessoaCrua, () => null)
  return dados.pessoas.find((p) => p.id === escolhida) ?? dados.pessoas[0] ?? null
}

// --- sessão ---------------------------------------------------------------

/**
 * A sessão também tem dois lados, pelo mesmo motivo dos dados.
 *
 * SEM GOOGLE CONFIGURADO, o `entrar()` aqui embaixo só guarda um nome no
 * navegador. Isso NÃO é autenticação: não protege nada, e some quando a pessoa
 * limpa os dados do site. É simulação, pras telas terem estado de logado.
 *
 * COM GOOGLE CONFIGURADO (as duas chaves e o AUTH_SECRET no `.env.local`), quem
 * manda é o cookie assinado que o servidor gravou depois do login de verdade.
 * Na primeira carga o app pergunta pro servidor quem está logado, e a resposta
 * ganha da simulação. Ver `src/lib/google.ts` e `src/lib/sessao-servidor.ts`.
 */

const ouvintesDaSessao = new Set<Ouvinte>()

/** Cache do valor cru do localStorage: o snapshot precisa de identidade estável. */
let sessaoCrua: string | null = null
let sessaoLida = false

function avisarSessao() {
  for (const o of ouvintesDaSessao) o()
}

function gravarSessaoLocal(sessao: Sessao | null) {
  try {
    if (sessao) window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
    else window.localStorage.removeItem(CHAVE_SESSAO)
  } catch {
    // Modo privado: a sessão vale só enquanto a aba estiver aberta.
  }
  sessaoCrua = sessao ? JSON.stringify(sessao) : null
  sessaoLida = true
  avisarSessao()
}

let perguntaDeSessao: Promise<void> | null = null

/**
 * Pergunta uma vez ao servidor se tem sessão assinada.
 *
 * Se tiver, ela substitui o que estiver guardado no navegador: o login de
 * verdade ganha da simulação, sempre.
 *
 * Se NÃO tiver, a sessão local fica onde está. Apagar ela aqui quebraria a
 * entrada local: quem entrou pela tela de entrar tem que continuar dentro do app
 * na próxima carga. Segurança de verdade não vem de derrubar essa sessão, vem
 * de cada rota de servidor exigir a sessão assinada antes de devolver dado, e
 * esse é o passo que vem junto com a API do CareTwin.
 */
function perguntarSessaoAoServidor() {
  if (perguntaDeSessao) return perguntaDeSessao

  perguntaDeSessao = (async () => {
    try {
      const resposta = await fetch("/api/auth/sessao", { cache: "no-store" })
      const corpo = (await resposta.json()) as { sessao: Sessao | null }
      if (corpo.sessao) gravarSessaoLocal(corpo.sessao)
    } catch {
      // Sem resposta do servidor, fica valendo o que o navegador tem.
    }
  })()

  return perguntaDeSessao
}

export function lerSessao(): Sessao | null {
  if (typeof window === "undefined") return null
  try {
    const bruto = window.localStorage.getItem(CHAVE_SESSAO)
    return bruto ? (JSON.parse(bruto) as Sessao) : null
  } catch {
    return null
  }
}

/** A entrada local, que continua existindo enquanto o Google não estiver ligado. */
export function entrar(nome = "Visitante", email = "voce@exemplo.com"): Sessao {
  const s: Sessao = { nome, email, entrouEm: new Date().toISOString() }
  if (typeof window !== "undefined") gravarSessaoLocal(s)
  return s
}

export function sair() {
  if (typeof window === "undefined") return
  gravarSessaoLocal(null)
  // O cookie do servidor precisa cair junto: sem isso, a próxima carga
  // perguntaria ao servidor, ele responderia a sessão antiga, e a pessoa
  // voltaria logada depois de clicar em sair.
  void fetch("/api/auth/sessao", { method: "DELETE" }).catch(() => {})
}

function inscreverSessao(o: Ouvinte) {
  ouvintesDaSessao.add(o)
  // Outra aba do mesmo app fez login ou logout.
  window.addEventListener("storage", avisarSessao)
  void perguntarSessaoAoServidor()
  return () => {
    ouvintesDaSessao.delete(o)
    window.removeEventListener("storage", avisarSessao)
  }
}

function lerSessaoCrua() {
  if (!sessaoLida) {
    try {
      sessaoCrua = window.localStorage.getItem(CHAVE_SESSAO)
    } catch {
      sessaoCrua = null
    }
    sessaoLida = true
  }
  return sessaoCrua
}

/** Lê a sessão só depois da hidratação, evitando divergência com o SSR. */
export function useSessao() {
  const sessao = useSyncExternalStore(inscreverSessao, lerSessaoCrua, () => null)

  try {
    return sessao ? (JSON.parse(sessao) as Sessao) : null
  } catch {
    return null
  }
}
