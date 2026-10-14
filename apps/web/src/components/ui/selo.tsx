/*
  Selo de situação: cor, ícone e texto juntos. Nunca só a cor, para quem não distingue
  verde de âmbar e para quem imprime em preto e branco.
*/

import type { ReactNode } from "react";
import type { Situacao } from "@/lib/modelo";
import { situacoes } from "@/content/app";
import { cn } from "@/lib/cn";
import { Icone, type NomeIcone } from "./icone";

const ESTILO: Record<Situacao, { classe: string; icone: NomeIcone }> = {
  dentro: { classe: "bg-bom-fundo text-bom", icone: "dentro" },
  abaixo: { classe: "bg-atencao-fundo text-atencao", icone: "abaixo" },
  acima: { classe: "bg-info-fundo text-info", icone: "acima" },
  sem_dados: { classe: "bg-suave text-tinta-suave", icone: "semDados" },
};

export function SeloSituacao({ situacao, className, curto = false }: { situacao: Situacao; className?: string; curto?: boolean }) {
  const estilo = ESTILO[situacao];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.9rem] font-bold", estilo.classe, className)}>
      <Icone nome={estilo.icone} tamanho={16} />
      {curto ? situacoes[situacao].rotulo.replace(" do normal", "") : situacoes[situacao].rotulo}
    </span>
  );
}

type Tom = "neutro" | "info" | "atencao" | "bom";

const TONS: Record<Tom, string> = {
  neutro: "bg-suave text-tinta-suave",
  info: "bg-info-fundo text-info",
  atencao: "bg-atencao-fundo text-atencao",
  bom: "bg-bom-fundo text-bom",
};

export function Selo({ tom = "neutro", icone, children, className }: { tom?: Tom; icone?: NomeIcone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.9rem] font-bold", TONS[tom], className)}>
      {icone && <Icone nome={icone} tamanho={16} />}
      {children}
    </span>
  );
}
