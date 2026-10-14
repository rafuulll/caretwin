import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { fn } from "storybook/test"
import { sistema } from "@/content/site"
import { Button } from "./button"
import { Confirmar, type ConfirmarProps } from "./confirmar"

/** Mesmo motivo do modal: aberto por padrão cobriria a documentação inteira. */
function ConfirmarComGatilho({ aberto, aoCancelar, aoConfirmar, ...props }: ConfirmarProps) {
  const [visivel, setVisivel] = useState(aberto)

  // O controle do Storybook muda `aberto` por fora. Ajustar durante a renderização,
  // e não num efeito, evita uma renderização a mais com o valor antigo.
  const [abertoAnterior, setAbertoAnterior] = useState(aberto)
  if (aberto !== abertoAnterior) {
    setAbertoAnterior(aberto)
    setVisivel(aberto)
  }

  return (
    <>
      <Button variante="secundaria" onClick={() => setVisivel(true)}>
        {props.titulo}
      </Button>

      <Confirmar
        {...props}
        aberto={visivel}
        aoCancelar={() => {
          setVisivel(false)
          aoCancelar()
        }}
        aoConfirmar={() => {
          setVisivel(false)
          aoConfirmar()
        }}
      />
    </>
  )
}

const meta = {
  title: "Primitivos/Confirmar",
  component: Confirmar,
  parameters: { layout: "centered" },
  argTypes: {
    destrutivo: { control: "boolean" },
    carregando: { control: "boolean" },
    aberto: { control: "boolean" },
    titulo: { control: "text" },
    texto: { control: "text" },
    rotuloConfirmar: { control: "text" },
    rotuloCancelar: { control: "text" },
  },
  args: {
    aberto: false,
    aoCancelar: fn(),
    aoConfirmar: fn(),
    titulo: sistema.configuracoes.dados.confirmarLimpar.titulo,
    texto: sistema.configuracoes.dados.confirmarLimpar.texto,
    rotuloConfirmar: sistema.configuracoes.dados.confirmarLimpar.confirmar,
    destrutivo: true,
    carregando: false,
  },
  render: (args) => <ConfirmarComGatilho {...args} />,
} satisfies Meta<typeof Confirmar>

export default meta
type Story = StoryObj<typeof meta>

/** O foco entra no Cancelar: o caminho seguro é o padrão. */
export const Destrutivo: Story = {}

/** Sem perda de dado do outro lado, o botão volta a ser o primário. */
export const NaoDestrutivo: Story = {
  args: {
    destrutivo: false,
    titulo: sistema.configuracoes.dados.confirmarRestaurar.titulo,
    texto: sistema.configuracoes.dados.confirmarRestaurar.texto,
    rotuloConfirmar: sistema.configuracoes.dados.confirmarRestaurar.confirmar,
  },
}

/** Enquanto processa, nada fecha por fora. A ação não fica no meio do caminho. */
export const Processando: Story = {
  args: {
    carregando: true,
    titulo: sistema.configuracoes.dados.confirmarLimpar.titulo,
    texto: sistema.configuracoes.dados.confirmarLimpar.texto,
    rotuloConfirmar: sistema.configuracoes.dados.confirmarLimpar.confirmar,
  },
}
