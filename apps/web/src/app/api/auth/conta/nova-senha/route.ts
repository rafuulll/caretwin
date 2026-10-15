import { z } from "zod"
import { aceitar, contaLigada, lerCorpo, recusar, trocarSenha } from "@/lib/conta"
import { SENHA_NOVA, TOKEN } from "../esquemas"

/**
 * Grava a senha nova.
 *
 * O token chega do link do e-mail, lido pela página no navegador (o Supabase
 * coloca ele depois do #, que nunca vai para servidor nenhum sozinho). Ele
 * prova que a pessoa abriu o e-mail, e vale uma vez só.
 */

export async function POST(requisicao: Request) {
  if (!contaLigada()) return recusar("indisponivel")

  const corpo = await lerCorpo(requisicao, z.object({ token: TOKEN, senha: SENHA_NOVA }))
  if (!corpo) return recusar("invalido")

  const resultado = await trocarSenha(corpo.token, corpo.senha)
  return resultado.ok ? aceitar(resultado.sessao) : recusar(resultado.motivo)
}
