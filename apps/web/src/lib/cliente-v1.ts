import type {
  Encerramento,
  Membro,
  Papel,
  Pedido,
  PedidoRecebido,
  PessoaComPulseira,
} from "./familia"
import type { Sessao } from "./types"

/**
 * As chamadas do navegador às rotas de `src/app/api/v1`.
 *
 * Só o `store` importa este arquivo: as telas falam com o `store`, e ele fala
 * daqui com o servidor. Os tipos vêm de `familia.ts` com `import type`, que
 * some no build, então nada do banco chega ao navegador.
 *
 * Nenhuma função aqui lança erro. Toda resposta vira `ok: true` ou `ok: false`
 * com o `codigo` do contrato, porque é pelo código que a tela escolhe a frase
 * certa. Sem rede, o código é `sem_rede` e o status é 0.
 */

export type { Encerramento, Membro, Papel, Pedido, PedidoRecebido, PessoaComPulseira }

/** O que `GET /v1/me` devolve: a sessão, os pedidos que esperam e o que dá para recuperar. */
export type Eu = Sessao & {
  id: string
  pedidosPendentes: Pedido[]
  encerradas: Encerramento[]
}

export type Resposta<T> =
  | { ok: true; status: number; corpo: T }
  | { ok: false; status: number; erro: string; codigo?: string; quando?: string }

async function chamar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<Resposta<T>> {
  let resposta: Response
  try {
    resposta = await fetch(`/api/v1${caminho}`, {
      method: metodo,
      cache: "no-store",
      headers: corpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    })
  } catch {
    return { ok: false, status: 0, erro: "", codigo: "sem_rede" }
  }

  if (resposta.status === 204) return { ok: true, status: 204, corpo: null as T }

  let json: unknown = null
  try {
    json = await resposta.json()
  } catch {
    // Resposta sem corpo ou fora do formato: o status sozinho já diz o bastante.
  }

  if (resposta.ok) return { ok: true, status: resposta.status, corpo: json as T }
  const falha = (json ?? {}) as { erro?: unknown; codigo?: unknown; quando?: unknown }
  return {
    ok: false,
    status: resposta.status,
    erro: typeof falha.erro === "string" ? falha.erro : "",
    codigo: typeof falha.codigo === "string" ? falha.codigo : undefined,
    quando: typeof falha.quando === "string" ? falha.quando : undefined,
  }
}

/** O id vai no caminho; `encodeURIComponent` impede que um id estranho mude a rota chamada. */
const p = (id: string) => encodeURIComponent(id)

export const v1 = {
  eu: () => chamar<Eu>("GET", "/me"),
  pessoas: () => chamar<PessoaComPulseira[]>("GET", "/pessoas"),

  digitarCodigo: (entrada: { codigo: string; papel: Papel; nome?: string }) =>
    chamar<PessoaComPulseira | Pedido>("POST", "/vinculos", entrada),

  membros: (pessoaId: string) => chamar<Membro[]>("GET", `/pessoas/${p(pessoaId)}/membros`),
  removerMembro: (pessoaId: string, usuarioId: string) =>
    chamar<null>("DELETE", `/pessoas/${p(pessoaId)}/membros/${p(usuarioId)}`),

  pedidos: (pessoaId: string) => chamar<PedidoRecebido[]>("GET", `/pessoas/${p(pessoaId)}/pedidos`),
  aprovar: (pessoaId: string, usuarioId: string) =>
    chamar<Membro>("POST", `/pessoas/${p(pessoaId)}/pedidos/${p(usuarioId)}/aprovar`),
  recusar: (pessoaId: string, usuarioId: string) =>
    chamar<null>("DELETE", `/pessoas/${p(pessoaId)}/pedidos/${p(usuarioId)}`),

  /** Sair da família, ou desistir de um pedido: a rota é a mesma. */
  sair: (pessoaId: string) => chamar<null>("DELETE", `/pessoas/${p(pessoaId)}/vinculo`),
  encerrar: (pessoaId: string, confirmacao: string) =>
    chamar<Encerramento>("POST", `/pessoas/${p(pessoaId)}/encerrar`, { confirmacao }),
  recuperar: (pessoaId: string) => chamar<PessoaComPulseira>("POST", `/pessoas/${p(pessoaId)}/recuperar`),
}
