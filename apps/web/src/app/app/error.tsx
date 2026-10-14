"use client";

import { Botao, LinkBotao } from "@/components/ui/botao";
import { Icone } from "@/components/ui/icone";
import { erroNaTela, rotas } from "@/content/site";

/* Se uma tela quebrar, a casca continua de pé e a pessoa tem como tentar de novo. */
export default function ErroNaTela({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="cartao mx-auto max-w-xl p-8 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-atencao-fundo text-atencao">
        <Icone nome="atencao" tamanho={28} />
      </span>
      <h1 className="mt-4 text-[1.5rem] font-bold">{erroNaTela.titulo}</h1>
      <p className="mt-2 text-tinta-suave">{erroNaTela.texto}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Botao icone="restaurar" onClick={reset}>
          {erroNaTela.tentar}
        </Botao>
        <LinkBotao href={rotas.hoje} variante="secundario">
          {erroNaTela.voltar}
        </LinkBotao>
      </div>
    </div>
  );
}
