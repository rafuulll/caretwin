import { Icone } from "@/components/app/icone"
import { Card } from "@/components/ui"
import { cn } from "@/lib/cn"

/**
 * Um número do dia.
 *
 * Não calcula nada de propósito: recebe o valor já formatado. Quem decide o que
 * é "dormiu bem" é a página. O cartão só sabe desenhar.
 *
 * Vai dentro de um `<dl>`: o rótulo é o termo (`dt`) e o número é a definição
 * (`dd`). Num leitor de tela isso vira "Dormiu: 7 h 05" em vez de dois
 * pedaços soltos de texto.
 */
type PropsCartaoMetrica = {
  /** Nome do mapa em `components/app/icone.tsx`. */
  icone: string
  rotulo: string
  /** Já formatado (`duracao()`, `numero()`). O cartão exibe como veio. */
  valor: string
  /** De onde o número saiu. É o que transforma um número grande em informação. */
  dica?: string
}

export function CartaoMetrica({ icone, rotulo, valor, dica }: PropsCartaoMetrica) {
  // "Nenhuma vez" tem o dobro do comprimento de "22:50". Sem baixar um degrau
  // de tipo, ele quebra em duas linhas e desalinha a fileira de cartões.
  const valorLongo = valor.length > 9

  return (
    <Card className="p-5">
      {/* `min-h-10` = duas linhas de rótulo. Sem isso, "Dormiu" (uma
          linha) sobe o número 4px e a fileira de cartões perde a linha de base. */}
      <dt className="flex min-h-10 items-start justify-between gap-3">
        <span className="text-sm font-medium text-ink">{rotulo}</span>
        {/* Disco elevado em vez de quadrado tingido: o ícone vira um objeto
            apoiado no cartão, não uma mancha da cor de ação. */}
        <span
          aria-hidden="true"
          className="superficie-elevada grid size-10 shrink-0 place-items-center rounded-full text-primary [&_svg]:size-[18px]"
        >
          <Icone nome={icone} />
        </span>
      </dt>

      <dd className="mt-3">
        <span
          className={cn(
            "block font-display leading-none tabular-nums text-ink",
            valorLongo ? "text-[26px] sm:text-3xl" : "text-3xl sm:text-4xl"
          )}
        >
          {valor}
        </span>
        {dica && <span className="mt-2 block text-xs leading-snug text-muted">{dica}</span>}
      </dd>
    </Card>
  )
}
