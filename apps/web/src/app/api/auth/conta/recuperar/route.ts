import { z } from "zod"
import { aceitar, contaLigada, lerCorpo, pedirNovaSenha, recusar } from "@/lib/conta"
import { EMAIL } from "../esquemas"

/**
 * Esqueci minha senha: pede ao Supabase o e-mail com o link de nova senha.
 *
 * Responde "ok" mesmo quando o e-mail não tem conta, de propósito. O link leva
 * para /entrar/nova-senha, que também precisa estar em "Redirect URLs".
 */

export async function POST(requisicao: Request) {
  if (!contaLigada()) return recusar("indisponivel")

  const corpo = await lerCorpo(requisicao, z.object({ email: EMAIL }))
  if (!corpo) return recusar("invalido")

  const retorno = new URL("/entrar/nova-senha", requisicao.url).toString()
  const resultado = await pedirNovaSenha(corpo.email, retorno)
  return resultado.ok ? aceitar(null) : recusar(resultado.motivo)
}
