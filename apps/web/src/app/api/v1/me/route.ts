import { NextResponse } from "next/server"
import { situacaoDoUsuario } from "@/lib/familia"
import { erro, quemChama } from "@/lib/rota-v1"

/**
 * GET /v1/me: a conta, os pedidos que ainda esperam resposta e os
 * acompanhamentos encerrados que ainda dá para recuperar. Com isso e com
 * GET /v1/pessoas, o site escolhe a primeira tela.
 */

export const dynamic = "force-dynamic"

export async function GET() {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa
  try {
    const situacao = await situacaoDoUsuario(chamada.sessao.id)
    return NextResponse.json({ ...chamada.sessao, ...situacao })
  } catch (falha) {
    console.error("[api/v1/me]", falha)
    return erro(500, "Não deu certo agora. Tente de novo em alguns minutos.")
  }
}
