/* Estado vazio que ensina o próximo passo, em vez de uma tela em branco ou um monte de zeros. */

import type { ReactNode } from "react";
import { Icone, type NomeIcone } from "./icone";

export function EstadoVazio({ icone, titulo, texto, acao }: { icone: NomeIcone; titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="cartao flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-info-fundo text-primaria">
        <Icone nome={icone} tamanho={30} />
      </span>
      <h2 className="mt-5 text-xl font-bold">{titulo}</h2>
      <p className="mt-2 max-w-md text-tinta-suave">{texto}</p>
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}
