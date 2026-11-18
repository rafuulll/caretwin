/**
 * Freio para as rotas de IA abertas (as da demonstração, sem login).
 *
 * Quem chama uma rota dessas gasta a cota da chave do projeto, então cada
 * endereço tem um número de pedidos por janela. A conta fica na memória do
 * servidor: na Vercel cada instância conta o seu, o que não é exato, mas basta
 * para um curioso com um laço de repetição não esvaziar a cota. Sem modelo
 * ligado a rota não gasta nada, e quem chama não passa por aqui.
 */

const JANELA_MS = 10 * 60 * 1000
const MAXIMO_NA_JANELA = 30
const MAXIMO_DE_ENDERECOS = 2000

const pedidos = new Map<string, number[]>()

function enderecoDe(requisicao: Request) {
  const cabecalho = requisicao.headers.get("x-forwarded-for") ?? requisicao.headers.get("x-real-ip") ?? ""
  return cabecalho.split(",")[0].trim() || "local"
}

/** `true` quando este endereço já passou do número de pedidos da janela. Conta o pedido atual. */
export function passouDoLimite(requisicao: Request, agora = Date.now()): boolean {
  const endereco = enderecoDe(requisicao)
  const recentes = (pedidos.get(endereco) ?? []).filter((quando) => agora - quando < JANELA_MS)
  if (recentes.length >= MAXIMO_NA_JANELA) {
    pedidos.set(endereco, recentes)
    return true
  }
  recentes.push(agora)
  if (pedidos.size >= MAXIMO_DE_ENDERECOS && !pedidos.has(endereco)) pedidos.clear()
  pedidos.set(endereco, recentes)
  return false
}

export const LIMITE_DE_PEDIDOS = { janelaMs: JANELA_MS, maximo: MAXIMO_NA_JANELA }
