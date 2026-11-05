"use client";
import { useEffect, useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { redesign } from "@/content/site";
import { escolherPessoa, useDados, usePessoaNaTela } from "@/lib/store";

export function SeletorPessoa() {
  const { dados } = useDados();
  const pessoa = usePessoaNaTela();
  const [aberto, setAberto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240 });
  const botao = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!aberto) return;
    function position() {
      const r = botao.current?.getBoundingClientRect();
      if (r)
        setPos({
          top: r.bottom + 8,
          left: Math.max(
            12,
            Math.min(r.left, window.innerWidth - Math.max(r.width, 240) - 12),
          ),
          width: Math.max(r.width, 240),
        });
    }
    position();
    const frame = requestAnimationFrame(() =>
      menu.current
        ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
        ?.focus({ preventScroll: true }),
    );
    function outside(e: PointerEvent) {
      if (
        !menu.current?.contains(e.target as Node) &&
        !botao.current?.contains(e.target as Node)
      )
        setAberto(false);
    }
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    document.addEventListener("pointerdown", outside);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      document.removeEventListener("pointerdown", outside);
    };
  }, [aberto]);
  if (!pessoa) return null;
  const initials = (nome: string) =>
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  function close() {
    setAberto(false);
    botao.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <button
        type="button"
        ref={botao}
        className="ct-person-trigger"
        aria-label={redesign.changePerson}
        aria-haspopup="menu"
        aria-controls={aberto ? id : undefined}
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp"].includes(e.key)) {
            e.preventDefault();
            setAberto(true);
          }
        }}
      >
        <span className="ct-avatar" aria-hidden="true">
          {initials(pessoa.nome)}
        </span>
        <span>{pessoa.nome}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {aberto &&
        createPortal(
          <div
            ref={menu}
            id={id}
            role="menu"
            aria-label={redesign.changePerson}
            className="ct-person-menu"
            style={pos}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                close();
              }
              if (e.key === "Tab") setAberto(false);
              if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const items = Array.from(
                  menu.current?.querySelectorAll<HTMLButtonElement>("button") ??
                    [],
                );
                const n = items.indexOf(
                  document.activeElement as HTMLButtonElement,
                );
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? items.length - 1
                      : (n + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
                        items.length;
                items[next]?.focus({ preventScroll: true });
              }
            }}
          >
            {dados.pessoas.map((p) => (
              <button
                type="button"
                key={p.id}
                role="menuitemradio"
                aria-checked={p.id === pessoa.id}
                onClick={() => {
                  escolherPessoa(p.id);
                  close();
                }}
              >
                <span className="ct-avatar" aria-hidden="true">
                  {initials(p.nome)}
                </span>
                <span>{p.nome}</span>
                {p.id === pessoa.id && <Check aria-hidden="true" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
