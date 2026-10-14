/*
  Validação dos formulários com zod, num lugar só. As mensagens vêm da copy das telas,
  para continuarem em português de gente.
*/

import { z } from "zod";
import { primeiroUso, ajustes } from "@/content/app";

export const esquemaPessoa = z.object({
  nome: z.string().trim().min(2, primeiroUso.erros.nome),
  comoChamar: z.string().trim().max(40),
  idade: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) >= 1 && Number(v) <= 120), primeiroUso.erros.idade),
  quemAcompanha: z.string().trim().min(2, primeiroUso.erros.quemAcompanha),
});

export type FormPessoa = z.infer<typeof esquemaPessoa>;

export const esquemaCodigo = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^CT-[A-Z0-9]{4}$/, primeiroUso.erros.codigo);

export const esquemaPerfil = z.object({
  nome: z.string().trim().min(2, ajustes.perfil.erroNome),
});

/** Transforma os erros do zod em { campo: mensagem }, com a primeira mensagem de cada campo. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? "");
    if (campo && !saida[campo]) saida[campo] = problema.message;
  }
  return saida;
}
