import { z } from "zod"

/**
 * Os formatos aceitos pelas rotas de conta. A tela confere a mesma coisa antes
 * de enviar, mas quem vale é esta conferência: o navegador é de quem usa.
 */

export const EMAIL = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

/** 72 é o máximo que o Supabase considera de uma senha. Passar disso é ilusão de segurança. */
export const SENHA_NOVA = z.string().min(8).max(72)

/** No login não se exige o tamanho mínimo: a regra pode ter mudado depois que a conta nasceu. */
export const SENHA_ATUAL = z.string().min(1).max(72)

export const NOME = z.string().trim().min(2).max(80)

/** O token do link de nova senha. Só o tamanho é conferido aqui; quem valida é o Supabase. */
export const TOKEN = z.string().min(20).max(4096)
