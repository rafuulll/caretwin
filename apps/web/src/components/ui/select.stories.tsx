import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { landing, sistema } from "@/content/site"
import { Select, type OpcaoSelect } from "./select"

const situacoes: OpcaoSelect[] = [
  { valor: "dentro", rotulo: sistema.situacoes.dentro },
  { valor: "abaixo", rotulo: sistema.situacoes.abaixo },
  { valor: "acima", rotulo: sistema.situacoes.acima },
  { valor: "aprendendo", rotulo: sistema.situacoes.aprendendo },
]

const metricas: OpcaoSelect[] = [
  { valor: "passos", rotulo: sistema.metricas.passos.nome },
  { valor: "sono", rotulo: sistema.metricas.sono.nome },
  { valor: "batimentos", rotulo: sistema.metricas.batimentos.nome },
]

const pessoas: OpcaoSelect[] = [
  { valor: "cida", rotulo: "Dona Cida" },
  { valor: "jorge", rotulo: "Seu Jorge" },
  { valor: "helena", rotulo: "Dona Helena" },
]

const periodos: OpcaoSelect[] = [
  { valor: "7", rotulo: landing.mockup.semana },
  { valor: "14", rotulo: sistema.painel.grafico.titulo },
]

const meta = {
  title: "Primitivos/Select",
  component: Select,
  parameters: { layout: "padded" },
  argTypes: {
    rotulo: { control: "text" },
    ajuda: { control: "text" },
    erro: { control: "text" },
    placeholder: { control: "text" },
    obrigatorio: { control: "boolean" },
    disabled: { control: "boolean" },
    opcoes: { control: false },
  },
  args: {
    rotulo: "Situação do dia",
    opcoes: situacoes,
    defaultValue: "",
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
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/** Começa no placeholder: nada escolhido é diferente de "Dentro do normal" por acidente. */
export const Padrao: Story = {}

export const ComValor: Story = {
  args: { defaultValue: "dentro" },
}

export const ComErro: Story = {
  args: {
    rotulo: sistema.casca.pessoaNaTela,
    opcoes: pessoas,
    erro: "Escolha de quem é a pulseira.",
    obrigatorio: true,
  },
}

export const ComAjuda: Story = {
  args: {
    rotulo: "Avisar quem acompanha sobre",
    opcoes: metricas,
    defaultValue: "passos",
    ajuda: "O alerta aparece quando a mudança se repete por dois dias.",
  },
}

/** Sem placeholder quando toda escolha é válida e uma já vem marcada. */
export const SemPlaceholder: Story = {
  args: {
    rotulo: "Período",
    opcoes: periodos,
    placeholder: null,
    defaultValue: "14",
  },
}

export const Desabilitado: Story = {
  args: { disabled: true, defaultValue: "aprendendo" },
}
