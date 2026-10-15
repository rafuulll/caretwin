import { NextResponse } from "next/server"
import { bancoConfigurado } from "@/lib/banco"

/**
 * A rota de saúde: responde 200 quando o servidor está de pé.
 *
 * Serve para três coisas: provar que o deploy subiu, ser o alvo de qualquer
 * checagem automática de "está no ar", e mostrar, sem abrir o painel da
 * Vercel, se a DATABASE_URL chegou neste ambiente.
 *
 * Ela não pede login de propósito, porque quem checa saúde é uma máquina sem
 * sessão. Por isso a resposta é minúscula e só diz se o banco está configurado,
 * nunca qual é, nem quais outras variáveis existem. Em produção a Vercel
 * Authentication ainda fica na frente de tudo, inclusive desta rota.
 *
 * Não toca no banco: "configurado" não é "respondendo". Uma checagem que
 * conversasse com o Postgres a cada chamada acordaria o projeto dormindo do
 * Neon e gastaria cota à toa.
 */

// Sempre a resposta de agora. Uma rota de saúde pré-renderizada no build diria
// "ok" para sempre, mesmo com o servidor fora do ar.
export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json({
    ok: true,
    banco: bancoConfigurado() ? "configurado" : "desligado",
  })
}
