import { z } from "zod"
import { lerCorpo } from "@/lib/conta"
import { explicarAlerta } from "@/lib/ia/explicar"
import { erro } from "@/lib/rota-v1"
import type { ExplicacaoDoAlerta } from "@/lib/types"

/**
 * POST /v1/ia/explicar: a explicação em linguagem natural para os alertas de
 * EXEMPLO (cartão 6.3), os do modo demonstração, que moram no navegador e não
 * têm conta nem banco por trás.
 *
 * O corpo traz só os números que o navegador já calculou com a regra do normal.
 * Nada aqui toca em dados de ninguém: não lê sessão, não lê banco e não grava
 * nada. O texto passa pelo mesmo verificador (6.2) e, sem modelo ligado, volta
 * o texto de regra. Com `OLLAMA_URL` no `.env.local`, o Ollama do notebook
 * escreve: é o que aparece no vídeo do pitch.
 */

export const dynamic = "force-dynamic"
export const maxDuration = 30

const numero = z.number().finite().min(0).max(1_000_000)

const esquema = z.object({
  nome: z.string().trim().min(1).max(60),
  metrica: z.enum(["passos", "sono", "batimentos"]),
  direcao: z.enum(["abaixo", "acima"]),
  valor: numero,
  normal: numero,
  desvio: z.number().finite().min(0).max(1000),
  chave: z.string().min(1).max(120),
})

export async function POST(requisicao: Request) {
  const corpo = await lerCorpo(requisicao, esquema)
  if (!corpo) return erro(400, "Pedido inválido.")

  const { chave, ...fatos } = corpo
  const resultado = await explicarAlerta(fatos, chave)
  if (resultado.origem === "regra" && resultado.motivo === "reprovado") {
    console.warn("[ia] texto do modelo bloqueado:", resultado.bloqueios?.join(",") ?? "")
  }

  const explicacao: ExplicacaoDoAlerta =
    resultado.origem === "ia"
      ? { alertaId: chave, texto: resultado.texto, origem: "ia", modelo: resultado.modelo }
      : { alertaId: chave, texto: resultado.texto, origem: "regra" }
  return Response.json(explicacao)
}
