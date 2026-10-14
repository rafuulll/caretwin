import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  bancoConfigurado,
  ehColecao,
  inserir,
  lerTudo,
  remover,
  atualizar,
  substituirTudo,
} from "@/lib/banco"
import { COOKIE_SESSAO, sessaoAutorizada } from "@/lib/sessao-servidor"
import type { Dados } from "@/lib/types"

/**
 * A porta do banco.
 *
 * Só o `store` fala com esta rota, e ele só fala quando o GET responde que o
 * banco está ligado. Enquanto não estiver, tudo isto responde `ligado: false` e
 * o app segue guardando no navegador, sem erro na tela e sem código apagado.
 *
 * Cada verbo faz uma coisa: GET lê tudo, POST cria, PATCH altera um campo,
 * DELETE apaga, PUT troca o conteúdo inteiro (é o "restaurar exemplos" e o
 * "limpar tudo" da tela de configurações).
 *
 * SOBRE PROTEÇÃO: com o banco ligado, todo verbo exige a sessão assinada de
 * `src/lib/sessao-servidor.ts` e que o e-mail dela esteja em
 * `EMAILS_PERMITIDOS`. Sem as duas coisas a resposta é 401 e nada é lido nem
 * gravado. Sem `AUTH_SECRET` ou sem a lista, a rota também fecha: errar para o
 * lado de recusar. Com o banco desligado nada disso é consultado, porque não
 * há dado nenhum para proteger.
 */

// Dados de gente não têm o que cachear: a resposta é sempre a de agora.
export const dynamic = "force-dynamic"

function desligado() {
  return NextResponse.json({ ligado: false, dados: null })
}

/**
 * O porteiro. Devolve `null` quando pode entrar, ou a resposta pronta de recusa.
 *
 * A recusa do GET traz `ligado: false` de propósito: é o que o `store` já sabe
 * ler, e quem não pode ver os dados cai nos exemplos do navegador em vez de
 * ver erro na tela.
 */
async function barrar() {
  const pote = await cookies()
  if (sessaoAutorizada(pote.get(COOKIE_SESSAO)?.value)) return null
  return NextResponse.json(
    { ligado: false, dados: null, erro: "entre com uma conta permitida para acessar os dados" },
    { status: 401 }
  )
}

export async function GET() {
  if (!bancoConfigurado()) return desligado()
  const recusa = await barrar()
  if (recusa) return recusa
  try {
    return NextResponse.json({ ligado: true, dados: await lerTudo() })
  } catch (erro) {
    // O banco existe mas não respondeu (conexão errada, projeto dormindo, rede
    // caída). Responder "desligado" é melhor que estourar: o app volta pro
    // navegador e a pessoa continua trabalhando.
    console.error("[dados] leitura falhou", erro)
    return desligado()
  }
}

export async function POST(requisicao: Request) {
  if (!bancoConfigurado()) return desligado()
  const recusa = await barrar()
  if (recusa) return recusa
  const corpo = (await requisicao.json()) as { colecao?: unknown; item?: { id?: string } }
  if (!ehColecao(corpo.colecao) || !corpo.item?.id) {
    return NextResponse.json({ erro: "requisição inválida" }, { status: 400 })
  }
  await inserir(corpo.colecao, corpo.item as { id: string })
  return NextResponse.json({ ok: true })
}

export async function PATCH(requisicao: Request) {
  if (!bancoConfigurado()) return desligado()
  const recusa = await barrar()
  if (recusa) return recusa
  const corpo = (await requisicao.json()) as {
    colecao?: unknown
    id?: unknown
    patch?: Record<string, unknown>
  }
  if (!ehColecao(corpo.colecao) || typeof corpo.id !== "string" || !corpo.patch) {
    return NextResponse.json({ erro: "requisição inválida" }, { status: 400 })
  }
  await atualizar(corpo.colecao, corpo.id, corpo.patch)
  return NextResponse.json({ ok: true })
}

export async function DELETE(requisicao: Request) {
  if (!bancoConfigurado()) return desligado()
  const recusa = await barrar()
  if (recusa) return recusa
  const corpo = (await requisicao.json()) as { colecao?: unknown; id?: unknown }
  if (!ehColecao(corpo.colecao) || typeof corpo.id !== "string") {
    return NextResponse.json({ erro: "requisição inválida" }, { status: 400 })
  }
  await remover(corpo.colecao, corpo.id)
  return NextResponse.json({ ok: true })
}

export async function PUT(requisicao: Request) {
  if (!bancoConfigurado()) return desligado()
  const recusa = await barrar()
  if (recusa) return recusa
  const corpo = (await requisicao.json()) as { dados?: Dados }
  const dados = corpo.dados
  if (
    !dados ||
    !Array.isArray(dados.pessoas) ||
    !Array.isArray(dados.pulseiras) ||
    !Array.isArray(dados.dias) ||
    !Array.isArray(dados.alertas)
  ) {
    return NextResponse.json({ erro: "requisição inválida" }, { status: 400 })
  }
  await substituirTudo(dados)
  return NextResponse.json({ ok: true })
}
