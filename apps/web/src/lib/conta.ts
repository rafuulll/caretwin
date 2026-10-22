import { NextResponse } from "next/server"
import type { z } from "zod"
import {
  COOKIE_SESSAO,
  criarCookieDeSessao,
  opcoesDoCookie,
  sessaoConfigurada,
} from "./sessao-servidor"
import type { Sessao } from "./types"

/**
 * Contas com e-mail e senha, guardadas no Supabase Auth.
 *
 * Quem confere a senha, manda o e-mail de confirmação e cuida do "esqueci
 * minha senha" é o Supabase. Este arquivo conversa com ele por HTTP, do mesmo
 * jeito que `google.ts` conversa com o Google: sem biblioteca, para que cada
 * ida e volta fique visível.
 *
 * Depois que o Supabase aceita a senha, a sessão do app é o mesmo cookie
 * assinado de `sessao-servidor.ts`, e o token do Supabase é encerrado na hora.
 * O backend lê o banco pela DATABASE_URL, não em nome da pessoa, então guardar
 * esse token só criaria mais um segredo para proteger.
 *
 * A consequência: bloquear uma conta no painel do Supabase impede o próximo
 * login, mas não derruba quem já está dentro até o cookie vencer (30 dias).
 * Para derrubar todo mundo na hora, troque o AUTH_SECRET.
 *
 * Todas as chamadas saem do servidor do app, então o limite de tentativas do
 * Supabase conta por servidor, não por pessoa. Para um protótipo com poucas
 * contas isso basta; com muita gente, vale repassar o IP de quem tenta.
 *
 * Só as rotas de `src/app/api/auth/conta` e as páginas de entrar importam este
 * arquivo. Ele roda no servidor e a chave nunca chega no navegador.
 */

function configuracao() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "")
  const chave = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  // Só https: a senha da pessoa viaja nessa chamada.
  if (!url || !chave || !url.startsWith("https://")) return null
  return { url, chave }
}

export function contaConfigurada(): boolean {
  return configuracao() !== null
}

/** O login por conta só liga com o Supabase E com o segredo que assina a sessão. */
export function contaLigada(): boolean {
  return contaConfigurada() && sessaoConfigurada()
}

/** Os motivos de recusa que a tela sabe explicar. Os textos ficam em `site.ts`. */
export type MotivoDaConta =
  | "credenciais"
  | "nao_confirmado"
  | "senha_fraca"
  | "senha_igual"
  | "ja_existe"
  | "cadastro_fechado"
  | "muitas_tentativas"
  | "link_expirado"
  | "invalido"
  | "indisponivel"
  | "falhou"

export type ResultadoDaConta =
  | { ok: true; sessao: Sessao | null }
  | { ok: false; motivo: MotivoDaConta }

type UsuarioDoSupabase = {
  id?: string
  email?: string
  user_metadata?: { nome?: unknown }
}

/**
 * O que o Supabase devolve. O formato muda conforme a rota: o login devolve
 * `{ access_token, user }`, o cadastro com confirmação devolve o usuário solto,
 * e o erro traz `error_code`.
 */
type RespostaDoSupabase = UsuarioDoSupabase & {
  access_token?: string
  user?: UsuarioDoSupabase
  /** Com o cabeçalho de versão abaixo, o motivo do erro vem aqui, como texto. */
  code?: string | number
  /** O formato antigo do mesmo motivo. Lido também, para não depender da versão. */
  error_code?: string
}

type Pedido = {
  metodo: "POST" | "PUT"
  corpo?: unknown
  /** O token de quem já provou ser dono da conta (o link de nova senha). */
  token?: string
  /** Para onde o link do e-mail leva a pessoa. Precisa estar liberado no Supabase. */
  retorno?: string
}

async function pedir(caminho: string, pedido: Pedido) {
  const config = configuracao()
  if (!config) return null

  const url = new URL(`${config.url}/auth/v1${caminho}`)
  if (pedido.retorno) url.searchParams.set("redirect_to", pedido.retorno)

  try {
    const resposta = await fetch(url, {
      method: pedido.metodo,
      headers: {
        apikey: config.chave,
        "Content-Type": "application/json",
        // Fixa o formato das respostas de erro, que mudou entre versões do Supabase.
        "X-Supabase-Api-Version": "2024-01-01",
        ...(pedido.token ? { Authorization: `Bearer ${pedido.token}` } : {}),
      },
      body: pedido.corpo === undefined ? undefined : JSON.stringify(pedido.corpo),
      cache: "no-store",
    })
    const corpo = (await resposta.json().catch(() => ({}))) as RespostaDoSupabase
    return { ok: resposta.ok, status: resposta.status, corpo }
  } catch {
    // Rede fora ou Supabase fora: para a pessoa, é o mesmo "tente daqui a pouco".
    return { ok: false, status: 0, corpo: {} as RespostaDoSupabase }
  }
}

/**
 * Traduz o erro do Supabase num motivo nosso.
 *
 * A mensagem original nunca vai para a tela: ela é em inglês e às vezes conta
 * mais do que quem está sondando o app deveria saber.
 */
function motivoDoErro(status: number, corpo: RespostaDoSupabase, padrao: MotivoDaConta): MotivoDaConta {
  const codigo = typeof corpo.code === "string" ? corpo.code : corpo.error_code
  switch (codigo) {
    case "invalid_credentials":
      return "credenciais"
    case "email_not_confirmed":
      return "nao_confirmado"
    case "weak_password":
      return "senha_fraca"
    case "same_password":
      return "senha_igual"
    case "user_already_exists":
    case "email_exists":
      return "ja_existe"
    case "signup_disabled":
      return "cadastro_fechado"
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "muitas_tentativas"
    case "otp_expired":
    case "bad_jwt":
    case "session_not_found":
    case "session_expired":
    case "user_not_found":
      return "link_expirado"
    case "validation_failed":
    case "email_address_invalid":
      return "invalido"
  }
  if (status === 429) return "muitas_tentativas"
  if (status === 0 || status >= 500) return "indisponivel"
  return padrao
}

function sessaoDe(usuario: UsuarioDoSupabase | undefined): Sessao | null {
  if (!usuario?.id || !usuario.email) return null
  const nome = typeof usuario.user_metadata?.nome === "string" ? usuario.user_metadata.nome.trim() : ""
  return {
    id: usuario.id,
    nome: nome || usuario.email.split("@")[0],
    email: usuario.email,
    entrouEm: new Date().toISOString(),
  }
}

/**
 * Encerra o token que o Supabase acabou de dar. A sessão do app é o cookie, e
 * um token esquecido vivo seria uma porta a mais. Falhar aqui não impede a
 * entrada: o token venceria sozinho em uma hora.
 */
async function encerrarToken(token: string | undefined) {
  if (token) await pedir("/logout?scope=local", { metodo: "POST", token })
}

export async function entrarComSenha(email: string, senha: string): Promise<ResultadoDaConta> {
  const r = await pedir("/token?grant_type=password", {
    metodo: "POST",
    corpo: { email, password: senha },
  })
  if (!r) return { ok: false, motivo: "indisponivel" }
  if (!r.ok) return { ok: false, motivo: motivoDoErro(r.status, r.corpo, "credenciais") }

  await encerrarToken(r.corpo.access_token)
  const sessao = sessaoDe(r.corpo.user)
  return sessao ? { ok: true, sessao } : { ok: false, motivo: "falhou" }
}

/**
 * Cria a conta. Com a confirmação de e-mail ligada no Supabase (o padrão), ela
 * nasce sem sessão, e a resposta é `sessao: null`: a pessoa precisa abrir o
 * link antes de entrar. Com a confirmação desligada, já sai entrando.
 */
export async function criarConta(
  nome: string,
  email: string,
  senha: string,
  retorno: string
): Promise<ResultadoDaConta> {
  const r = await pedir("/signup", {
    metodo: "POST",
    corpo: { email, password: senha, data: { nome } },
    retorno,
  })
  if (!r) return { ok: false, motivo: "indisponivel" }
  if (!r.ok) return { ok: false, motivo: motivoDoErro(r.status, r.corpo, "falhou") }
  if (!r.corpo.access_token) return { ok: true, sessao: null }

  await encerrarToken(r.corpo.access_token)
  const sessao = sessaoDe(r.corpo.user)
  return sessao ? { ok: true, sessao } : { ok: false, motivo: "falhou" }
}

/** A última resposta de `cadastroAberto`, para não consultar o Supabase a cada visita. */
let cadastroLido: { aberto: boolean; em: number } | null = null
const SEGUNDOS_PARA_RELER_O_CADASTRO = 60

/**
 * Se o Supabase aceita contas novas ("Allow new users to sign up"). Durante o
 * protótipo o cadastro fica fechado e as contas nascem pelo painel (cartões
 * 5.11 e 5.12); a tela de entrar troca o link "Criar conta" por um aviso.
 *
 * Na dúvida (Supabase fora do ar, resposta estranha), diz que está aberto: o
 * link aparece, e se o cadastro estiver mesmo fechado a própria tentativa
 * responde `cadastro_fechado`. Esconder o link por engano seria pior.
 */
export async function cadastroAberto(): Promise<boolean> {
  const config = configuracao()
  if (!config) return true
  const agora = Date.now()
  if (cadastroLido && agora - cadastroLido.em < SEGUNDOS_PARA_RELER_O_CADASTRO * 1000) {
    return cadastroLido.aberto
  }
  try {
    const resposta = await fetch(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.chave },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    })
    if (!resposta.ok) return true
    const corpo = (await resposta.json()) as { disable_signup?: unknown }
    const aberto = corpo.disable_signup !== true
    cadastroLido = { aberto, em: agora }
    return aberto
  } catch {
    return true
  }
}

/**
 * Pede o link de nova senha. A resposta é a mesma exista ou não a conta: dizer
 * "esse e-mail não está cadastrado" ensinaria a qualquer um quem usa o app.
 */
export async function pedirNovaSenha(email: string, retorno: string): Promise<ResultadoDaConta> {
  const r = await pedir("/recover", { metodo: "POST", corpo: { email }, retorno })
  if (!r) return { ok: false, motivo: "indisponivel" }
  if (!r.ok) {
    const motivo = motivoDoErro(r.status, r.corpo, "falhou")
    if (motivo === "muitas_tentativas" || motivo === "indisponivel") return { ok: false, motivo }
  }
  return { ok: true, sessao: null }
}

/** Troca a senha com o token que veio no link do e-mail, e já entra. */
export async function trocarSenha(token: string, senha: string): Promise<ResultadoDaConta> {
  const r = await pedir("/user", { metodo: "PUT", corpo: { password: senha }, token })
  if (!r) return { ok: false, motivo: "indisponivel" }
  if (!r.ok) {
    const padrao = r.status === 401 || r.status === 403 ? "link_expirado" : "falhou"
    return { ok: false, motivo: motivoDoErro(r.status, r.corpo, padrao) }
  }

  await encerrarToken(token)
  const sessao = sessaoDe(r.corpo)
  return sessao ? { ok: true, sessao } : { ok: false, motivo: "falhou" }
}

// --- o que as rotas usam ---------------------------------------------------

const STATUS: Partial<Record<MotivoDaConta, number>> = {
  credenciais: 401,
  link_expirado: 401,
  nao_confirmado: 403,
  ja_existe: 409,
  cadastro_fechado: 403,
  muitas_tentativas: 429,
  indisponivel: 503,
}

export function recusar(motivo: MotivoDaConta) {
  return NextResponse.json({ ok: false, motivo }, { status: STATUS[motivo] ?? 400 })
}

/** Responde que deu certo e, se houver sessão, grava o cookie assinado. */
export function aceitar(sessao: Sessao | null, extra: Record<string, unknown> = {}) {
  const resposta = NextResponse.json({ ok: true, ...extra })
  if (sessao) {
    const cookie = criarCookieDeSessao(sessao)
    if (!cookie) return recusar("indisponivel")
    resposta.cookies.set(COOKIE_SESSAO, cookie, opcoesDoCookie())
  }
  return resposta
}

/**
 * Lê e confere o corpo da requisição.
 *
 * Exigir `Content-Type: application/json` não é capricho: um formulário de
 * outro site não consegue mandar esse cabeçalho sem a permissão do navegador,
 * então isso fecha a porta para alguém postar nestas rotas a partir de outra
 * página com a pessoa logada.
 */
export async function lerCorpo<S extends z.ZodType>(
  requisicao: Request,
  esquema: S
): Promise<z.infer<S> | null> {
  if (!requisicao.headers.get("content-type")?.includes("application/json")) return null
  try {
    const resultado = esquema.safeParse(await requisicao.json())
    return resultado.success ? resultado.data : null
  } catch {
    return null
  }
}
