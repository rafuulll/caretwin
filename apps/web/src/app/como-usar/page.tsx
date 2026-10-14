import type { Metadata } from "next";
import { Cabecalho } from "@/components/marketing/cabecalho";
import { Rodape } from "@/components/marketing/rodape";
import { Icone } from "@/components/ui/icone";
import { LinkBotao } from "@/components/ui/botao";
import { comoUsar, rotas, site } from "@/content/site";

export const metadata: Metadata = { title: comoUsar.titulo };

export default function PaginaComoUsar() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-campo bg-superficie px-4 py-3 font-bold text-primaria shadow-ct-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {site.pularParaConteudo}
      </a>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
          <h1 className="text-[clamp(2.1rem,4.5vw,3rem)] font-bold tracking-[-0.02em]">{comoUsar.titulo}</h1>
          <p className="mt-4 max-w-2xl text-[1.15rem] leading-relaxed text-tinta-suave">{comoUsar.apoio}</p>

          <section aria-labelledby="bloco1" className="mt-14">
            <h2 id="bloco1" className="flex items-center gap-3 text-[1.6rem] font-bold">
              <span className="flex size-10 items-center justify-center rounded-full bg-bom-fundo text-bom">
                <Icone nome="ok" />
              </span>
              {comoUsar.bloco1.titulo}
            </h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {comoUsar.bloco1.itens.map((item) => (
                <div key={item.titulo} className="cartao p-5">
                  <dt className="font-bold">{item.titulo}</dt>
                  <dd className="mt-1.5 text-tinta-suave">{item.texto}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="bloco2" className="mt-16">
            <h2 id="bloco2" className="flex items-center gap-3 text-[1.6rem] font-bold">
              <span className="flex size-10 items-center justify-center rounded-full bg-info-fundo text-info">
                <Icone nome="sincronizar" />
              </span>
              {comoUsar.bloco2.titulo}
            </h2>
            <ul className="mt-6 space-y-4">
              {comoUsar.bloco2.itens.map((item) => (
                <li key={item.titulo} className="cartao p-5 sm:p-6">
                  <h3 className="text-[1.15rem] font-bold">{item.titulo}</h3>
                  <p className="mt-1.5 text-tinta-suave">{item.texto}</p>
                  <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-campo bg-suave px-3 py-2 text-[0.9rem]">
                    <Icone nome="info" tamanho={16} className="text-primaria" />
                    <code translate="no" className="[overflow-wrap:anywhere]">
                      {item.onde}
                    </code>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="bloco3" className="mt-16">
            <h2 id="bloco3" className="flex items-center gap-3 text-[1.6rem] font-bold">
              <span className="flex size-10 items-center justify-center rounded-full bg-atencao-fundo text-atencao">
                <Icone nome="seta" />
              </span>
              {comoUsar.bloco3.titulo}
            </h2>
            <ol className="mt-6 space-y-3">
              {comoUsar.bloco3.itens.map((item, i) => (
                <li key={item} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primaria font-bold text-sobre-primaria">{i + 1}</span>
                  <p className="pt-1">{item}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-16 flex flex-col gap-3 sm:flex-row">
            <LinkBotao href={rotas.entrar} tamanho="grande" iconeDepois="seta">
              {comoUsar.entrar}
            </LinkBotao>
            <LinkBotao href={rotas.site} tamanho="grande" variante="secundario" icone="voltar">
              {comoUsar.voltar}
            </LinkBotao>
          </div>
        </div>
      </main>
      <Rodape />
    </>
  );
}
