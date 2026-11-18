import { NextResponse } from "next/server"
import { z } from "zod"
import { bancoConfigurado } from "@/lib/banco"
import { aceitar, contaLigada, entrarComSenha, lerCorpo, recusar } from "@/lib/conta"
import { exclusaoDaConta, reativarConta } from "@/lib/familia"
import { registrarFalha } from "@/lib/registro"
import { EMAIL, SENHA_ATUAL } from "../esquemas"

/**
 * Entrar com e-mail e senha.
 *
 * O Supabase confere a senha; dando certo, o cookie assinado é gravado e a
 * pessoa está dentro. A resposta de erro é só um motivo curto, que a tela
 * transforma em texto.
 *
 * Conta excluída há menos de 30 dias (migração 0007): a senha certa não entra
 * direto. A resposta é `conta_excluida` com a data em que ela será apagada, e a
 * tela oferece "Recuperar minha conta", que manda o mesmo pedido com
 * `reativar: true`. Só quem sabe a senha recupera.
 */

export async function POST(requisicao: Request) {
  if (!contaLigada()) return recusar("indisponivel")

  const corpo = await lerCorpo(
    requisicao,
    z.object({ email: EMAIL, senha: SENHA_ATUAL, reativar: z.boolean().optional() })
  )
  if (!corpo) return recusar("invalido")

  const resultado = await entrarComSenha(corpo.email, corpo.senha)
  if (!resultado.ok) return recusar(resultado.motivo)

  const id = resultado.sessao?.id
  if (id && bancoConfigurado()) {
    try {
      const exclusao = await exclusaoDaConta(id)
      if (exclusao) {
        // Passou do prazo e a tarefa diária ainda não rodou: para quem tenta, a conta já não existe.
        if (exclusao.vencida) return recusar("credenciais")
        if (!corpo.reativar) {
          return NextResponse.json(
            { ok: false, motivo: "conta_excluida", apagaEm: exclusao.apagaEm },
            { status: 403 }
          )
        }
        if (!(await reativarConta(id))) return recusar("credenciais")
        return aceitar(resultado.sessao, { reativada: true })
      }
    } catch (falha) {
      registrarFalha("api/auth/conta/entrar", falha)
      return recusar("indisponivel")
    }
  }

  return aceitar(resultado.sessao)
}
