"use client"

import { useState } from "react"
import { Icone } from "@/components/app/icone"
import {
  Button,
  Card,
  CardCabecalho,
  CardConteudo,
  CardDescricao,
  CardTitulo,
  Confirmar,
} from "@/components/ui"
import { sistema as textos } from "@/content/site"
import { useConta, useDados } from "@/lib/store"

const copy = textos.configuracoes.dados

type Pendente = "restaurar" | "limpar" | null

export function DadosExemplo() {
  const { dados, restaurarExemplos, limparTudo } = useDados()
  const [pendente, setPendente] = useState<Pendente>(null)
  const conta = useConta()

  const contagens = [
    { rotulo: textos.cadastros.pessoa.plural, valor: dados.pessoas.length },
    { rotulo: textos.cadastros.pulseira.plural, valor: dados.pulseiras.length },
    { rotulo: textos.cadastros.dia.plural, valor: dados.dias.length },
    { rotulo: textos.cadastros.alerta.plural, valor: dados.alertas.length },
  ]

  // Com conta, o que está na tela é a família de alguém: não há exemplo para
  // restaurar nem nada que um botão daqui deva apagar.
  if (conta) return null

  function confirmar() {
    if (pendente === "restaurar") restaurarExemplos()
    if (pendente === "limpar") limparTudo()
    setPendente(null)
  }

  return (
    <Card className="flex flex-col">
      <CardCabecalho>
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-ds bg-primary/12 text-primary">
            <Icone nome="dados" className="size-4" />
          </span>
          <CardTitulo como="h2">{copy.titulo}</CardTitulo>
        </div>
        <CardDescricao>{copy.descricao}</CardDescricao>
      </CardCabecalho>

      <CardConteudo className="flex flex-1 flex-col gap-4">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {contagens.map((item) => (
            <div
              key={item.rotulo}
              className="superficie-elevada rounded-ds border border-hairline px-2.5 py-2.5 sm:px-3"
            >
              {/* "Dias registrados" é o rótulo mais longo; ele quebra em duas
                  linhas em vez de sumir atrás de reticências. */}
              <dt className="text-xs leading-snug text-muted first-letter:uppercase">
                {item.rotulo}
              </dt>
              <dd className="font-display text-xl text-ink tabular-nums">{item.valor}</dd>
            </div>
          ))}
        </dl>

        <p className="text-[13px] leading-relaxed text-muted">{copy.dicaVazios}</p>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Button
            variante="secundaria"
            onClick={() => setPendente("restaurar")}
            iconeEsquerda={<Icone nome="restaurar" />}
          >
            {copy.restaurar}
          </Button>
          <Button
            variante="fantasma"
            onClick={() => setPendente("limpar")}
            iconeEsquerda={<Icone nome="remover" />}
            className="text-danger hover:bg-danger/10 hover:text-danger"
          >
            {copy.limpar}
          </Button>
        </div>
      </CardConteudo>

      {/* Restaurar também sobrescreve o que a pessoa editou. Por isso os dois pedem confirmação. */}
      <Confirmar
        aberto={pendente === "restaurar"}
        destrutivo={false}
        titulo={copy.confirmarRestaurar.titulo}
        texto={copy.confirmarRestaurar.texto}
        rotuloConfirmar={copy.confirmarRestaurar.confirmar}
        aoConfirmar={confirmar}
        aoCancelar={() => setPendente(null)}
      />

      <Confirmar
        aberto={pendente === "limpar"}
        titulo={copy.confirmarLimpar.titulo}
        texto={copy.confirmarLimpar.texto}
        rotuloConfirmar={copy.confirmarLimpar.confirmar}
        aoConfirmar={confirmar}
        aoCancelar={() => setPendente(null)}
      />
    </Card>
  )
}
