"use client";

/* Um valor pronto para copiar, para ninguém digitar endereço errado na primeira tentativa. */

import { useState } from "react";
import { Icone } from "./icone";

export function Copiavel({ valor, rotuloCopiar, rotuloCopiado }: { valor: string; rotuloCopiar: string; rotuloCopiado: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="mt-2 flex items-stretch overflow-hidden rounded-campo border border-borda-forte bg-suave">
      <code className="min-w-0 flex-1 px-3 py-2.5 text-[0.9rem] [overflow-wrap:anywhere]" translate="no">
        {valor}
      </code>
      <button
        type="button"
        className="flex min-h-11 items-center gap-1.5 border-l border-borda-forte px-3 text-[0.9rem] font-bold text-primaria hover:bg-info-fundo"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(valor);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          } catch {
            setCopiado(false);
          }
        }}
      >
        <Icone nome={copiado ? "ok" : "copiar"} tamanho={16} />
        <span aria-live="polite">{copiado ? rotuloCopiado : rotuloCopiar}</span>
      </button>
    </div>
  );
}
