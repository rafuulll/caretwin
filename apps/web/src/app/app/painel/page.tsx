"use client"

import { CabecalhoPagina } from "@/components/app/cabecalho-pagina"
import { AindaAprendendo, EstadoDaPessoa } from "@/components/app/estado-da-pessoa"
import { EstadoDaPulseiraCartao } from "@/components/app/estado-da-pulseira"
import { GraficoDias } from "@/components/app/graficos/grafico-dias"
import { PassosDeHojeCartao } from "@/components/app/painel/passos-de-hoje"
import { Card, CardCabecalho, CardConteudo, CardDescricao, CardTitulo } from "@/components/ui"
import { sistema } from "@/content/site"
import { useAgora } from "@/lib/agora"
import { estadoDaPulseira, passosDeHoje, pulseiraDe, ultimosDias } from "@/lib/consultas"
import { dataPorExtenso, numero, paraISO, preencher } from "@/lib/formato"
import { useConta, useDados, usePessoaNaTela, useSessao } from "@/lib/store"

const textos = sistema.painel
const comum = sistema.comum

function saudacaoPara(hora: number) {
  if (hora < 12) return comum.saudacao.manha
  if (hora < 18) return comum.saudacao.tarde
  return comum.saudacao.noite
}

/** "4,2 mil" no eixo: o número inteiro fica na barra e no texto. */
function milhar(valor: number) {
  return valor >= 1000 ? `${numero(Math.round(valor / 100) / 10)} ${comum.mil}` : numero(valor)
}

/**
 * O painel do dia, a tela que abre o app: os passos de hoje contra o normal da
 * pessoa, a bateria da pulseira e a última atualização. É o momento mais
 * frequente, de duas a três vezes por dia, e por isso tudo aqui cabe numa
 * olhada, com o número que importa em primeiro lugar.
 */
export default function PaginaPainel() {
  const { dados } = useDados()
  const pessoa = usePessoaNaTela()
  const sessao = useSessao()
  const conta = useConta()
  const agora = useAgora()
  if (!agora) return null

  // Quem usa a pulseira e entrou com a própria conta lê "o seu dia" (cartão 7.2).
  const propria = pessoa ? conta?.vinculos[pessoa.id]?.papel === "acompanhada" : false
  const descricao = pessoa
    ? propria
      ? textos.descricaoPropria
      : preencher(textos.descricao, { nome: pessoa.nome })
    : ""

  const primeiroNome = sessao?.nome.trim().split(/\s+/)[0] ?? ""
  const saudacao = saudacaoPara(agora.getHours())

  return (
    <>
      <CabecalhoPagina
        titulo={primeiroNome ? preencher(comum.saudacao.comNome, { saudacao, nome: primeiroNome }) : saudacao}
        descricao={`${dataPorExtenso(paraISO(agora))}. ${descricao}`}
      />

      <EstadoDaPessoa pessoa={pessoa}>
        {(pessoa) => {
          const estado = estadoDaPulseira(pulseiraDe(dados, pessoa.id), agora)
          return (
            <div className="flex flex-col gap-5 sm:gap-6">
              <AindaAprendendo pessoa={pessoa} />

              <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <PassosDeHojeCartao dados={passosDeHoje(dados, pessoa.id, agora)} />
                {estado && <EstadoDaPulseiraCartao estado={estado} agora={agora} />}
              </div>

              <Card>
                <CardCabecalho>
                  <CardTitulo como="h2">{textos.grafico.titulo}</CardTitulo>
                  <CardDescricao>{textos.grafico.descricao}</CardDescricao>
                </CardCabecalho>
                <CardConteudo>
                  <GraficoDias
                    pontos={ultimosDias(dados, pessoa.id, "passos", agora)}
                    rotulo={textos.grafico.rotulo}
                    formatar={(v) => `${numero(v)} ${sistema.metricas.passos.unidade}`}
                    formatarEixo={milhar}
                    semValorHoje={textos.grafico.hojeParcial}
                    acimaEhBom
                  />
                </CardConteudo>
              </Card>
            </div>
          )
        }}
      </EstadoDaPessoa>
    </>
  )
}
