"use client"

import { Badge, Button, Card } from "@/components/ui"
import { sistema } from "@/content/site"
import { cn } from "@/lib/cn"
import { preencher } from "@/lib/formato"
import type { Alerta } from "@/lib/types"
import { Icone } from "../icone"

const textos = sistema.alertas.lista

/**
 * Um alerta de mudança. O título diz o que mudou, o selo diz quanto e para
 * que lado, e o texto explica em palavras simples. Nada de vermelho e nada de
 * exclamação: é uma mudança a observar, não uma emergência.
 */
export function CartaoAlerta({ alerta, aoMarcar }: { alerta: Alerta; aoMarcar: (lido: boolean) => void }) {
  return (
    <Card className={cn("p-5", !alerta.lido && "border-warning/40")}>
      <article aria-labelledby={`titulo-${alerta.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h4 id={`titulo-${alerta.id}`} className="flex items-center gap-2 text-lg text-ink">
            <Icone nome={sistema.metricas[alerta.metrica].icone} className="size-5 text-[var(--ds-primary-accent)]" />
            {textos.titulos[alerta.metrica][alerta.direcao]}
          </h4>
          <div className="flex flex-wrap gap-2">
            {!alerta.lido && (
              <Badge variante="aviso">
                <Icone nome="alertas" className="size-3.5" />
                {textos.novo}
              </Badge>
            )}
            <Badge variante="neutra">
              <Icone nome={alerta.direcao} className="size-3.5" />
              {preencher(textos.desvio, { n: alerta.desvio, lado: textos.lado[alerta.direcao] })}
            </Badge>
          </div>
        </div>

        <p className="mt-3 text-base leading-relaxed text-ink">{alerta.texto}</p>
        <p className="mt-2 text-sm text-muted">{textos.escritoPelaIa}</p>

        <Button
          variante={alerta.lido ? "fantasma" : "secundaria"}
          onClick={() => aoMarcar(!alerta.lido)}
          iconeEsquerda={<Icone nome={alerta.lido ? "restaurar" : "lido"} />}
          className="mt-4"
        >
          {alerta.lido ? textos.marcarNovo : textos.marcarLido}
        </Button>
      </article>
    </Card>
  )
}
