import { z } from "zod"
import { lerCorpo } from "@/lib/conta"
import { digitarCodigo } from "@/lib/familia"
import { erro, quemChama, responder } from "@/lib/rota-v1"

/**
 * POST /v1/vinculos: a conta digita o código da pulseira e diz se ela é sua
 * (acompanhada) ou de alguém que cuida (cuidador). Pulseira livre: 201, nasce
 * a pessoa. Pulseira com família: 202, vira pedido.
 *
 * Dez códigos inexistentes em 15 minutos: 429 com `quando` (a hora em que libera)
 * e o cabeçalho Retry-After (cartão 5.10). O contador mora no banco, na tabela
 * `tentativas_de_codigo`, porque cada chamada na Vercel pode cair num servidor
 * diferente; a regra está em `digitarCodigo` (`src/lib/familia.ts`).
 */

export const dynamic = "force-dynamic"

const ENTRADA = z.object({
  // Aceita o código em minúsculas e sem o traço, do jeito que a pessoa digitar.
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => v.replace(/^CT(?!-)/, "CT-"))
    .pipe(z.string().regex(/^CT-[A-Z0-9]{4}$/)),
  papel: z.enum(["cuidador", "acompanhada"]),
  nome: z.string().trim().min(1).max(80).optional(),
})

export async function POST(requisicao: Request) {
  const chamada = await quemChama()
  if ("recusa" in chamada) return chamada.recusa

  const corpo = await lerCorpo(requisicao, ENTRADA)
  if (!corpo) return erro(422, "Confira o código (formato CT-XXXX) e o papel.", "invalido")

  return responder(() => digitarCodigo(chamada.sessao.id, corpo))
}
