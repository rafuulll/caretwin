import { Icone } from "@/components/app/icone"
import { Logo } from "@/components/app/logo"
import { landing, sistema } from "@/content/site"
import { cn } from "@/lib/cn"
import { estadoDaPulseira, passosDeHoje, pulseiraDe, ultimosDias } from "@/lib/consultas"
import { formatarDiaDaSemanaCurto, numero, preencher } from "@/lib/formato"
import { gerarExemplos } from "@/lib/seed"

/**
 * A prévia do app na abertura, montada em HTML com os dados de exemplo.
 *
 * Não existe imagem: um print envelhece na primeira mudança de visual, e aqui
 * a prévia é pintada pelos mesmos tokens do app e mostra o painel de verdade
 * da Dona Cida. A moldura inteira é decoração (o mesmo conteúdo está escrito na
 * dobra), então ela sai do leitor de tela e nada aqui recebe foco.
 */
export function MockupProduto() {
  const { mockup } = landing
  const agora = new Date()
  const dados = gerarExemplos(agora)
  const pessoa = dados.pessoas[0]
  const hoje = passosDeHoje(dados, pessoa.id, agora)
  const pulseira = estadoDaPulseira(pulseiraDe(dados, pessoa.id), agora)
  const semana = ultimosDias(dados, pessoa.id, "passos", agora, 8).slice(0, 7)
  const maximo = Math.max(1, ...semana.map((d) => Math.max(d.valor ?? 0, d.faixa?.alto ?? 0)))

  return (
    <div aria-hidden="true" className="relative">
      {/* A perspectiva é uma transformação só, no contêiner, e só no computador:
          transformação 3D treme na rolagem do celular. */}
      <div className="lg:[transform:perspective(1200px)_rotateX(6deg)_rotateY(-8deg)] lg:origin-top">
        <div className="superficie-elevada overflow-hidden rounded-ds-surface border border-hairline max-lg:max-h-[420px]">
          <div className="flex h-10 items-center gap-2 border-b border-hairline px-3">
            <span className="flex shrink-0 gap-1.5">
              <span className="size-2 rounded-full bg-hairline" />
              <span className="size-2 rounded-full bg-hairline" />
              <span className="size-2 rounded-full bg-hairline" />
            </span>
            <span className="mx-auto truncate rounded-full border border-hairline bg-canvas px-3 py-0.5 text-[11px] text-muted">
              {mockup.endereco}
            </span>
            <span className="w-[38px] shrink-0" />
          </div>

          <div className="flex bg-canvas">
            <div className="hidden w-[168px] shrink-0 flex-col gap-3 border-r border-hairline bg-surface p-3 sm:flex">
              <Logo className="[&_svg]:size-5 [&_span]:text-sm" />
              <ul className="flex flex-col gap-0.5">
                {sistema.nav.map((item, indice) => (
                  <li
                    key={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-ds px-2 py-1.5 text-[12px]",
                      indice === 0 ? "superficie-elevada font-semibold text-ink" : "text-muted"
                    )}
                  >
                    <Icone nome={item.icone} className="size-3.5 shrink-0" />
                    <span className="truncate">{item.rotulo}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 lg:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-display text-lg text-ink">{mockup.titulo}</span>
                <span className="rounded-full border border-hairline px-2.5 py-0.5 text-[11px] text-muted">
                  {pessoa.nome}
                </span>
              </div>

              <div className="superficie rounded-ds-surface border border-hairline p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[12px] text-ink">
                    <Icone nome="passos" className="size-3.5" />
                    {mockup.passos}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      hoje.situacao === "dentro" && "border-success/25 bg-success/12 text-success",
                      (hoje.situacao === "abaixo" || hoje.situacao === "acima") &&
                        "border-warning/25 bg-warning/12 text-warning",
                      hoje.situacao === "aprendendo" && "border-hairline text-muted"
                    )}
                  >
                    <Icone nome={hoje.situacao} className="size-3" />
                    {mockup.situacao[hoje.situacao]}
                  </span>
                </div>
                <p className="mt-2 font-display text-4xl leading-none tabular-nums text-ink">
                  {numero(hoje.passos ?? 0)}
                </p>
                {hoje.faixaAteAgora && (
                  <p className="mt-2 text-[12px] text-muted">
                    {preencher(sistema.painel.passos.normalAteAgora, {
                      baixo: numero(Math.round(hoje.faixaAteAgora.baixo)),
                      alto: numero(Math.round(hoje.faixaAteAgora.alto)),
                    })}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-3">
                <div className="superficie rounded-ds-surface border border-hairline p-3">
                  <span className="text-[11px] text-muted">{mockup.semana}</span>
                  <div className="mt-2 flex h-20 items-end gap-1.5">
                    {semana.map((dia) => {
                      const fora = dia.situacao === "abaixo" || dia.situacao === "acima"
                      return (
                        <div key={dia.data} className="flex flex-1 flex-col items-center gap-1">
                          <span
                            className={cn("w-full rounded-t-[3px]", fora ? "bg-warning" : "bg-primary")}
                            style={{ height: `${((dia.valor ?? 0) / maximo) * 64}px` }}
                          />
                          <span className="text-[9px] text-muted">{formatarDiaDaSemanaCurto(dia.data)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {pulseira && (
                  <div className="superficie rounded-ds-surface border border-hairline p-3">
                    <span className="text-[11px] text-muted">
                      {preencher(sistema.comum.pulseira.titulo, { codigo: pulseira.codigo })}
                    </span>
                    <p className="mt-2 flex items-center gap-1.5 font-display text-xl tabular-nums text-ink">
                      <Icone nome="bateria" className="size-4" />
                      {pulseira.bateria}%
                    </p>
                    <p className="mt-1 text-[11px] text-muted">{mockup.bateria}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* No celular a prévia fica reta e cortada, esmaecendo para o fundo. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-canvas to-transparent lg:hidden" />
    </div>
  )
}
