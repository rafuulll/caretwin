import { z } from "zod"
import { aceitar, contaLigada, entrarComSenha, lerCorpo, recusar } from "@/lib/conta"
import { EMAIL, SENHA_ATUAL } from "../esquemas"

/**
 * Entrar com e-mail e senha.
 *
 * O Supabase confere a senha; dando certo, o cookie assinado é gravado e a
 * pessoa está dentro. A resposta de erro é só um motivo curto, que a tela
 * transforma em texto.
 */

export async function POST(requisicao: Request) {
  if (!contaLigada()) return recusar("indisponivel")

  const corpo = await lerCorpo(requisicao, z.object({ email: EMAIL, senha: SENHA_ATUAL }))
  if (!corpo) return recusar("invalido")

  const resultado = await entrarComSenha(corpo.email, corpo.senha)
  return resultado.ok ? aceitar(resultado.sessao) : recusar(resultado.motivo)
}
