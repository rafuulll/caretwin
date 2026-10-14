import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { fn } from "storybook/test"
import { entrada, landing, sistema } from "@/content/site"
import { Badge } from "./badge"
import { Button } from "./button"
import { Drawer, type DrawerProps, type LarguraDrawer } from "./drawer"
import { EstadoVazio } from "./estado-vazio"
import { Input } from "./input"
import { Select } from "./select"

/** Mesmo motivo do modal: aberto por padrão cobriria a documentação inteira. */
function DrawerComGatilho({ aberto, aoFechar, ...props }: DrawerProps) {
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

      <Drawer
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

const LARGURAS: LarguraDrawer[] = ["sm", "md", "lg"]

const pulseira = sistema.primeiroUso.pulseira
const perfil = sistema.primeiroUso.perfil

const PESSOAS = [
  { valor: "cida", rotulo: "Dona Cida" },
  { valor: "jorge", rotulo: "Seu Jorge" },
  { valor: "helena", rotulo: "Dona Helena" },
]

const meta = {
  title: "Primitivos/Drawer",
  component: Drawer,
  parameters: { layout: "centered" },
  argTypes: {
    largura: { control: "inline-radio", options: LARGURAS },
    mostrarFechar: { control: "boolean" },
    fecharNoOverlay: { control: "boolean" },
    titulo: { control: "text" },
    descricao: { control: "text" },
    aberto: { control: "boolean" },
    rodape: { control: false },
    children: { control: false },
    refFocoInicial: { control: false },
  },
  args: {
    aberto: false,
    aoFechar: fn(),
    titulo: "Dona Cida",
    descricao: sistema.comum.pulseira.titulo.replace("{codigo}", "CT-4F2A"),
    largura: "md",
    mostrarFechar: true,
    fecharNoOverlay: true,
  },
  render: (args) => <DrawerComGatilho {...args} />,
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

/** O painel lateral existe para ver o detalhe sem perder a lista de vista. */
export const Padrao: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="font-display text-sm text-ink">{sistema.comum.hoje}</h3>
          <dl className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">{sistema.metricas.passos.nome}</dt>
              <dd className="text-ink">3.480 {sistema.metricas.passos.unidade}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">{sistema.metricas.batimentos.nome}</dt>
              <dd className="text-ink">72 {sistema.metricas.batimentos.unidade}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">{sistema.metricas.sono.nome}</dt>
              <dd>
                <Badge variante="sucesso" ponto>
                  {sistema.situacoes.dentro}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">{sistema.comum.pulseira.sincronizou}</dt>
              <dd className="text-ink">Hoje, 14h20</dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-display text-sm text-ink">{sistema.alertas.lista.titulo}</h3>
          <div className="rounded-ds border border-hairline bg-elevated">
            <EstadoVazio tamanho="sm" titulo={sistema.alertas.lista.vazio.titulo} />
          </div>
        </section>
      </div>
    ),
    rodape: (
      <>
        <Button variante="secundaria">{sistema.acoes.fechar}</Button>
        <Button>{sistema.batimentos.medir.comecar}</Button>
      </>
    ),
  },
}

export const ComFormulario: Story = {
  args: {
    titulo: sistema.primeiroUso.titulo,
    descricao: sistema.primeiroUso.descricao,
    children: (
      <div className="flex flex-col gap-4">
        <Input
          rotulo={pulseira.rotulo}
          placeholder={pulseira.exemplo}
          ajuda={pulseira.ajuda}
          obrigatorio
        />
        <Input rotulo={perfil.nome} placeholder={perfil.exemploNome} obrigatorio />
        <Input
          rotulo={perfil.quemAcompanha}
          placeholder={perfil.exemploQuemAcompanha}
          ajuda={perfil.ajudaQuemAcompanha}
        />
        <Input
          rotulo={sistema.configuracoes.perfil.email}
          placeholder={entrada.campos.usuario.placeholder}
          type="email"
        />
        <Select rotulo={sistema.casca.pessoaNaTela} opcoes={PESSOAS} defaultValue="cida" />
      </div>
    ),
    rodape: (
      <>
        <Button variante="secundaria">{sistema.acoes.cancelar}</Button>
        <Button>{sistema.primeiroUso.concluir}</Button>
      </>
    ),
  },
}

export const Larguras: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {LARGURAS.map((largura) => (
        <DrawerComGatilho
          key={largura}
          {...args}
          largura={largura}
          titulo={largura}
          descricao={sistema.primeiroUso.descricao}
        >
          <p className="text-sm leading-relaxed text-muted">{landing.normalDeCadaUm.subtitulo}</p>
        </DrawerComGatilho>
      ))}
    </div>
  ),
}

export const SemRodape: Story = {
  args: {
    titulo: sistema.comum.pulseira.titulo.replace("{codigo}", "CT-4F2A"),
    descricao: undefined,
    children: (
      <p className="text-sm leading-relaxed text-muted">{sistema.comum.pulseira.atrasada}</p>
    ),
  },
}
