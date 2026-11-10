import { z } from "zod"
import { lerCorpo } from "@/lib/conta"
import { resumirDia } from "@/lib/ia/explicar"
import { erro } from "@/lib/rota-v1"

/**
 * POST /v1/ia/resumo: o resumo do dia escrito pela IA local (cartão 6.3),
 * conferido pelo verificador (6.2) antes de sair.
 *
 * Igual a `/v1/ia/explicar`: o navegador manda só os números que já calculou
 * com a regra do normal, e esta rota não lê sessão, não lê banco e não grava
 * nada. Sem modelo ligado, ou com texto reprovado, a resposta traz
 * `origem: "regra"` e a tela usa os textos de exemplo, como antes.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 30

const numero = z.number().finite().min(0).max(1_000_000)
const situacao = z.enum(["abaixo", "dentro", "acima", "aprendendo"])

const esquema = z.object({
  nome: z.string().trim().min(1).max(60),
  passos: numero.nullable(),
  normalDePassos: numero.nullable(),
  situacaoPassos: situacao,
  sono: numero.nullable(),
  situacaoSono: situacao,
  ultimoBpm: numero.nullable(),
  alertasNovos: z.number().int().min(0).max(100),
  chave: z.string().min(1).max(120),
})

export async function POST(requisicao: Request) {
  const corpo = await lerCorpo(requisicao, esquema)
  if (!corpo) return erro(400, "Pedido inválido.")

  const { chave, ...fatos } = corpo
  const resultado = await resumirDia(fatos, chave)
  if (resultado.origem === "regra" && resultado.motivo === "reprovado") {
    console.warn("[ia] resumo do modelo bloqueado:", resultado.bloqueios?.join(",") ?? "")
  }
  return Response.json(
    resultado.origem === "ia"
      ? { texto: resultado.texto, origem: "ia", modelo: resultado.modelo }
      : { texto: resultado.texto, origem: "regra" }
  )
}
