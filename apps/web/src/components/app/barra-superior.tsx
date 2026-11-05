"use client";
import type { RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sistema, redesign } from "@/content/site";
import type { Sessao } from "@/lib/types";
import { useConta } from "@/lib/store";
import { Icone } from "./icone";
import { Logo } from "./logo";

type PropsBarraSuperior = {
  sessao: Sessao;
  menuAberto: boolean;
  aoAbrirMenu: () => void;
  aoSair: () => void;
  refBotaoMenu: RefObject<HTMLButtonElement | null>;
};
export function BarraSuperior({
  sessao,
  menuAberto,
  aoAbrirMenu,
  aoSair,
  refBotaoMenu,
}: PropsBarraSuperior) {
  const pathname = usePathname();
  const conta = useConta();
  const initials = sessao.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <header className="ct-topbar">
      <Button
        ref={refBotaoMenu}
        variante="fantasma"
        onClick={aoAbrirMenu}
        aria-label={sistema.casca.abrirMenu}
        aria-controls="barra-lateral"
        aria-expanded={menuAberto}
        iconeEsquerda={<Icone nome="menu" />}
        className="shrink-0 lg:hidden"
      />
      <Link href="/app/painel" className="lg:hidden">
        <Logo />
      </Link>
      <nav className="ct-top-links" aria-label={sistema.casca.navegacao}>
        <Link
          href="/app/painel"
          aria-current={
            !pathname.startsWith("/app/familia") ? "page" : undefined
          }
        >
          {redesign.following}
        </Link>
        {conta && (
          <Link
            href="/app/familia"
            aria-current={
              pathname.startsWith("/app/familia") ? "page" : undefined
            }
          >
            {redesign.family}
          </Link>
        )}
      </nav>
      <div className="ct-topbar-end" data-tour="perfil">
        <Link
          className="ct-round-link"
          href="/app/alertas"
          aria-label={redesign.viewChanges}
        >
          <Icone nome="alertas" />
        </Link>
        <Link href="/app/configuracoes" className="ct-account" aria-label={`${sessao.nome}, ${redesign.account}`}>
          <span className="ct-avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="ct-account-copy">
            <span>{sessao.nome}</span>
            <small>{redesign.account}</small>
          </span>
        </Link>
        <Button
          variante="fantasma"
          onClick={aoSair}
          aria-label={sistema.casca.sair}
          iconeEsquerda={<Icone nome="sair" />}
        >
          <span>{sistema.casca.sair}</span>
        </Button>
      </div>
    </header>
  );
}
