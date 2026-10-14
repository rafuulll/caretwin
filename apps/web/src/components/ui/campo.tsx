"use client";

/*
  Campo de formulário: rótulo sempre visível, ajuda persistente embaixo, erro colado
  no campo e ligado por aria-describedby (o erro vem antes da ajuda, porque é o que
  a pessoa precisa ouvir primeiro). Altura mínima de 48px e texto de 17px, que também
  evita o zoom automático do iPhone.
*/

import { useId, useState, type ComponentProps, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { Icone } from "./icone";

type BaseProps = {
  rotulo: string;
  ajuda?: ReactNode;
  erro?: string | null;
  obrigatorio?: boolean;
  className?: string;
};

export const classeCampo =
  "block w-full min-h-12 rounded-campo border border-borda-campo bg-superficie px-4 py-2.5 text-base text-tinta " +
  "placeholder:text-tinta-suave/80 transition-[border-color,box-shadow] duration-200 " +
  "focus-visible:outline-none focus-visible:border-primaria focus-visible:ring-4 focus-visible:ring-primaria/20 " +
  "aria-invalid:border-perigo aria-invalid:focus-visible:ring-perigo/20";

function Rotulo({ htmlFor, texto, obrigatorio }: { htmlFor: string; texto: string; obrigatorio?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-bold text-tinta">
      {texto}
      {obrigatorio && (
        <span className="ml-1 text-perigo" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function Mensagens({ ajudaId, erroId, ajuda, erro }: { ajudaId: string; erroId: string; ajuda?: ReactNode; erro?: string | null }) {
  return (
    <>
      {erro && (
        <p id={erroId} className="mt-1.5 flex items-start gap-1.5 font-bold text-perigo">
          <Icone nome="atencao" tamanho={18} className="mt-0.5" />
          <span>{erro}</span>
        </p>
      )}
      {ajuda && (
        <p id={ajudaId} className="mt-1.5 text-[0.95rem] text-tinta-suave">
          {ajuda}
        </p>
      )}
    </>
  );
}

function descritoPor(ajudaId: string, erroId: string, ajuda?: ReactNode, erro?: string | null) {
  return [erro ? erroId : null, ajuda ? ajudaId : null].filter(Boolean).join(" ") || undefined;
}

type PropsCampo = BaseProps & Omit<ComponentProps<"input">, "className">;

export function Campo({ rotulo, ajuda, erro, obrigatorio, className, id, ...resto }: PropsCampo) {
  const gerado = useId();
  const idCampo = id ?? `campo-${gerado}`;
  const ajudaId = `${idCampo}-ajuda`;
  const erroId = `${idCampo}-erro`;
  return (
    <div className={className}>
      <Rotulo htmlFor={idCampo} texto={rotulo} obrigatorio={obrigatorio} />
      <input
        id={idCampo}
        className={classeCampo}
        aria-invalid={erro ? true : undefined}
        aria-required={obrigatorio || undefined}
        aria-describedby={descritoPor(ajudaId, erroId, ajuda, erro)}
        {...resto}
      />
      <Mensagens ajudaId={ajudaId} erroId={erroId} ajuda={ajuda} erro={erro} />
    </div>
  );
}

type PropsSenha = PropsCampo & { textoMostrar: string; textoEsconder: string };

/** Campo de senha com botão de mostrar e esconder. Colar e gerenciador de senha funcionam. */
export function CampoSenha({ rotulo, ajuda, erro, obrigatorio, className, id, textoMostrar, textoEsconder, ...resto }: PropsSenha) {
  const gerado = useId();
  const idCampo = id ?? `senha-${gerado}`;
  const ajudaId = `${idCampo}-ajuda`;
  const erroId = `${idCampo}-erro`;
  const [visivel, setVisivel] = useState(false);
  return (
    <div className={className}>
      <Rotulo htmlFor={idCampo} texto={rotulo} obrigatorio={obrigatorio} />
      <div className="relative">
        <input
          id={idCampo}
          type={visivel ? "text" : "password"}
          className={cn(classeCampo, "pr-14")}
          aria-invalid={erro ? true : undefined}
          aria-required={obrigatorio || undefined}
          aria-describedby={descritoPor(ajudaId, erroId, ajuda, erro)}
          spellCheck={false}
          autoCapitalize="none"
          {...resto}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-campo text-tinta-suave hover:text-tinta"
          aria-label={visivel ? textoEsconder : textoMostrar}
          aria-pressed={visivel}
          aria-controls={idCampo}
        >
          <Icone nome={visivel ? "esconder" : "mostrar"} />
        </button>
      </div>
      <Mensagens ajudaId={ajudaId} erroId={erroId} ajuda={ajuda} erro={erro} />
    </div>
  );
}

type ItemResumo = { campoId: string; mensagem: string };

/**
 * Resumo de erros: aparece no topo do formulário depois de uma tentativa de envio,
 * recebe o foco e liga cada item ao campo com problema. Os erros embaixo de cada
 * campo continuam lá.
 */
export function ResumoDeErros({ titulo, itens, refResumo }: { titulo: string; itens: ItemResumo[]; refResumo: Ref<HTMLDivElement> }) {
  if (itens.length === 0) return null;
  return (
    <div
      ref={refResumo}
      tabIndex={-1}
      role="alert"
      aria-labelledby="resumo-erros-titulo"
      className="rounded-campo border-2 border-perigo bg-superficie p-4 focus-visible:outline-offset-4"
    >
      <p id="resumo-erros-titulo" className="flex items-center gap-2 font-bold text-perigo">
        <Icone nome="atencao" />
        {titulo}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-9">
        {itens.map((item) => (
          <li key={item.campoId}>
            <a
              href={`#${item.campoId}`}
              className="text-tinta underline underline-offset-4"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.campoId)?.focus();
              }}
            >
              {item.mensagem}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
