import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { sistema } from "@/content/site"
import { Textarea } from "./textarea"

const resumo = sistema.alertas.resumo

const meta = {
  title: "Primitivos/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  argTypes: {
    rotulo: { control: "text" },
    ajuda: { control: "text" },
    erro: { control: "text" },
    obrigatorio: { control: "boolean" },
    ocultarRotulo: { control: "boolean" },
    disabled: { control: "boolean" },
    rows: { control: { type: "number", min: 2, max: 12 } },
  },
  args: {
    rotulo: "Anotação do dia",
    placeholder: "Ex.: Dona Cida foi à feira de manhã e voltou cansada.",
    rows: 4,
    obrigatorio: false,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {}

export const ComAjuda: Story = {
  args: {
    rotulo: resumo.titulo,
    ajuda: resumo.descricao,
    placeholder: undefined,
  },
}

export const ComErro: Story = {
  args: {
    rotulo: resumo.titulo,
    erro: "Escreva pelo menos uma frase sobre o dia.",
    obrigatorio: true,
  },
}

export const ComTexto: Story = {
  args: {
    defaultValue:
      "Dona Cida dormiu bem e acordou uma vez no meio da noite. De manhã andou menos que o normal, e à tarde voltou para o de sempre.",
  },
}

export const Desabilitado: Story = {
  args: {
    disabled: true,
    defaultValue: "Dona Cida foi à feira de manhã.",
  },
}

/** Só cresce na vertical: encolher a largura quebraria a coluna do formulário. */
export const Alto: Story = {
  args: { rows: 8 },
}
