import { Beneficios } from "@/components/marketing/beneficios"
import { CabecalhoMarketing } from "@/components/marketing/cabecalho-marketing"
import { ComoFunciona } from "@/components/marketing/como-funciona"
import { Divisor } from "@/components/marketing/divisor"
import { Heroi } from "@/components/marketing/heroi"
import { NormalDeCadaUm } from "@/components/marketing/normal-de-cada-um"
import { RodapeMarketing } from "@/components/marketing/rodape-marketing"
import { Tour } from "@/components/onboarding/tour"

/**
 * O site do CareTwin, na raiz. Ele fala com quem chega: o que o CareTwin é,
 * pra quem é e o que a pessoa ganha. Quatro dobras, nesta ordem:
 *
 *   1. A abertura: a promessa em uma frase, com a prévia do app.
 *   2. O normal de cada um: a dobra viva, com os dados de exemplo desenhados.
 *   3. O que muda no dia: os quatro benefícios.
 *   4. O percurso do dia: um passo por momento de quem usa.
 *
 * As dobras de preço e de time (`planos.tsx` e `time.tsx`) continuam na pasta
 * sem entrar aqui: o CareTwin não é vendido e não apresenta time.
 *
 * Tudo é servidor, uma dobra por arquivo. O único pedaço que roda no navegador é o fundo
 * vivo da abertura, que entra depois de o texto já estar na tela.
 */
export default function PaginaInicial() {
  return (
    <div className="flex min-h-dvh flex-col">
      <CabecalhoMarketing />

      {/* A primeira parada do tour de boas-vindas mora aqui, ancorada no botão
          de entrar. Da segunda em diante, quem retoma é a casca do app. */}
      <Tour />

      {/* `tabIndex={-1}` é o que faz o "Pular para o conteúdo" realmente mover
          o foco para cá, e não só rolar a página. */}
      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <Heroi />
        <Divisor />
        <NormalDeCadaUm />
        <Divisor />
        <Beneficios />
        <ComoFunciona />
      </main>

      <RodapeMarketing />
    </div>
  )
}
