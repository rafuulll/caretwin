"use client"

import { Button, Modal } from "@/components/ui"
import { sistema } from "@/content/site"
import { Icone } from "../icone"

const textos = sistema.alertas.ia.modal

/**
 * Como ligar a IA de verdade. Os links externos abrem em aba nova e são os
 * únicos do app fora do passo a passo do Google: é onde se pega uma chave.
 */
export function ModalIa({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={textos.titulo}
      descricao={textos.descricao}
      icone={<Icone nome="escrever" />}
      rodape={<Button onClick={aoFechar}>{textos.fechar}</Button>}
    >
      <ol className="flex flex-col gap-4">
        {textos.passos.map((passo, indice) => (
          <li key={passo.titulo} className="flex gap-3">
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-ink"
            >
              {indice + 1}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink">{passo.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{passo.texto}</p>
              {"link" in passo && passo.link && (
                <a
                  href={passo.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink underline underline-offset-4"
                >
                  {passo.link.rotulo}
                  <Icone nome="link-externo" className="size-3.5" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  )
}
