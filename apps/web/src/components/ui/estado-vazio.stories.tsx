import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bell, Footprints, Plus, RefreshCw, SearchX, Watch } from "lucide-react"
import { sistema } from "@/content/site"
import { cn } from "@/lib/cn"
import { Button } from "./button"
import { EstadoVazio } from "./estado-vazio"

const meta = {
  title: "Primitivos/EstadoVazio",
  component: EstadoVazio,
  parameters: { layout: "padded" },
  argTypes: {
    titulo: { control: "text" },
    texto: { control: "text" },
    tamanho: { control: "inline-radio", options: ["sm", "md"] },
    icone: { control: false },
    acao: { control: false },
  },
  args: {
    titulo: sistema.comum.semPessoa.titulo,
    texto: sistema.comum.semPessoa.texto,
    tamanho: "md",
  },
  decorators: [
    // O vazio nunca aparece solto na página: ele mora dentro de uma superfície.
    // A largura acompanha o tamanho, porque `sm` existe justamente para caber
    // num card estreito, como o da pulseira no painel.
    (Story, contexto) => (
      <div
        className={cn(
          "w-full rounded-ds border border-hairline bg-surface",
          contexto.args.tamanho === "sm" ? "max-w-[280px]" : "max-w-2xl"
        )}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EstadoVazio>

export default meta
type Story = StoryObj<typeof meta>

/** Vazio sem saída é beco: todo estado vazio de lista carrega a ação que o resolve. */
export const SemPulseira: Story = {
  args: {
    icone: <Watch />,
    acao: <Button iconeEsquerda={<Plus />}>{sistema.comum.semPessoa.acao}</Button>,
  },
}

export const Aguardando: Story = {
  args: {
    titulo: sistema.comum.esperandoDados.titulo,
    texto: sistema.comum.esperandoDados.texto.replace("{nome}", "Dona Cida"),
    icone: <RefreshCw />,
    acao: <Button iconeEsquerda={<RefreshCw />}>{sistema.comum.esperandoDados.acao}</Button>,
  },
}

export const SemAlertas: Story = {
  args: {
    titulo: sistema.alertas.lista.vazio.titulo,
    texto: sistema.alertas.lista.vazio.texto.replace("{nome}", "Dona Cida"),
    icone: <Bell />,
    acao: <Button variante="secundaria">{sistema.primeiroUso.pronto.ir}</Button>,
  },
}

/**
 * Busca sem resultado é outro vazio: existe cadastro, o filtro é que esconde.
 * Por isso a saída aqui é limpar o filtro, e não cadastrar de novo.
 */
export const SemResultado: Story = {
  args: {
    titulo: "Nenhuma pessoa com esse nome",
    texto: "Tente só um pedaço do nome.",
    icone: <SearchX />,
    acao: <Button variante="secundaria">{sistema.acoes.limpar}</Button>,
  },
}

/** `sm` para vazios apertados: dentro de card ou de coluna estreita. */
export const Pequeno: Story = {
  args: {
    tamanho: "sm",
    titulo: sistema.painel.passos.semPassos,
    texto: undefined,
    icone: <Footprints />,
  },
}

export const SemAcao: Story = {
  args: {
    titulo: sistema.sono.noite.semNoite,
    texto: undefined,
    tamanho: "sm",
  },
}
