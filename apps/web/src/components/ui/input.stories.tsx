import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { AtSign, Watch } from "lucide-react"
import { entrada, sistema } from "@/content/site"
import { Input } from "./input"

const perfil = sistema.primeiroUso.perfil
const pulseira = sistema.primeiroUso.pulseira
const conta = sistema.configuracoes.perfil

const meta = {
  title: "Primitivos/Input",
  component: Input,
  parameters: { layout: "padded" },
  argTypes: {
    rotulo: { control: "text" },
    ajuda: { control: "text" },
    erro: { control: "text" },
    obrigatorio: { control: "boolean" },
    ocultarRotulo: { control: "boolean" },
    disabled: { control: "boolean" },
    iconeEsquerda: { control: false },
    iconeDireita: { control: false },
  },
  args: {
    rotulo: perfil.nome,
    placeholder: perfil.exemploNome,
    obrigatorio: false,
    ocultarRotulo: false,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {}

export const Obrigatorio: Story = {
  args: { obrigatorio: true },
}

/** A ajuda some quando aparece um erro. Duas mensagens ao mesmo tempo viram ruído. */
export const ComAjuda: Story = {
  args: {
    rotulo: pulseira.rotulo,
    placeholder: pulseira.exemplo,
    ajuda: pulseira.ajuda,
    iconeEsquerda: <Watch />,
  },
}

export const ComErro: Story = {
  args: {
    rotulo: conta.email,
    placeholder: entrada.campos.usuario.placeholder,
    erro: conta.erros.email,
    defaultValue: "marina@",
    iconeEsquerda: <AtSign />,
  },
}

export const ComIcone: Story = {
  args: {
    rotulo: conta.email,
    placeholder: entrada.campos.usuario.placeholder,
    type: "email",
    iconeEsquerda: <AtSign />,
  },
}

export const Desabilitado: Story = {
  args: {
    disabled: true,
    defaultValue: "Dona Cida",
  },
}

/** Os três estados juntos: é assim que se compara altura, cor e espaçamento. */
export const Estados: Story = {
  render: (args) => (
    <div className="flex flex-col gap-5">
      <Input {...args} rotulo={perfil.nome} placeholder={perfil.exemploNome} />
      <Input
        {...args}
        rotulo={pulseira.rotulo}
        placeholder={pulseira.exemplo}
        ajuda={pulseira.ajuda}
      />
      <Input
        {...args}
        rotulo={conta.email}
        defaultValue="marina@"
        erro={conta.erros.email}
      />
      <Input
        {...args}
        rotulo={perfil.quemAcompanha}
        defaultValue="Marina, filha"
        disabled
      />
    </div>
  ),
}
