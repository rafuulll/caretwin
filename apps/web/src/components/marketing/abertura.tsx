import { LinkBotao } from "@/components/ui/botao";
import { Icone } from "@/components/ui/icone";
import { rotas, site } from "@/content/site";
import { FundoVivo } from "./fundo-vivo";
import { PreviaApp } from "./previa-app";

/*
  Dobra de abertura, arranjo (a): promessa, apoio e botões à esquerda, prévia do app
  à direita. No celular vira uma coluna, com a promessa antes da prévia.
*/
export function Abertura() {
  const a = site.abertura;
  return (
    <section aria-labelledby="abertura-titulo" className="relative isolate overflow-hidden">
      <FundoVivo />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="chegada">
          <p className="inline-flex items-center gap-2 rounded-full border border-borda-forte bg-superficie/80 px-3.5 py-1.5 text-[0.95rem] font-bold text-primaria">
            <Icone nome="cuidado" tamanho={18} />
            {a.rotulo}
          </p>
          <h1 id="abertura-titulo" className="mt-6 text-[clamp(2.25rem,5.2vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.02em]">
            {a.titulo}
          </h1>
          <p className="mt-6 max-w-xl text-[1.15rem] leading-relaxed text-tinta-suave">{a.apoio}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkBotao href={rotas.entrar} tamanho="grande" iconeDepois="seta" larguraTotal className="sm:w-auto">
              {a.botaoPrincipal}
            </LinkBotao>
            <LinkBotao href={rotas.comoFunciona} variante="secundario" tamanho="grande" larguraTotal className="sm:w-auto">
              {a.botaoSecundario}
            </LinkBotao>
          </div>
          <p className="mt-6 flex items-start gap-2 text-[0.95rem] text-tinta-suave">
            <Icone nome="seguro" tamanho={18} className="mt-0.5 text-primaria" />
            {a.nota}
          </p>
        </div>
        <div className="relative max-h-[460px] overflow-hidden lg:max-h-none lg:overflow-visible">
          <PreviaApp />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-fundo lg:hidden" />
        </div>
      </div>
    </section>
  );
}
