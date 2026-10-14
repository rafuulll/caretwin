import Link from "next/link";
import { Logo } from "@/components/marca/logo";
import { LinkBotao } from "@/components/ui/botao";
import { naoEncontrado, rotas } from "@/content/site";

export default function NaoEncontrado() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <Link href={rotas.site} className="rounded-campo">
        <Logo />
      </Link>
      <h1 className="mt-10 text-[2.2rem] font-bold tracking-[-0.015em]">{naoEncontrado.titulo}</h1>
      <p className="mt-3 text-[1.1rem] text-tinta-suave">{naoEncontrado.texto}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkBotao href={rotas.hoje} tamanho="grande" icone="hoje">
          {naoEncontrado.app}
        </LinkBotao>
        <LinkBotao href={rotas.site} tamanho="grande" variante="secundario">
          {naoEncontrado.site}
        </LinkBotao>
      </div>
    </main>
  );
}
