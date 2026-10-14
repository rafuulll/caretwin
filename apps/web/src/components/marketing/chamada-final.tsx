import { LinkBotao } from "@/components/ui/botao";
import { rotas, site } from "@/content/site";

export function ChamadaFinal() {
  const c = site.chamada;
  return (
    <section aria-labelledby="chamada-titulo" className="px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="mx-auto max-w-6xl rounded-[20px] bg-primaria px-6 py-14 text-center text-sobre-primaria sm:px-12 lg:py-20">
        <h2 id="chamada-titulo" className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-bold tracking-[-0.015em]">
          {c.titulo}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[1.1rem] opacity-90">{c.apoio}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkBotao href={rotas.entrar} tamanho="grande" iconeDepois="seta">
            {c.botao}
          </LinkBotao>
          <LinkBotao
            href={rotas.comoUsar}
            tamanho="grande"
            variante="fantasma"
            className="text-sobre-primaria hover:bg-sobre-primaria/10"
          >
            {c.secundario}
          </LinkBotao>
        </div>
      </div>
    </section>
  );
}
