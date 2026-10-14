import Link from "next/link";
import { Logo } from "@/components/marca/logo";
import { LinkBotao } from "@/components/ui/botao";
import { rotas, site } from "@/content/site";

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-borda/80 bg-fundo/90 backdrop-blur supports-[backdrop-filter]:bg-fundo/75">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={rotas.site} aria-label={site.cabecalho.inicio} className="rounded-campo">
          <Logo />
        </Link>
        <nav aria-label={site.cabecalho.navegacao} className="flex items-center gap-1 sm:gap-2">
          <Link
            href={rotas.comoFunciona}
            className="hidden min-h-11 items-center rounded-campo px-3 font-bold text-tinta-suave hover:bg-suave hover:text-tinta md:inline-flex"
          >
            {site.cabecalho.comoFunciona}
          </Link>
          <Link
            href={rotas.comoUsar}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-campo px-2.5 font-bold text-tinta-suave hover:bg-suave hover:text-tinta sm:px-3"
          >
            {site.cabecalho.comoUsar}
          </Link>
          <LinkBotao href={rotas.entrar} tamanho="pequeno" data-tour="entrar" className="px-4">
            {site.cabecalho.entrar}
          </LinkBotao>
        </nav>
      </div>
    </header>
  );
}
