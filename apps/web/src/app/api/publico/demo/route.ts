import { NextResponse } from "next/server"
import { conexao } from "@/lib/banco"
import { dadosDaDemo } from "@/lib/demo-publica"
import { codigosPublicos, passouDoLimiteDeLeitura, pulseiraPedida } from "@/lib/publico"
import { registrarFalha } from "@/lib/registro"
import { erro } from "@/lib/rota-v1"

/**
 * GET /api/publico/demo?pulseira=CT-XXXX
 *
 * Os dias, a pulseira e os alertas da pessoa de demonstração, no mesmo formato
 * que o app usa, para a página /demo. Sem login, só leitura, só para os
 * códigos de PULSEIRAS_PUBLICAS. Devolve também a lista de códigos públicos
 * para a página oferecer a troca quando houver mais de uma.
 *
 * Não sai nenhum id do banco: `dadosDaDemo` troca todos por ids simples.
 */

export const dynamic = "force-dynamic"

const SEM_CACHE = { "Cache-Control": "no-store" }

export async function GET(requisicao: Request) {
  const codigo = pulseiraPedida(new URL(requisicao.url).searchParams.get("pulseira"))
  if (!codigo) return erro(404, "Não encontrado.")

  const sql = conexao()
  if (!sql) return erro(503, "O banco não está ligado neste ambiente.")

  if (passouDoLimiteDeLeitura(requisicao)) {
    return NextResponse.json({ erro: "Muitos pedidos. Espere um pouco." }, { status: 429, headers: { ...SEM_CACHE, "Retry-After": "10" } })
  }

  try {
    const dados = await dadosDaDemo(sql, codigo)
    if (!dados) return erro(404, "Não encontrado.")
    return NextResponse.json({ pulseira: codigo, pulseiras: codigosPublicos(), dados }, { headers: SEM_CACHE })
  } catch (falha) {
    registrarFalha("api/publico/demo", falha)
    return erro(500, "Não deu certo agora. Tente de novo em alguns minutos.")
  }
}
