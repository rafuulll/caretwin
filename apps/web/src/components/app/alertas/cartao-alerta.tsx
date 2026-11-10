"use client"

import { useState } from "react"
import { Badge, Button, Card } from "@/components/ui"
import { sistema } from "@/content/site"
import { cn } from "@/lib/cn"
import { preencher } from "@/lib/formato"
import { ehBoaNoticia } from "@/lib/modelo"
import { ia, useConta } from "@/lib/store"
import type { Alerta, ExplicacaoDoAlerta } from "@/lib/types"
import { Icone } from "../icone"

const textos = sistema.alertas.lista

/**
 * Um alerta de mudança. O título diz o que mudou, o selo diz quanto e para
 * que lado, e o texto explica em palavras simples. Nada de vermelho e nada de
 * exclamação: é uma mudança a observar, não uma emergência.
 *
 * Passos acima do normal são boa notícia (`ehBoaNoticia`): título "Mais ativo
 * que o normal" e verde no lugar do âmbar, sempre com ícone e texto.
 */
export function CartaoAlerta({ alerta, aoMarcar }: { alerta: Alerta; aoMarcar: (lido: boolean) => void }) {
  const boa = ehBoaNoticia(alerta.metrica, alerta.direcao)
  const conta = useConta()
  const [explicacao, setExplicacao] = useState<ExplicacaoDoAlerta | null>(null)
  const [explicando, setExplicando] = useState(false)
  const [falhou, setFalhou] = useState(false)

  /**
   * A explicação da IA (cartão 7.6). É o servidor que fala com o modelo: com
   * conta, ele busca os números no banco; na demonstração, o navegador manda os
   * números do exemplo. Quando o modelo não está ligado ou é reprovado, vem o
   * texto de regra e aparece do mesmo jeito: é uma explicação, não um erro.
   */
  async function explicar() {
    setExplicando(true)
    setFalhou(false)
    const resposta = conta ? await ia.explicarAlerta(alerta.id) : await ia.explicarAlertaDeExemplo(alerta)
    setExplicando(false)
    if (resposta.ok) setExplicacao(resposta.corpo)
    else setFalhou(true)
  }

  return (
    <Card className={cn("p-5", !alerta.lido && (boa ? "border-success/40" : "border-warning/40"))}>
      <article aria-labelledby={`titulo-${alerta.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h4 id={`titulo-${alerta.id}`} className="flex items-center gap-2 text-lg text-ink">
            <Icone nome={sistema.metricas[alerta.metrica].icone} className="size-5 text-[var(--ds-primary-accent)]" />
            {boa ? textos.boaNoticia.titulo : textos.titulos[alerta.metrica][alerta.direcao]}
          </h4>
          <div className="flex flex-wrap gap-2">
            {!alerta.lido && (
              <Badge variante={boa ? "sucesso" : "aviso"}>
                <Icone nome="alertas" className="size-3.5" />
                {textos.novo}
              </Badge>
            )}
            <Badge variante={boa ? "sucesso" : "neutra"}>
              <Icone nome={alerta.direcao} className="size-3.5" />
              {boa
                ? preencher(textos.boaNoticia.desvio, { n: alerta.desvio })
                : preencher(textos.desvio, { n: alerta.desvio, lado: textos.lado[alerta.direcao] })}
            </Badge>
          </div>
        </div>

        <p className="mt-3 text-base leading-relaxed text-ink">{alerta.texto}</p>
        <p className="mt-2 text-sm text-muted">{textos.escritoPelaIa}</p>

        <div className="mt-4" aria-live="polite">
          {explicacao && (
            <div className="mb-3 rounded-2xl border border-hairline bg-surface p-4">
              <p className="text-base leading-relaxed text-ink">{explicacao.texto}</p>
              <p className="mt-2 text-sm text-muted">
                {explicacao.origem === "ia" ? textos.explicar.daIa : textos.explicar.padrao}
              </p>
            </div>
          )}
          {falhou && <p className="mb-3 text-sm text-muted">{textos.explicar.erro}</p>}
          <Button
            variante="secundaria"
            carregando={explicando}
            onClick={explicar}
            iconeEsquerda={<Icone nome="escrever" />}
          >
            {explicando ? textos.explicar.carregando : explicacao ? textos.explicar.outra : textos.explicar.botao}
          </Button>
        </div>

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
