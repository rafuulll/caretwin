"use client"

import { useCallback, useSyncExternalStore } from "react"
import { v1, type Eu, type Papel, type PessoaComPulseira, type Resposta } from "./cliente-v1"
import { paraISO } from "./formato"
import { MINUTOS_PARA_RELER_A_CONTA } from "./modelo"
import { fracaoDoDia } from "./normal"
import { gerarExemplos, passosPrevistosParaHoje, recalcularAlertas } from "./seed"
import type { Alerta, Dados, DiaRegistrado, Pessoa, Pulseira, Sessao } from "./types"

/**
 * A ÚNICA porta de dados do CareTwin. Nenhuma tela lê ou grava por fora daqui.
 *
 * Ela tem dois lados, e escolhe sozinha qual usar:
 *
 *   NAVEGADOR, o padrão. Sem conta, tudo mora no localStorage, com os dados de
 *   exemplo. É o que faz `npm install && npm run dev` bastar: sem banco, sem
 *   conta em serviço nenhum, sem variável de ambiente.
 *
 *   CONTA. Quem entrou com e-mail e senha, com o banco ligado, vê só as
 *   pessoas da própria família, lidas das rotas de `src/app/api/v1`. É o
 *   `GET /v1/me` respondendo 200 que liga este lado.
 *
 * No lado da conta chegam as pessoas e as pulseiras e, de cada pessoa, os dias
 * que a pulseira mandou e os alertas (rotas do cartão 5.6, ligadas aqui no
 * cartão 7.3). As telas fazem a mesma conta do normal nos dois lados, então
 * nenhuma tela muda. Nada de exemplo aparece misturado com a família de alguém:
 * sem dias no banco, as telas dizem que os dados ainda não chegaram.
 */

const CHAVE_DADOS = "caretwin-prototipo:dados:v1"
const CHAVE_SESSAO = "caretwin-prototipo:sessao:v1"
/** Em que dia os exemplos guardados foram gerados. Ver `lerDoNavegador`. */
const CHAVE_EXEMPLOS = "caretwin-prototipo:exemplos:v1"
/** Qual das pessoas acompanhadas está na tela agora. */
const CHAVE_PESSOA = "caretwin-prototipo:pessoa:v1"

const VAZIO: Dados = { pessoas: [], pulseiras: [], dias: [], alertas: [] }

type Modo = "descobrindo" | "navegador" | "conta"

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

// --- descoberta do modo ---------------------------------------------------

let descoberta: Promise<void> | null = null

/**
 * Pergunta uma vez, no primeiro componente que monta, se existe uma conta
 * dentro com o banco ligado.
 *
 * Enquanto a resposta não chega, `carregando` fica ligado e a casca do app
 * mostra o esqueleto. É de propósito: mostrar os dados de exemplo primeiro e
 * trocar depois pelos de verdade seria piscar o dia de outra pessoa na tela.
 *
 * Qualquer resposta que não seja 200 (banco desligado, ninguém dentro, ou o
 * login com Google feito à mão, que não tem conta no banco) cai no navegador.
 */
function descobrirModo() {
  if (descoberta) return descoberta

  descoberta = (async () => {
    const eu = await v1.eu()
    if (eu.ok && (await carregarConta(eu.corpo))) {
      modo = "conta"
      acompanharConta()
      return
    }
    // O navegador lembra de uma conta (a sessão local tem id) e o servidor não
    // reconhece mais o cookie: a sessão venceu. Cair nos exemplos aqui seria
    // mostrar dados inventados para quem acha que está vendo a própria família.
    if (!eu.ok && eu.status === 401 && lerSessao()?.id) {
      sessaoExpirou()
      return
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
 * Aplica a mudança na tela e no navegador.
 *
 * No lado da conta, nada daqui vale: estas operações são as do protótipo
 * (sincronizar de exemplo, medir de exemplo, restaurar e limpar), e gravar
 * uma delas por cima da família de alguém seria inventar dado. As telas da
 * conta não mostram esses botões; esta trava é para o caso de algum escapar.
 */
function aplicar(proximo: (atual: Dados) => Dados) {
  if (modo === "conta") return
  const depois = proximo(instantaneo.dados)
  publicar(depois)
  gravarNoNavegador(depois)
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
    aplicar((d) => ({ ...d, pessoas: [...d.pessoas, pessoa], pulseiras: [...d.pulseiras, pulseira] }))
    return pessoa
  }, [])

  const atualizarPessoa = useCallback((id: string, patch: Partial<Pick<Pessoa, "nome" | "quemAcompanha">>) => {
    aplicar((d) => ({ ...d, pessoas: d.pessoas.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  }, [])

  /**
   * Remove a pessoa e tudo que só existia por causa dela: a pulseira, os dias
   * registrados e os alertas. Pulseira sem pessoa não mostra nada a ninguém, e
   * alerta de quem não está mais no app seria aviso falando sozinho.
   */
  const removerPessoa = useCallback((id: string) => {
    deixaDeSerExemplo()
    aplicar((d) => ({
      pessoas: d.pessoas.filter((p) => p.id !== id),
      pulseiras: d.pulseiras.filter((p) => p.pessoaId !== id),
      dias: d.dias.filter((dia) => dia.pessoaId !== id),
      alertas: d.alertas.filter((a) => a.pessoaId !== id),
    }))
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
    aplicar((d) => {
      const pulseiras = d.pulseiras.map((p) =>
        p.pessoaId === pessoaId
          ? { ...p, ultimaSincronizacao: agora.toISOString(), bateria: Math.max(5, (p.bateria ?? 100) - 1) }
          : p
      )
      const previstos = passosPrevistosParaHoje(pessoaId, hoje)
      const dias = comODiaDeHoje(d, pessoaId, (dia) => ({
        ...dia,
        passos: Math.max(dia.passos ?? 0, Math.round(previstos * fracaoDoDia(agora))),
      }))
      const comDia = { ...d, pulseiras, dias }
      return { ...comDia, alertas: recalcularAlertas(comDia, agora) }
    })
  }, [])

  /** Guarda uma medição de batimentos no dia de hoje da pessoa. */
  const registrarMedicao = useCallback((pessoaId: string, bpm: number) => {
    const agora = new Date()
    aplicar((d) => {
      const dias = comODiaDeHoje(d, pessoaId, (dia) => ({
        ...dia,
        batimentos: [...dia.batimentos, { em: agora.toISOString(), bpm }],
      }))
      const comDia = { ...d, dias }
      return { ...comDia, alertas: recalcularAlertas(comDia, agora) }
    })
  }, [])

  const marcarAlerta = useCallback((id: string, lido: boolean) => {
    if (modo === "conta") return marcarNaConta([id], lido)
    aplicar((d) => ({ ...d, alertas: d.alertas.map((a) => (a.id === id ? { ...a, lido } : a)) }))
  }, [])

  const marcarTodosComoLidos = useCallback((pessoaId: string) => {
    if (modo === "conta") {
      const novos = instantaneo.dados.alertas.filter((a) => a.pessoaId === pessoaId && !a.lido)
      return marcarNaConta(
        novos.map((a) => a.id),
        true
      )
    }
    aplicar((d) => ({
      ...d,
      alertas: d.alertas.map((a): Alerta => (a.pessoaId === pessoaId ? { ...a, lido: true } : a)),
    }))
  }, [])

  const trocarTudo = useCallback((novos: Dados) => {
    aplicar(() => novos)
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

// --- conta e família ------------------------------------------------------

/** Por pessoa: o papel de quem entrou e se administra a família. */
export type VinculoNaTela = { papel: Papel; administra: boolean }

/**
 * O que o lado da conta sabe além dos dados: quem entrou, o papel em cada
 * família e o que ainda espera resposta. `falhou` liga quando a conta respondeu
 * mas as pessoas não: a tela mostra "tente de novo" em vez de fingir que a
 * pessoa não tem família nenhuma.
 */
export type EstadoDaConta = {
  eu: Eu
  vinculos: Record<string, VinculoNaTela>
  falhou: boolean
}

let instantaneoConta: EstadoDaConta | null = null

function lerConta(): EstadoDaConta | null {
  return instantaneoConta
}

/**
 * No banco não existe o "quem acompanha" escrito à mão do protótipo: quem
 * acompanha são os membros da família, que a tela Família lista.
 */
function pessoaDaApi(p: PessoaComPulseira): Pessoa {
  return { id: p.id, nome: p.nome, quemAcompanha: "", criadoEm: p.criadoEm }
}

function pulseirasDaApi(pessoas: PessoaComPulseira[]): Pulseira[] {
  return pessoas.flatMap((p) =>
    p.pulseira
      ? [
          {
            id: p.pulseira.id,
            codigo: p.pulseira.codigo,
            pessoaId: p.id,
            bateria: p.pulseira.bateria,
            ultimaSincronizacao: p.pulseira.ultimaSincronizacao,
          },
        ]
      : []
  )
}

/**
 * A sessão do servidor venceu (ou o cookie sumiu) com o app aberto. Voltar
 * para a entrada é o único caminho honesto: as rotas não vão responder mais
 * nada para esta aba.
 */
function sessaoExpirou() {
  sair()
  window.location.assign("/entrar")
}

/** 401 só é "a sessão venceu" para quem já estava no lado da conta. */
function conferirRecusa<T>(resposta: Resposta<T>) {
  if (!resposta.ok && resposta.status === 401 && modo === "conta") sessaoExpirou()
}

/**
 * Cada leitura da conta ganha um número. Duas leituras podem se cruzar (a
 * releitura de 5 em 5 minutos e a de depois de aprovar um pedido, por
 * exemplo), e a que termina por último nem sempre é a que começou por último.
 * Só a mais nova publica.
 */
let ultimaLeitura = 0

type DoServidor = { dias: DiaRegistrado[]; alertas: Alerta[] }

/**
 * Os dias e os alertas de cada pessoa, lidos em paralelo (são de 1 a 3
 * pessoas). Se a leitura de uma pessoa falhar, ficam os dados que já estavam
 * na tela para ela: sumir com o dia de alguém por um tropeço da rede seria
 * mostrar "os dados ainda não chegaram" quando eles chegaram.
 */
async function lerDiasEAlertas(pessoas: PessoaComPulseira[]): Promise<DoServidor> {
  const anteriores = instantaneo.dados
  const lidas = await Promise.all(
    pessoas.map(async (p) => {
      const [dias, alertas] = await Promise.all([v1.dias(p.id), v1.alertas(p.id)])
      return { pessoaId: p.id, dias, alertas }
    })
  )
  const resultado: DoServidor = { dias: [], alertas: [] }
  for (const { pessoaId, dias, alertas } of lidas) {
    conferirRecusa(dias)
    conferirRecusa(alertas)
    resultado.dias.push(...(dias.ok ? dias.corpo : anteriores.dias.filter((d) => d.pessoaId === pessoaId)))
    resultado.alertas.push(
      ...(alertas.ok ? alertas.corpo : anteriores.alertas.filter((a) => a.pessoaId === pessoaId))
    )
  }
  return resultado
}

/**
 * Lê a conta, as pessoas, os dias e os alertas, e publica tudo junto, uma vez
 * só, para a tela não mostrar a pessoa sem os dias por um instante. Devolve
 * `false` só quando nem a conta respondeu, que é o sinal de não estar no lado
 * da conta.
 */
async function carregarConta(euJaLido?: Eu): Promise<boolean> {
  const leitura = ++ultimaLeitura
  let eu = euJaLido
  if (!eu) {
    const resposta = await v1.eu()
    if (!resposta.ok) {
      conferirRecusa(resposta)
      return false
    }
    eu = resposta.corpo
  }

  const pessoas = await v1.pessoas()
  if (!pessoas.ok) {
    conferirRecusa(pessoas)
    if (leitura !== ultimaLeitura) return true
    instantaneoConta = { eu, vinculos: instantaneoConta?.vinculos ?? {}, falhou: true }
    publicar(instantaneo.carregando ? VAZIO : instantaneo.dados)
    return true
  }

  const { dias, alertas } = await lerDiasEAlertas(pessoas.corpo)
  if (leitura !== ultimaLeitura) return true

  instantaneoConta = {
    eu,
    vinculos: Object.fromEntries(
      pessoas.corpo.map((p) => [p.id, { papel: p.papel, administra: p.administra }])
    ),
    falhou: false,
  }
  publicar({ pessoas: pessoas.corpo.map(pessoaDaApi), pulseiras: pulseirasDaApi(pessoas.corpo), dias, alertas })
  return true
}

/**
 * Marcar alertas no lado da conta. A tela muda na hora, sem esperar a rede,
 * porque é o que a pessoa acabou de pedir. Se o servidor recusar algum, a conta
 * é relida e a tela volta ao que o banco diz: nunca fica mostrando "lido" num
 * alerta que continua novo para o resto da família.
 */
function marcarNaConta(ids: string[], lido: boolean) {
  if (ids.length === 0) return
  const escolhidos = new Set(ids)
  publicar({
    ...instantaneo.dados,
    alertas: instantaneo.dados.alertas.map((a) => (escolhidos.has(a.id) ? { ...a, lido } : a)),
  })
  void Promise.all(ids.map((id) => v1.marcarAlerta(id, lido))).then((respostas) => {
    const recusa = respostas.find((r) => !r.ok)
    if (!recusa) return
    conferirRecusa(recusa)
    void carregarConta()
  })
}

/**
 * Com o app aberto, a pulseira continua mandando dias. A conta é relida quando
 * a aba volta a aparecer (a pessoa voltou para o app) e de tempos em tempos
 * enquanto ela está à vista, para o dia novo aparecer sem recarregar a página.
 * Aba escondida não lê nada: seria gastar rede e banco sem ninguém olhando.
 */
let relogioDaConta: number | null = null

function aoVoltarParaAba() {
  if (modo === "conta" && document.visibilityState === "visible") void carregarConta()
}

function acompanharConta() {
  if (relogioDaConta !== null) return
  relogioDaConta = window.setInterval(aoVoltarParaAba, MINUTOS_PARA_RELER_A_CONTA * 60_000)
  document.addEventListener("visibilitychange", aoVoltarParaAba)
}

function pararDeAcompanhar() {
  if (relogioDaConta === null) return
  window.clearInterval(relogioDaConta)
  relogioDaConta = null
  document.removeEventListener("visibilitychange", aoVoltarParaAba)
}

/** Relê a conta depois de qualquer mudança na família, para todas as telas verem a mesma coisa. */
export function recarregarConta() {
  return carregarConta()
}

/**
 * Depois de uma mudança: deu certo, ou a pessoa sumiu no meio do caminho (404,
 * outra conta mexeu antes), a conta é relida. A resposta volta intacta para a
 * tela escolher a frase.
 */
async function depoisDeMudar<T>(resposta: Resposta<T>): Promise<Resposta<T>> {
  conferirRecusa(resposta)
  if (resposta.ok || resposta.status === 404) await carregarConta()
  return resposta
}

async function lendo<T>(resposta: Promise<Resposta<T>>): Promise<Resposta<T>> {
  const lida = await resposta
  conferirRecusa(lida)
  return lida
}

/**
 * O que as telas da família podem fazer. Cada função devolve a resposta da
 * rota, com o `codigo` do contrato quando não deu certo.
 */
export const familia = {
  ligarPulseira: (entrada: { codigo: string; papel: Papel; nome?: string }) =>
    v1.digitarCodigo(entrada).then(depoisDeMudar),
  membros: (pessoaId: string) => lendo(v1.membros(pessoaId)),
  pedidos: (pessoaId: string) => lendo(v1.pedidos(pessoaId)),
  aprovar: (pessoaId: string, usuarioId: string) => v1.aprovar(pessoaId, usuarioId).then(depoisDeMudar),
  recusar: (pessoaId: string, usuarioId: string) => v1.recusar(pessoaId, usuarioId).then(depoisDeMudar),
  removerMembro: (pessoaId: string, usuarioId: string) =>
    v1.removerMembro(pessoaId, usuarioId).then(depoisDeMudar),
  /** Sair da família ou desistir de um pedido. */
  sair: (pessoaId: string) => v1.sair(pessoaId).then(depoisDeMudar),
  encerrar: (pessoaId: string, confirmacao: string) =>
    v1.encerrar(pessoaId, confirmacao).then(depoisDeMudar),
  recuperar: (pessoaId: string) => v1.recuperar(pessoaId).then(depoisDeMudar),
}

/** `null` no lado do navegador. Com conta, quem entrou e o papel em cada família. */
export function useConta(): EstadoDaConta | null {
  return useSyncExternalStore(inscrever, lerConta, () => null)
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
    sessaoConferida = true
    avisarSessao()
  })()

  return perguntaDeSessao
}

/**
 * Ligado depois que o servidor respondeu quem entrou (ou não respondeu).
 *
 * Quem acabou de entrar com e-mail e senha chega no app só com o cookie: a
 * sessão do navegador ainda está vazia até esta resposta. Decidir "não tem
 * ninguém, volta para entrar" antes dela mandava a pessoa de volta para a
 * tela de entrar logo depois de entrar.
 */
let sessaoConferida = false

function lerSessaoConferida() {
  return sessaoConferida
}

export function useSessaoConferida() {
  return useSyncExternalStore(inscreverSessao, lerSessaoConferida, () => false)
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
  // A próxima conta (ou a entrada local) começa do zero: sem isso, a família de
  // quem saiu continuaria na memória da aba até a página recarregar.
  modo = "descobrindo"
  descoberta = null
  pararDeAcompanhar()
  instantaneoConta = null
  publicar(VAZIO, true)
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
