import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TriangleAlert, Watch } from "lucide-react"
import { useState } from "react"
import { fn } from "storybook/test"
import { sistema } from "@/content/site"
import { Button } from "./button"
import { Input } from "./input"
import { Modal, type ModalProps, type TamanhoModal } from "./modal"
import { Select } from "./select"
import { Textarea } from "./textarea"

/**
 * As stories abrem por clique, e não já abertas.
 *
 * O modal é `fixed inset-0`: uma story aberta por padrão cobriria a página de
 * documentação inteira. O gatilho também mostra o que mais importa aqui: o
 * foco entra no diálogo ao abrir e volta para este botão ao fechar.
 */
function ModalComGatilho({ aberto, aoFechar, ...props }: ModalProps) {
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

      <Modal
        {...props}
        aberto={visivel}
        aoFechar={() => {
          setVisivel(false)
          aoFechar()
        }}
      />
    </>
  )
}

const TAMANHOS: TamanhoModal[] = ["sm", "md", "lg"]

const primeiroUso = sistema.primeiroUso
const limpar = sistema.configuracoes.dados.confirmarLimpar

const METRICAS = [
  { valor: "passos", rotulo: sistema.metricas.passos.nome },
  { valor: "sono", rotulo: sistema.metricas.sono.nome },
  { valor: "batimentos", rotulo: sistema.metricas.batimentos.nome },
]

const meta = {
  title: "Primitivos/Modal",
  component: Modal,
  parameters: { layout: "centered" },
  argTypes: {
    tamanho: { control: "inline-radio", options: TAMANHOS },
    papel: { control: "inline-radio", options: ["dialog", "alertdialog"] },
    mostrarFechar: { control: "boolean" },
    fecharNoOverlay: { control: "boolean" },
    titulo: { control: "text" },
    descricao: { control: "text" },
    aberto: { control: "boolean" },
    icone: { control: false },
    rodape: { control: false },
    children: { control: false },
    refFocoInicial: { control: false },
  },
  args: {
    aberto: false,
    // `fn()` deixa cada fechamento aparecer na aba Actions. Dá pra ver o
    // Esc, o clique no fundo e o botão de fechar chamando a mesma coisa.
    aoFechar: fn(),
    titulo: primeiroUso.titulo,
    descricao: primeiroUso.descricao,
    tamanho: "md",
    papel: "dialog",
    mostrarFechar: true,
    fecharNoOverlay: true,
  },
  render: (args) => <ModalComGatilho {...args} />,
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  args: {
    children: (
      <p className="text-sm leading-relaxed text-muted">{primeiroUso.pulseira.texto}</p>
    ),
    rodape: (
      <>
        <Button variante="secundaria">{sistema.acoes.cancelar}</Button>
        <Button>{primeiroUso.concluir}</Button>
      </>
    ),
  },
}

export const ComIcone: Story = {
  args: {
    ...Padrao.args,
    icone: <Watch className="text-primary" />,
  },
}

/** No celular sobe pela base como uma folha; no desktop fica centralizado. */
export const ComFormulario: Story = {
  args: {
    icone: <Watch className="text-primary" />,
    children: (
      <div className="flex flex-col gap-4">
        <Input
          rotulo={primeiroUso.pulseira.rotulo}
          placeholder={primeiroUso.pulseira.exemplo}
          obrigatorio
        />
        <Input
          rotulo={primeiroUso.perfil.nome}
          placeholder={primeiroUso.perfil.exemploNome}
          obrigatorio
        />
        <Select rotulo="Avisar quem acompanha sobre" opcoes={METRICAS} defaultValue="passos" />
        <Textarea
          rotulo="Observações para quem acompanha"
          placeholder="Ex.: Costuma caminhar de manhã, antes do café."
          rows={3}
        />
      </div>
    ),
    rodape: (
      <>
        <Button variante="secundaria">{sistema.acoes.cancelar}</Button>
        <Button>{primeiroUso.concluir}</Button>
      </>
    ),
  },
}

export const Tamanhos: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {TAMANHOS.map((tamanho) => (
        <ModalComGatilho
          key={tamanho}
          {...args}
          tamanho={tamanho}
          titulo={tamanho}
          descricao={primeiroUso.descricao}
        />
      ))}
    </div>
  ),
}

/** Só o miolo rola; cabeçalho e rodapé ficam parados. */
export const ConteudoLongo: Story = {
  args: {
    titulo: sistema.configuracoes.dados.titulo,
    descricao: sistema.configuracoes.dados.descricao,
    children: (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 12 }, (_, indice) => (
          <p key={indice} className="text-sm leading-relaxed text-muted">
            {sistema.configuracoes.dados.dicaVazios}
          </p>
        ))}
      </div>
    ),
    rodape: <Button>{sistema.acoes.confirmar}</Button>,
  },
}

export const SemRodape: Story = {
  args: {
    titulo: sistema.configuracoes.dados.confirmarRestaurar.titulo,
    descricao: sistema.configuracoes.dados.confirmarRestaurar.texto,
  },
}

/**
 * `alertdialog` para decisão que interrompe o fluxo: o leitor de tela anuncia
 * como interrupção e a saída é escolher uma das opções (ou Esc).
 */
export const Alerta: Story = {
  args: {
    papel: "alertdialog",
    tamanho: "sm",
    mostrarFechar: false,
    titulo: limpar.titulo,
    descricao: limpar.texto,
    icone: <TriangleAlert className="text-danger" />,
    rodape: (
      <>
        <Button variante="secundaria">{sistema.acoes.cancelar}</Button>
        <Button variante="perigo">{limpar.confirmar}</Button>
      </>
    ),
  },
}
