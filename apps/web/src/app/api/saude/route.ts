import { NextResponse } from "next/server"

/**
 * GET /api/saude: "o servidor está de pé". Só o Docker usa, para saber quando o
 * container terminou de subir. Não consulta o banco nem devolve dado nenhum.
 */

export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json({ status: "ok" })
}
