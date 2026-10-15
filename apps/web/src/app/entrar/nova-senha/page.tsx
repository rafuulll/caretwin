import { FormularioNovaSenha } from "@/components/auth/formulario-nova-senha"
import { contaLigada } from "@/lib/conta"

/**
 * Para onde leva o link de "esqueci minha senha". O token chega depois do #,
 * então quem lê é o formulário, no navegador. O servidor só diz se o login com
 * e-mail está ligado neste ambiente.
 */

export const dynamic = "force-dynamic"

export default function PaginaNovaSenha() {
  return <FormularioNovaSenha ligado={contaLigada()} />
}
