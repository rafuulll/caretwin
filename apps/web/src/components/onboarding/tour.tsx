"use client";

/*
  Invólucro do tour da primeira visita (driver.js). Ele atravessa páginas: a parada do
  site fica guardada no sessionStorage, e o tour continua dentro do app depois que a
  pessoa entra. A marca de "já viu" fica no localStorage; fechar no X conta como visto.
  Parada cujo alvo não existe naquela tela é pulada.

  Para remover o tour: apague a pasta src/components/onboarding, o arquivo
  src/content/tour.ts e as duas linhas que montam <Tour /> (src/app/page.tsx e
  src/app/app/layout.tsx). Nada mais depende dele.
*/

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import "driver.js/dist/driver.css";
import { tour } from "@/content/tour";

const CHAVE_VISTO = "caretwin:tour:visto";
const CHAVE_PASSO = "caretwin:tour:passo";

function lerSeguro(armazenamento: () => Storage, chave: string): string | null {
  try {
    return armazenamento().getItem(chave);
  } catch {
    return null;
  }
}

function gravarSeguro(armazenamento: () => Storage, chave: string, valor: string | null) {
  try {
    if (valor === null) armazenamento().removeItem(chave);
    else armazenamento().setItem(chave, valor);
  } catch {
    // sem armazenamento, o tour só não lembra onde parou
  }
}

/** O primeiro elemento visível com aquele data-tour (o menu existe em duas versões: celular e computador). */
function encontrar(alvo: string): Element | null {
  const candidatos = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${alvo}"]`));
  return candidatos.find((el) => el.getClientRects().length > 0) ?? null;
}

function paginaCombina(pagina: string, caminho: string) {
  return pagina === "/" ? caminho === "/" : caminho.startsWith(pagina);
}

export function Tour() {
  const caminho = usePathname();

  useEffect(() => {
    if (lerSeguro(() => window.localStorage, CHAVE_VISTO)) return;
    const inicio = Number(lerSeguro(() => window.sessionStorage, CHAVE_PASSO) ?? "0") || 0;

    // As paradas desta página são as seguidas, a partir de onde o tour parou.
    const daPagina: number[] = [];
    for (let i = inicio; i < tour.paradas.length; i++) {
      if (!paginaCombina(tour.paradas[i].pagina, caminho)) break;
      daPagina.push(i);
    }
    if (daPagina.length === 0) return;

    let cancelado = false;
    let desmontando = false;
    let fechouNoX = false;
    let instancia: { destroy: () => void; isActive: () => boolean } | null = null;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timer = window.setTimeout(async () => {
      const { driver } = await import("driver.js");
      if (cancelado) return;
      const total = tour.paradas.length;
      const passos = daPagina
        .filter((i) => !tour.paradas[i].alvo || encontrar(tour.paradas[i].alvo!))
        .map((i) => {
          const parada = tour.paradas[i];
          const ultimaDaPagina = i === daPagina[daPagina.length - 1];
          const continuaEmOutraPagina = ultimaDaPagina && i < total - 1;
          return {
            element: parada.alvo ? () => encontrar(parada.alvo!) as Element : undefined,
            data: { indice: i, continuaEmOutraPagina },
            popover: {
              title: parada.titulo,
              description: parada.texto,
              progressText: tour.progresso.replace("{{current}}", String(i + 1)).replace("{{total}}", String(total)),
              doneBtnText: continuaEmOutraPagina ? tour.entendi : tour.concluir,
            },
          };
        });
      if (passos.length === 0) return;
      // O driver.js não devolve o campo "data" nos ganchos, então a informação de cada
      // passo é lida pela posição (opts.index).
      const meta = passos.map((p) => p.data);

      const instanciaDriver = driver({
        steps: passos,
        showProgress: true,
        popoverClass: "ct-tour",
        nextBtnText: tour.proximo,
        prevBtnText: tour.anterior,
        closeBtnLabel: tour.fechar,
        allowClose: true,
        animate: !reduzir,
        smoothScroll: !reduzir,
        overlayOpacity: 0.55,
        stagePadding: 6,
        stageRadius: 12,
        onHighlightStarted: (_elemento, _passo, { index }) => {
          const atual = meta[index ?? 0];
          if (!atual) return;
          const { indice, continuaEmOutraPagina } = atual;
          // Na última parada desta página, já deixa marcada a próxima, para o tour continuar
          // mesmo que a pessoa clique direto no botão destacado.
          gravarSeguro(() => window.sessionStorage, CHAVE_PASSO, String(continuaEmOutraPagina ? indice + 1 : indice));
        },
        onCloseClick: (_e, _p, { driver: d }) => {
          fechouNoX = true;
          d.destroy();
        },
        onDestroyStarted: (_e, _passo, { driver: d, index }) => {
          if (!desmontando) {
            const atual = meta[index ?? 0];
            const continuaEmOutraPagina = atual?.continuaEmOutraPagina ?? false;
            if (continuaEmOutraPagina && !fechouNoX && atual) {
              gravarSeguro(() => window.sessionStorage, CHAVE_PASSO, String(atual.indice + 1));
            }
            if (fechouNoX || !continuaEmOutraPagina) {
              gravarSeguro(() => window.localStorage, CHAVE_VISTO, "1");
              gravarSeguro(() => window.sessionStorage, CHAVE_PASSO, null);
            }
          }
          d.destroy();
        },
      });
      instancia = instanciaDriver;
      instanciaDriver.drive();
    }, 900);

    return () => {
      cancelado = true;
      window.clearTimeout(timer);
      if (instancia?.isActive()) {
        desmontando = true;
        instancia.destroy();
      }
    };
  }, [caminho]);

  return null;
}
