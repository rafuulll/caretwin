import { z } from "zod"
import { lerCorpo } from "@/lib/conta"
import { digitarCodigo } from "@/lib/familia"
import { erro, quemChama, responder } from "@/lib/rota-v1"

/**
 * POST /v1/vinculos: a conta digita o código da pulseira e diz se ela é sua
 * (acompanhada) ou de alguém que cuida (cuidador). Pulseira livre: 201, nasce
 * a pessoa. Pulseira com família: 202, vira pedido.
 *
 * Falta limitar tentativas seguidas com códigos errados, como o contrato pede.
 * Numa rota da Vercel, um contador em memória não serve (cada chamada pode cair
 * num servidor diferente); isso vai precisar de uma tabela própria.
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
