"use client";

/*
  A casca do app: menu, pessoa acompanhada e botão de sair em toda tela de dentro.

  Navegação adaptativa, como a skill recomenda: no computador, uma coluna lateral;
  no celular, uma barra fixa embaixo com os cinco destinos, rótulo e ícone (mais fácil
  de alcançar com o polegar e sempre visível, o que ajuda quem tem pouca intimidade com
  apps). Uma marcação só por destino, e o item ativo é evidente sem depender só da cor:
  fundo, peso da fonte, marcador e aria-current.

  A trava de sessão fica aqui: sem sessão, a pessoa volta para a tela de entrar.
*/

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { definirPreferencias, sair, useDados, usePreferencias, useSessao } from "@/lib/store";
import { alertasNovos, pessoaAtiva } from "@/lib/consultas";
import { iniciais } from "@/lib/formato";
import { casca, rotas, site } from "@/content/site";
import { Icone, type NomeIcone } from "@/components/ui/icone";
import { Logo, Simbolo } from "@/components/marca/logo";
import { AvisoConexao } from "./aviso-conexao";

function useItemAtivo() {
  const caminho = usePathname();
  return (href: string) => caminho === href || caminho.startsWith(`${href}/`);
}

function Distintivo({ quantidade }: { quantidade: number }) {
  if (quantidade === 0) return null;
  return (
    <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-atencao px-1.5 text-[0.8rem] font-bold leading-6 text-superficie">
      {quantidade}
      <span className="sr-only">, {casca.alertasNovos(quantidade)}</span>
    </span>
  );
}

function MenuLateral({ novos }: { novos: number }) {
  const ativo = useItemAtivo();
  return (
    <nav aria-label={casca.menuPrincipal} data-tour="menu" className="mt-8">
      <ul className="space-y-1">
        {casca.itens.map((item) => {
          const marcado = ativo(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={marcado ? "page" : undefined}
                className={cn(
                  "relative flex min-h-12 items-center gap-3 rounded-campo px-4 text-[1.05rem] transition-colors duration-200",
                  marcado ? "bg-info-fundo font-bold text-tinta" : "text-tinta-suave hover:bg-suave hover:text-tinta",
                )}
              >
                {marcado && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-full bg-primaria" />}
                <Icone nome={item.icone as NomeIcone} className={marcado ? "text-primaria" : undefined} />
                {item.rotulo}
                {item.href === rotas.alertas && <Distintivo quantidade={novos} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MenuInferior({ novos }: { novos: number }) {
  const ativo = useItemAtivo();
  return (
    <nav
      aria-label={casca.menuPrincipal}
      data-tour="menu"
      className="nao-imprimir fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {casca.itens.map((item) => {
          const marcado = ativo(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={marcado ? "page" : undefined}
                className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.8rem] leading-tight"
              >
                <span
                  className={cn(
                    "relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200",
                    marcado ? "bg-info-fundo text-primaria" : "text-tinta-suave",
                  )}
                >
                  <Icone nome={item.icone as NomeIcone} tamanho={22} />
                  {item.href === rotas.alertas && novos > 0 && (
                    <span className="absolute -right-0.5 -top-1 flex size-5 items-center justify-center rounded-full bg-atencao text-[0.7rem] font-bold text-superficie">
                      {novos}
                      <span className="sr-only">, {casca.alertasNovos(novos)}</span>
                    </span>
                  )}
                </span>
                <span className={cn("truncate", marcado ? "font-bold text-tinta" : "text-tinta-suave")}>
                  {item.rotulo}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function BarraSuperior({ nome }: { nome: string }) {
  const router = useRouter();
  const dados = useDados();
  const preferencias = usePreferencias();
  const [saindo, setSaindo] = useState(false);
  const atual = dados ? pessoaAtiva(dados, preferencias) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-borda bg-fundo/90 backdrop-blur supports-[backdrop-filter]:bg-fundo/75">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href={rotas.hoje} className="rounded-campo text-primaria lg:hidden" aria-label={site.cabecalho.inicio}>
          <Simbolo tamanho={30} />
        </Link>

        <div data-tour="perfil" className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          {dados && dados.pessoas.length > 0 && atual && (
            <label className="flex min-w-0 items-center gap-2">
              <span className="hidden text-[0.95rem] text-tinta-suave sm:inline">{casca.acompanhando}</span>
              <span className="sr-only sm:hidden">{casca.acompanhando}</span>
              <span className="relative">
                <select
                  value={atual.id}
                  onChange={(e) => definirPreferencias({ pessoaAtivaId: e.target.value })}
                  aria-label={casca.trocarPessoa}
                  className="min-h-11 max-w-[11rem] appearance-none truncate rounded-campo border border-borda-campo bg-superficie py-2 pl-3 pr-9 font-bold text-tinta sm:max-w-none"
                >
                  {dados.pessoas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.comoChamar}
                    </option>
                  ))}
                </select>
                <Icone nome="abrir" tamanho={18} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-tinta-suave" />
              </span>
            </label>
          )}

          <span
            className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-primaria font-bold text-sobre-primaria sm:flex"
            title={casca.quemEntrou(nome)}
          >
            <span aria-hidden="true">{iniciais(nome)}</span>
            <span className="sr-only">{casca.quemEntrou(nome)}</span>
          </span>

          <button
            type="button"
            onClick={() => {
              setSaindo(true);
              sair();
              router.replace(rotas.entrar);
            }}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-campo border border-borda-campo bg-superficie px-3 font-bold text-tinta hover:bg-suave"
          >
            <Icone nome="sair" tamanho={18} />
            {saindo ? casca.saindo : casca.sair}
          </button>
        </div>
      </div>
    </header>
  );
}

function Carregando() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status">
      <span className="flex items-center gap-3 text-tinta-suave">
        <Simbolo tamanho={28} className="animate-pulse text-primaria motion-reduce:animate-none" />
        {casca.carregando}
      </span>
    </div>
  );
}

export function Casca({ children }: { children: ReactNode }) {
  const sessao = useSessao();
  const dados = useDados();
  const router = useRouter();

  useEffect(() => {
    if (sessao === null) router.replace(rotas.entrar);
  }, [sessao, router]);

  // O conteúdo da tela é sempre montado (a navegação continua instantânea), mas só
  // aparece depois que a sessão e os dados foram lidos do navegador.
  const pronto = Boolean(sessao && dados);
  const preferencias = usePreferencias();
  const ativa = dados ? pessoaAtiva(dados, preferencias) : null;
  // O número no menu é o da pessoa que está na tela, igual ao que a tela de Alertas mostra.
  const novos = dados && ativa ? alertasNovos(dados, ativa.id) : 0;

  return (
    <>
      {!pronto && <Carregando />}
      <div hidden={!pronto} className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-campo bg-superficie px-4 py-3 font-bold text-primaria shadow-ct-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {site.pularParaConteudo}
        </a>

        <aside className="nao-imprimir hidden border-r border-borda bg-superficie lg:block">
          <div className="sticky top-0 flex h-dvh flex-col px-4 py-5">
            <Link href={rotas.hoje} className="rounded-campo px-2" aria-label={site.cabecalho.inicio}>
              <Logo />
            </Link>
            <MenuLateral novos={novos} />
            <p className="mt-auto px-2 text-[0.85rem] text-tinta-suave">{casca.rodape}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <AvisoConexao />
          <BarraSuperior nome={sessao?.nome ?? ""} />
          <main id="conteudo" tabIndex={-1} data-tour="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-6 focus:outline-none sm:px-6 lg:pb-16 lg:pt-8">
            {children}
          </main>
        </div>

        <MenuInferior novos={novos} />
      </div>
    </>
  );
}
