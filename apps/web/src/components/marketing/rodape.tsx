import Link from "next/link";
import { Logo } from "@/components/marca/logo";
import { marca, rotas, site } from "@/content/site";

export function Rodape() {
  return (
    <footer className="border-t border-borda bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <Logo tamanho={28} />
          <p className="mt-4 text-tinta-suave">{marca.projeto}</p>
          <p className="mt-2 text-[0.95rem] text-tinta-suave">{site.rodape.aviso}</p>
        </div>
        <nav aria-label={site.rodape.navegacao} className="flex flex-wrap gap-x-2 gap-y-1">
          <Link href={rotas.comoFunciona} className="inline-flex min-h-11 items-center rounded-campo px-3 font-bold text-primaria hover:bg-info-fundo">
            {site.cabecalho.comoFunciona}
          </Link>
          <Link href={rotas.comoUsar} className="inline-flex min-h-11 items-center rounded-campo px-3 font-bold text-primaria hover:bg-info-fundo">
            {site.cabecalho.comoUsar}
          </Link>
          <Link href={rotas.entrar} className="inline-flex min-h-11 items-center rounded-campo px-3 font-bold text-primaria hover:bg-info-fundo">
            {site.cabecalho.entrar}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
