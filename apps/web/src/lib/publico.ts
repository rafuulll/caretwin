/**
 * As páginas e rotas ABERTAS do CareTwin: /demo e /ao-vivo.
 *
 * Tudo o mais exige conta e vínculo aprovado. Estas duas existem para a banca
 * ver o produto funcionando sem pedir acesso a ninguém, e por isso a regra é
 * bem estreita:
 *
 *   - só aparecem as pulseiras listadas em PULSEIRAS_PUBLICAS, uma lista de
 *     códigos CT-XXXX separados por vírgula, de pulseiras de demonstração.
 *     Sem a variável, ou com ela vazia, as duas páginas ficam desligadas e
 *     respondem como se não existissem;
 *   - qualquer outro código dá 404, o mesmo de um código que não existe;
 *   - só leitura: nenhuma rota pública grava nada;
 *   - cada endereço tem um limite de pedidos por minuto, para ninguém usar a
 *     página como bomba de consultas no banco.
 *
 * Para publicar uma pessoa de verdade, a família teria que pôr o código da
 * pulseira dela nessa variável. Por isso a lista mora no ambiente do servidor
 * (Vercel) e não no código.
 */

const CODIGO = /^CT-[A-Z0-9]{4}$/

export function codigosPublicos(env: Record<string, string | undefined> = process.env): string[] {
  const bruto = env.PULSEIRAS_PUBLICAS ?? ""
  const codigos = bruto
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => CODIGO.test(c))
  return [...new Set(codigos)]
}

/**
 * Qual pulseira o pedido quer. Sem `?pulseira=`, a primeira da lista. `null`
 * quando a lista está vazia ou o código não está nela.
 */
export function pulseiraPedida(pedido: string | null, env: Record<string, string | undefined> = process.env): string | null {
  const lista = codigosPublicos(env)
  if (lista.length === 0) return null
  if (pedido === null || pedido.trim() === "") return lista[0]
  const codigo = pedido.trim().toUpperCase()
  return lista.includes(codigo) ? codigo : null
}

// --- limite de pedidos por endereço -------------------------------------------

const JANELA_MS = 60_000
/** A página de tempo real pede 1 vez por segundo; 120 por minuto dá folga para duas abas. */
const MAXIMO_NA_JANELA = 120
const MAXIMO_DE_ENDERECOS = 2000

const pedidos = new Map<string, number[]>()

function enderecoDe(requisicao: Request) {
  const cabecalho = requisicao.headers.get("x-forwarded-for") ?? requisicao.headers.get("x-real-ip") ?? ""
  return cabecalho.split(",")[0].trim() || "local"
}

/**
 * `true` quando este endereço já passou do limite da janela. Conta o pedido
 * atual. A conta fica na memória do servidor: na Vercel cada instância conta o
 * seu, o que não é exato, mas basta para um laço de repetição não encher o banco.
 */
export function passouDoLimiteDeLeitura(requisicao: Request, agora = Date.now()): boolean {
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

export const LIMITE_DE_LEITURA = { janelaMs: JANELA_MS, maximo: MAXIMO_NA_JANELA }
