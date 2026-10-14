import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/marca/logo";
import { Icone } from "@/components/ui/icone";
import { FormularioEntrada } from "@/components/auth/formulario-entrada";
import { PreviaApp } from "@/components/marketing/previa-app";
import { entrada, rotas } from "@/content/site";

export const metadata: Metadata = { title: entrada.titulo };

export default function PaginaEntrar() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href={rotas.site} className="rounded-campo" aria-label={entrada.voltar}>
            <Logo />
          </Link>
          <Link href={rotas.site} className="inline-flex min-h-11 items-center gap-1.5 rounded-campo px-2 font-bold text-primaria hover:bg-info-fundo">
            <Icone nome="voltar" tamanho={18} />
            {entrada.voltar}
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10">
          <div className="cartao chegada p-6 sm:p-8">
            <h1 className="text-[1.9rem] font-bold tracking-[-0.015em]">{entrada.titulo}</h1>
            <p className="mt-2 text-tinta-suave">{entrada.subtitulo}</p>
            <div className="mt-7">
              <FormularioEntrada />
            </div>
          </div>
          <p className="mt-5 flex items-start gap-2 text-[0.95rem] text-tinta-suave">
            <Icone nome="seguro" tamanho={18} className="mt-0.5 text-primaria" />
            <span>
              {entrada.nota}{" "}
              <Link href={rotas.comoUsar} className="font-bold text-primaria underline underline-offset-4">
                {entrada.comoUsar}
              </Link>
              .
            </span>
          </p>
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-primaria px-12 py-16 text-sobre-primaria lg:flex lg:flex-col lg:justify-center" aria-label={entrada.vitrine.titulo}>
        <div className="mx-auto w-full max-w-lg">
          <h2 className="text-[2.2rem] font-bold leading-tight tracking-[-0.015em]">{entrada.vitrine.titulo}</h2>
          <p className="mt-4 text-[1.1rem] opacity-90">{entrada.vitrine.texto}</p>
          <ul className="mt-6 space-y-3">
            {entrada.vitrine.itens.map((item) => (
              <li key={item} className="flex items-center gap-3 font-bold">
                <span className="flex size-7 items-center justify-center rounded-full bg-sobre-primaria/15">
                  <Icone nome="ok" tamanho={16} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-12 text-tinta">
            <PreviaApp />
          </div>
        </div>
      </aside>
    </div>
  );
}
