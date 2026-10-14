import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { sistema } from "@/content/site"
import { Badge } from "./badge"
import { Button } from "./button"
import {
  Card,
  CardCabecalho,
  CardConteudo,
  CardDescricao,
  CardRodape,
  CardTitulo,
} from "./card"

const meta = {
  title: "Primitivos/Card",
  component: Card,
  parameters: { layout: "padded" },
  argTypes: {
    interativo: { control: "boolean" },
  },
  args: {
    interativo: false,
  },
  // A largura fica dentro de cada `render`, e não num decorator do meta:
  // decorator de meta envolve o da story, então o de fora sempre venceria e
  // a story em grade nunca conseguiria ser mais larga que as outras.
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  render: (args) => (
    <div className="w-full max-w-md">
      <Card {...args}>
        <CardCabecalho>
          <CardTitulo>{sistema.comum.pulseira.titulo.replace("{codigo}", "CT-4F2A")}</CardTitulo>
          <CardDescricao>{sistema.painel.descricao.replace("{nome}", "Dona Cida")}</CardDescricao>
        </CardCabecalho>
        <CardConteudo>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">{sistema.painel.passos.titulo}</dt>
              <dd className="text-ink">3.480 {sistema.metricas.passos.unidade}</dd>
            </div>
            <div>
              <dt className="text-muted">{sistema.sono.noite.dormiu}</dt>
              <dd className="text-ink">7h10</dd>
            </div>
            <div>
              <dt className="text-muted">{sistema.comum.pulseira.bateria}</dt>
              <dd className="text-ink">72%</dd>
            </div>
            <div>
              <dt className="text-muted">{sistema.comum.pulseira.sincronizou}</dt>
              <dd className="text-ink">Hoje, 14h20</dd>
            </div>
          </dl>
        </CardConteudo>
      </Card>
    </div>
  ),
}

/** Cabeçalho, conteúdo e rodapé com divisor: o card completo. */
export const ComRodape: Story = {
  render: (args) => (
    <div className="w-full max-w-md">
      <Card {...args}>
        <CardCabecalho>
          <CardTitulo>{sistema.configuracoes.dados.titulo}</CardTitulo>
          <CardDescricao>{sistema.configuracoes.dados.descricao}</CardDescricao>
        </CardCabecalho>
        <CardConteudo>
          <p className="text-sm leading-relaxed text-muted">
            {sistema.configuracoes.dados.dicaVazios}
          </p>
        </CardConteudo>
        <CardRodape divisor>
          <Button variante="secundaria" tamanho="sm">
            {sistema.configuracoes.dados.restaurar}
          </Button>
          <Button variante="perigo" tamanho="sm">
            {sistema.configuracoes.dados.limpar}
          </Button>
        </CardRodape>
      </Card>
    </div>
  ),
}

/** Ligue `interativo` quando o card inteiro leva para algum lugar. */
export const Interativo: Story = {
  args: { interativo: true },
  render: (args) => (
    <div className="w-full max-w-md">
      <Card {...args}>
        <CardCabecalho>
          <div className="flex items-start justify-between gap-3">
            <CardTitulo>Dona Cida</CardTitulo>
            <Badge variante="sucesso" ponto>
              {sistema.situacoes.dentro}
            </Badge>
          </div>
          <CardDescricao>Marina, filha</CardDescricao>
        </CardCabecalho>
        <CardConteudo className="pt-3 text-sm text-muted">
          3.480 {sistema.metricas.passos.unidade} · 7h10 {sistema.metricas.sono.unidade}
        </CardConteudo>
      </Card>
    </div>
  ),
}

/** Dois cards lado a lado: o ritmo de espaçamento é o mesmo em qualquer largura. */
export const EmGrade: Story = {
  render: (args) => (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      {[
        {
          titulo: sistema.batimentos.titulo,
          descricao: sistema.batimentos.descricao,
          acao: sistema.batimentos.medir.comecar,
        },
        {
          titulo: sistema.alertas.titulo,
          descricao: sistema.alertas.descricao,
          acao: sistema.alertas.resumo.escrever,
        },
      ].map((secao) => (
        <Card key={secao.titulo} {...args}>
          <CardCabecalho>
            <CardTitulo>{secao.titulo}</CardTitulo>
            <CardDescricao>{secao.descricao.replace("{nome}", "Dona Cida")}</CardDescricao>
          </CardCabecalho>
          <CardConteudo className="pt-3">
            <Button variante="secundaria" tamanho="sm">
              {secao.acao}
            </Button>
          </CardConteudo>
        </Card>
      ))}
    </div>
  ),
}
