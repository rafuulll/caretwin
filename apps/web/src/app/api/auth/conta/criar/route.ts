import { z } from "zod"
import { aceitar, contaLigada, criarConta, lerCorpo, recusar } from "@/lib/conta"
import { EMAIL, NOME, SENHA_NOVA } from "../esquemas"

/**
 * Criar conta.
 *
 * O link de confirmação que o Supabase manda leva de volta para a tela de
 * entrar, com o aviso de e-mail confirmado. O endereço é montado a partir do
 * que o navegador está usando, igual ao retorno do Google, e só funciona se
 * estiver liberado em "Redirect URLs" no painel do Supabase.
 */

export async function POST(requisicao: Request) {
  if (!contaLigada()) return recusar("indisponivel")

  const corpo = await lerCorpo(
    requisicao,
    z.object({ nome: NOME, email: EMAIL, senha: SENHA_NOVA })
  )
  if (!corpo) return recusar("invalido")

  const retorno = new URL("/entrar?conta=confirmada", requisicao.url).toString()
  const resultado = await criarConta(corpo.nome, corpo.email, corpo.senha, retorno)
  if (!resultado.ok) return recusar(resultado.motivo)

  // `confirmar: true` diz à tela para mostrar "abra o link no seu e-mail" em
  // vez de mandar a pessoa para dentro do app.
  return aceitar(resultado.sessao, { confirmar: resultado.sessao === null })
}
