import { Badge, type VarianteBadge } from "@/components/ui"
import { sistema } from "@/content/site"
import { ehBoaNoticia, type Metrica, type Situacao } from "@/lib/modelo"
import { Icone } from "./icone"

const VARIANTE: Record<Situacao, VarianteBadge> = {
  dentro: "sucesso",
  abaixo: "aviso",
  acima: "aviso",
  aprendendo: "neutra",
}

/**
 * Como um valor fica em relação ao normal da pessoa.
 *
 * Fora do normal é tom de ATENÇÃO, e nunca vermelho: o CareTwin conta uma
 * mudança, não dá alarme. E a situação nunca é só a cor: o ícone e o texto
 * dizem a mesma coisa pra quem não distingue o verde do âmbar.
 *
 * Com a métrica, passos acima do normal viram boa notícia (`ehBoaNoticia`):
 * selo verde e "Mais ativo que o normal".
 */
export function SeloSituacao({
  situacao,
  metrica,
  className,
}: {
  situacao: Situacao
  metrica?: Metrica
  className?: string
}) {
  const boa = metrica !== undefined && situacao === "acima" && ehBoaNoticia(metrica, situacao)
  return (
    <Badge variante={boa ? "sucesso" : VARIANTE[situacao]} className={className}>
      <Icone nome={situacao} className="size-3.5" />
      {boa ? sistema.maisAtivo : sistema.situacoes[situacao]}
    </Badge>
  )
}
