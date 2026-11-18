import { NextResponse } from "next/server"
import { lerAoVivo } from "@/lib/ao-vivo"
import { conexao } from "@/lib/banco"
import { passouDoLimiteDeLeitura, pulseiraPedida } from "@/lib/publico"
import { registrarFalha } from "@/lib/registro"
import { erro } from "@/lib/rota-v1"

/**
 * GET /api/publico/ao-vivo?pulseira=CT-XXXX&depois=123
 *
 * Os lotes brutos mais novos de uma pulseira de demonstração, sem login. Só
 * responde para os códigos de PULSEIRAS_PUBLICAS (`src/lib/publico.ts`); para
 * qualquer outro, ou com a variável vazia, é um 404 igual ao de um código que
 * não existe. Somente leitura.
 */

export const dynamic = "force-dynamic"

const SEM_CACHE = { "Cache-Control": "no-store" }

export async function GET(requisicao: Request) {
  const url = new URL(requisicao.url)
  const codigo = pulseiraPedida(url.searchParams.get("pulseira"))
  if (!codigo) return erro(404, "Não encontrado.")

  const sql = conexao()
  if (!sql) return erro(503, "O banco não está ligado neste ambiente.")

  if (passouDoLimiteDeLeitura(requisicao)) {
    return NextResponse.json({ erro: "Muitos pedidos. Espere um pouco." }, { status: 429, headers: { ...SEM_CACHE, "Retry-After": "10" } })
  }

  const textoDepois = url.searchParams.get("depois")
  let depois: number | null = null
  if (textoDepois !== null && textoDepois !== "") {
    if (!/^\d{1,15}$/.test(textoDepois)) return erro(422, "O parâmetro depois precisa ser um número.", "invalido")
    depois = Number(textoDepois)
  }

  try {
    const resposta = await lerAoVivo(sql, codigo, depois)
    if (!resposta) return erro(404, "Não encontrado.")
    return NextResponse.json(resposta, { headers: SEM_CACHE })
  } catch (falha) {
    registrarFalha("api/publico/ao-vivo", falha)
    return erro(500, "Não deu certo agora. Tente de novo em alguns minutos.")
  }
}
