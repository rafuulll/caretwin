"use client";

/* O passo a passo para ligar o login com Google, com os endereços prontos para copiar. */

import { Dialogo } from "@/components/ui/dialogo";
import { Copiavel } from "@/components/ui/copiavel";
import { Icone } from "@/components/ui/icone";
import { Botao } from "@/components/ui/botao";
import { entrada } from "@/content/site";

export function ModalGoogle({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const m = entrada.modalGoogle;
  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={m.titulo}
      descricao={m.intro}
      rotuloFechar={m.fechar}
      largura="larga"
      rodape={<Botao onClick={aoFechar}>{m.fechar}</Botao>}
    >
      <ol className="space-y-5">
        {m.passos.map((passo, i) => (
          <li key={passo.texto} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-info-fundo font-bold text-info">{i + 1}</span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p>{passo.texto}</p>
              {"copiar" in passo && passo.copiar && <Copiavel valor={passo.copiar} rotuloCopiar={m.copiar} rotuloCopiado={m.copiado} />}
              {"link" in passo && passo.link && (
                <a
                  href={passo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-bold text-primaria underline underline-offset-4"
                >
                  {passo.rotuloLink}
                  <Icone nome="externo" tamanho={16} />
                  <span className="sr-only">{m.abreEmNovaAba}</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Dialogo>
  );
}
