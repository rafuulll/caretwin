import type postgres from "postgres"
import { criarAlertasNovos } from "./alertas"
import { conexao } from "./banco"
import { confirmacaoConfere, DIAS_PARA_RECUPERAR } from "./encerramento"

/**
 * Quem vê qual pessoa: usuários, pessoas, pulseiras e vínculos (cartão 5.9).
 *
 * Este arquivo é o miolo das rotas de `src/app/api/v1`. Ele lê e grava nas
 * tabelas de `banco/migracoes`, e cada função recebe o id de quem está
 * chamando: nada aqui confia em id de usuário vindo do navegador.
 *
 * As regras, em uma frase cada:
 *   - Digitar o código de uma pulseira livre cria a pessoa, e quem digitou
 *     administra a família.
 *   - Digitar o código de uma pulseira que já tem família cria um pedido.
 *   - Administram quem cadastrou (pessoas.cadastrada_por) e a própria pessoa
 *     acompanhada, quando aprovada.
 *   - Quando a família fica sem administrador, o cuidador aprovado mais
 *     antigo assume.
 *   - O último membro não sai: encerra, com frase de confirmação e 30 dias
 *     para recuperar.
 *   - Sem vínculo aprovado, a pessoa "não existe" (404), para não revelar ids.
 *
 * Toda mudança na família acontece numa transação que trava a linha da pessoa
 * (`for update`). Assim dois cliques ao mesmo tempo, como dois administradores
 * aprovando e removendo juntos, não deixam a família num estado impossível.
 *
 * As respostas seguem `docs/openapi.yaml` (v0.2): camelCase, e erro como
 * `{ erro, codigo?, quando? }`.
 */

export { DIAS_PARA_RECUPERAR }

export type Papel = "cuidador" | "acompanhada"

export type PulseiraVisivel = {
  id: string
  codigo: string
  bateria: number | null
  ultimaSincronizacao: string | null
}

export type PessoaComPulseira = {
  id: string
  nome: string
  criadoEm: string
  papel: Papel
  administra: boolean
  pulseira: PulseiraVisivel | null
}

export type Pedido = { pessoaId: string; codigo: string; papel: Papel; criadoEm: string }
export type PedidoRecebido = { usuarioId: string; nome: string; papel: Papel; criadoEm: string }
export type Membro = { usuarioId: string; nome: string; papel: Papel; administra: boolean; desde: string }
export type Encerramento = { pessoaId: string; nome: string; encerradoEm: string; apagaEm: string }

export type Resultado<T> =
  | { ok: true; status: number; corpo: T }
  | { ok: false; status: number; erro: string; codigo?: string; quando?: string }

/** As peças abaixo sempre rodam dentro de uma transação, inclusive as leituras. */
type Sql = postgres.TransactionSql

function certo<T>(corpo: T, status = 200): Resultado<T> {
  return { ok: true, status, corpo }
}

function falha<T>(status: number, erro: string, codigo?: string, quando?: string): Resultado<T> {
  return { ok: false, status, erro, codigo, quando }
}

const TEXTO_NAO_ENCONTRADO = "Não encontrado."
const TEXTO_SO_ADMIN = "Só quem administra a família pode fazer isso."

function naoEncontrado<T>(): Resultado<T> {
  return falha(404, TEXTO_NAO_ENCONTRADO)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Id fora do formato nem chega ao banco: para quem chamou, é só "não existe". */
export function ehUuid(valor: string): boolean {
  return UUID.test(valor)
}

function iso(valor: Date | string | null): string | null {
  if (valor === null) return null
  return (valor instanceof Date ? valor : new Date(valor)).toISOString()
}

function apagaEm(encerradoEm: Date | string): string {
  const inicio = encerradoEm instanceof Date ? encerradoEm : new Date(encerradoEm)
  return new Date(inicio.getTime() + DIAS_PARA_RECUPERAR * 24 * 60 * 60 * 1000).toISOString()
}

function banco(): postgres.Sql {
  const sql = conexao()
  // As rotas conferem antes; chegar aqui sem banco é erro de programação.
  if (!sql) throw new Error("banco desligado")
  return sql
}

// --- a frase de confirmação ------------------------------------------------

// A frase e o prazo moram em `encerramento.ts` porque a tela também usa.
export { confirmacaoConfere, fraseDeEncerramento } from "./encerramento"

// --- leituras ----------------------------------------------------------------

type LinhaPessoa = {
  id: string
  nome: string
  criado_em: Date
  papel: Papel
  administra: boolean
  pulseira_id: string | null
  codigo: string | null
  bateria: number | null
  ultima_sincronizacao: Date | null
}

function pessoaDaLinha(l: LinhaPessoa): PessoaComPulseira {
  return {
    id: l.id,
    nome: l.nome,
    criadoEm: iso(l.criado_em) ?? "",
    papel: l.papel,
    administra: l.administra,
    pulseira:
      l.pulseira_id && l.codigo
        ? {
            id: l.pulseira_id,
            codigo: l.codigo,
            bateria: l.bateria,
            ultimaSincronizacao: iso(l.ultima_sincronizacao),
          }
        : null,
  }
}

/**
 * As pessoas que o usuário vê: vínculo aprovado e pessoa não encerrada.
 * `pessoaId` opcional filtra uma só. É a regra de acesso de toda leitura.
 */
async function pessoasVisiveis(sql: Sql, usuarioId: string, pessoaId?: string) {
  const linhas = await sql<LinhaPessoa[]>`
    select
      p.id, p.nome, p.criado_em, v.papel,
      (coalesce(p.cadastrada_por = ${usuarioId}, false) or v.papel = 'acompanhada') as administra,
      pu.id as pulseira_id, pu.codigo, pu.bateria, pu.ultima_sincronizacao
    from vinculos v
    join pessoas p on p.id = v.pessoa_id
    left join pulseiras pu on pu.pessoa_id = p.id
    where v.usuario_id = ${usuarioId}
      and v.aprovado
      and p.encerrado_em is null
      ${pessoaId ? sql`and p.id = ${pessoaId}` : sql``}
    order by v.criado_em
  `
  return linhas.map(pessoaDaLinha)
}

export async function listarPessoas(usuarioId: string): Promise<Resultado<PessoaComPulseira[]>> {
  return certo(await banco().begin((tx) => pessoasVisiveis(tx, usuarioId)))
}

export async function lerPessoa(usuarioId: string, pessoaId: string): Promise<Resultado<PessoaComPulseira>> {
  if (!ehUuid(pessoaId)) return naoEncontrado()
  const [pessoa] = await banco().begin((tx) => pessoasVisiveis(tx, usuarioId, pessoaId))
  return pessoa ? certo(pessoa) : naoEncontrado()
}

/** O que `GET /v1/me` acrescenta à sessão: os pedidos pendentes e os encerramentos recuperáveis. */
export async function situacaoDoUsuario(
  usuarioId: string
): Promise<{ pedidosPendentes: Pedido[]; encerradas: Encerramento[] }> {
  const sql = banco()
  const pedidos = await sql<{ pessoa_id: string; codigo: string; papel: Papel; criado_em: Date }[]>`
    select v.pessoa_id, pu.codigo, v.papel, v.criado_em
    from vinculos v
    join pessoas p on p.id = v.pessoa_id
    join pulseiras pu on pu.pessoa_id = p.id
    where v.usuario_id = ${usuarioId} and not v.aprovado and p.encerrado_em is null
    order by v.criado_em
  `
  const encerradas = await sql<{ id: string; nome: string; encerrado_em: Date }[]>`
    select id, nome, encerrado_em
    from pessoas
    where encerrado_por = ${usuarioId}
      and encerrado_em > now() - make_interval(days => ${DIAS_PARA_RECUPERAR})
    order by encerrado_em desc
  `
  return {
    pedidosPendentes: pedidos.map((l) => ({
      pessoaId: l.pessoa_id,
      codigo: l.codigo,
      papel: l.papel,
      criadoEm: iso(l.criado_em) ?? "",
    })),
    encerradas: encerradas.map((l) => ({
      pessoaId: l.id,
      nome: l.nome,
      encerradoEm: iso(l.encerrado_em) ?? "",
      apagaEm: apagaEm(l.encerrado_em),
    })),
  }
}

// --- peças das transações ---------------------------------------------------

type PessoaTravada = {
  id: string
  nome: string
  cadastrada_por: string | null
  encerrado_em: Date | null
}

type MeuVinculo = { papel: Papel; aprovado: boolean }

/** Trava a pessoa até o fim da transação. Toda mudança na família começa aqui. */
async function travarPessoa(tx: Sql, pessoaId: string): Promise<PessoaTravada | null> {
  const [pessoa] = await tx<PessoaTravada[]>`
    select id, nome, cadastrada_por, encerrado_em from pessoas where id = ${pessoaId} for update
  `
  return pessoa ?? null
}

async function vinculoDe(tx: Sql, usuarioId: string, pessoaId: string): Promise<MeuVinculo | null> {
  const [vinculo] = await tx<MeuVinculo[]>`
    select papel, aprovado from vinculos where usuario_id = ${usuarioId} and pessoa_id = ${pessoaId}
  `
  return vinculo ?? null
}

function administra(pessoa: PessoaTravada, usuarioId: string, vinculo: MeuVinculo | null): boolean {
  if (!vinculo?.aprovado) return false
  return pessoa.cadastrada_por === usuarioId || vinculo.papel === "acompanhada"
}

/**
 * Depois de alguém sair ou ser removido: se quem cadastrou já não é membro, o
 * posto fica vago; e se a família ficou sem nenhum administrador (sem quem
 * cadastrou e sem acompanhada aprovada), o cuidador aprovado mais antigo
 * assume. Pedido pendente não conta: quem não foi aprovado não herda nada.
 */
async function garantirAdministrador(tx: Sql, pessoaId: string) {
  await tx`
    update pessoas set cadastrada_por = null
    where id = ${pessoaId}
      and cadastrada_por is not null
      and not exists (
        select 1 from vinculos
        where pessoa_id = ${pessoaId} and usuario_id = pessoas.cadastrada_por and aprovado
      )
  `
  await tx`
    update pessoas set cadastrada_por = (
      select usuario_id from vinculos
      where pessoa_id = ${pessoaId} and aprovado and papel = 'cuidador'
      order by criado_em
      limit 1
    )
    where id = ${pessoaId}
      and cadastrada_por is null
      and not exists (
        select 1 from vinculos where pessoa_id = ${pessoaId} and aprovado and papel = 'acompanhada'
      )
  `
}

async function outrosMembrosAprovados(tx: Sql, usuarioId: string, pessoaId: string): Promise<number> {
  const [linha] = await tx<{ total: number }[]>`
    select count(*)::int as total from vinculos
    where pessoa_id = ${pessoaId} and aprovado and usuario_id <> ${usuarioId}
  `
  return linha?.total ?? 0
}

/** Membro aprovado e pessoa não encerrada. Fora disso, para quem chamou, a pessoa não existe. */
async function exigirMembro(tx: Sql, usuarioId: string, pessoaId: string) {
  const pessoa = await travarPessoa(tx, pessoaId)
  if (!pessoa || pessoa.encerrado_em) return null
  const vinculo = await vinculoDe(tx, usuarioId, pessoaId)
  if (!vinculo?.aprovado) return null
  return { pessoa, vinculo, administra: administra(pessoa, usuarioId, vinculo) }
}

function ehViolacaoDeUnico(erro: unknown): boolean {
  return typeof erro === "object" && erro !== null && (erro as { code?: string }).code === "23505"
}

// --- digitar o código ---------------------------------------------------------

export type CodigoDigitado = { codigo: string; papel: Papel; nome?: string }

/**
 * `POST /v1/vinculos`. A pulseira é travada antes de tudo: duas contas
 * digitando o mesmo código livre ao mesmo tempo não criam duas pessoas.
 */
export async function digitarCodigo(
  usuarioId: string,
  entrada: CodigoDigitado
): Promise<Resultado<PessoaComPulseira | Pedido>> {
  try {
    return await banco().begin(async (tx) => {
      const [pulseira] = await tx<{ id: string; pessoa_id: string | null }[]>`
        select id, pessoa_id from pulseiras where codigo = ${entrada.codigo} for update
      `
      if (!pulseira) return falha(404, "Não existe pulseira com esse código.", "codigo_inexistente")

      // Pulseira livre: nasce a pessoa, e quem digitou administra.
      if (!pulseira.pessoa_id) {
        const nome = entrada.nome?.trim()
        if (!nome) return falha(422, "Falta o nome da pessoa.", "nome_obrigatorio")

        const [pessoa] = await tx<{ id: string }[]>`
          insert into pessoas (nome, cadastrada_por) values (${nome}, ${usuarioId}) returning id
        `
        await tx`update pulseiras set pessoa_id = ${pessoa.id} where id = ${pulseira.id}`
        await tx`
          insert into vinculos (usuario_id, pessoa_id, papel, aprovado)
          values (${usuarioId}, ${pessoa.id}, ${entrada.papel}, true)
        `
        // O que a pulseira mandou antes de ter dona ganha a pessoa agora.
        await tx`update dias set pessoa_id = ${pessoa.id} where pulseira_id = ${pulseira.id} and pessoa_id is null`
        // E os alertas desses dias nascem agora, sem esperar o próximo envio da pulseira.
        await criarAlertasNovos(tx, pessoa.id)

        const [visivel] = await pessoasVisiveis(tx, usuarioId, pessoa.id)
        return certo<PessoaComPulseira | Pedido>(visivel, 201)
      }

      // Pulseira com família: vira pedido.
      const pessoa = await travarPessoa(tx, pulseira.pessoa_id)
      if (!pessoa) return falha(404, "Não existe pulseira com esse código.", "codigo_inexistente")
      if (pessoa.encerrado_em) {
        return falha(
          409,
          "Esta pulseira está travada porque o acompanhamento foi encerrado.",
          "pulseira_em_encerramento",
          apagaEm(pessoa.encerrado_em)
        )
      }
      if (await vinculoDe(tx, usuarioId, pessoa.id)) {
        return falha(409, "Você já faz parte desta família ou já pediu para entrar.", "ja_tem_vinculo")
      }
      if (entrada.papel === "acompanhada") {
        const [dona] = await tx`
          select 1 from vinculos where pessoa_id = ${pessoa.id} and papel = 'acompanhada' and aprovado
        `
        if (dona) return falha(409, "Esta pulseira já tem dona ou dono.", "ja_tem_acompanhada")
      }

      const [pedido] = await tx<{ criado_em: Date }[]>`
        insert into vinculos (usuario_id, pessoa_id, papel, aprovado)
        values (${usuarioId}, ${pessoa.id}, ${entrada.papel}, false)
        returning criado_em
      `
      return certo<PessoaComPulseira | Pedido>(
        { pessoaId: pessoa.id, codigo: entrada.codigo, papel: entrada.papel, criadoEm: iso(pedido.criado_em) ?? "" },
        202
      )
    })
  } catch (erro) {
    if (ehViolacaoDeUnico(erro)) {
      return falha(409, "Você já faz parte desta família ou já pediu para entrar.", "ja_tem_vinculo")
    }
    throw erro
  }
}

// --- membros -------------------------------------------------------------------

export async function listarMembros(usuarioId: string, pessoaId: string): Promise<Resultado<Membro[]>> {
  if (!ehUuid(pessoaId)) return naoEncontrado()
  return banco().begin(async (tx) => {
    if (!(await exigirMembro(tx, usuarioId, pessoaId))) return naoEncontrado<Membro[]>()
    const linhas = await tx<{ usuario_id: string; nome: string; papel: Papel; administra: boolean; criado_em: Date }[]>`
      select
        v.usuario_id, u.nome, v.papel, v.criado_em,
        (coalesce(p.cadastrada_por = v.usuario_id, false) or v.papel = 'acompanhada') as administra
      from vinculos v
      join usuarios u on u.id = v.usuario_id
      join pessoas p on p.id = v.pessoa_id
      where v.pessoa_id = ${pessoaId} and v.aprovado
      order by v.criado_em
    `
    return certo(
      linhas.map((l) => ({
        usuarioId: l.usuario_id,
        nome: l.nome,
        papel: l.papel,
        administra: l.administra,
        desde: iso(l.criado_em) ?? "",
      }))
    )
  })
}

/** Remover um cuidador. A pessoa acompanhada não pode ser removida por outra conta. */
export async function removerMembro(usuarioId: string, pessoaId: string, alvoId: string): Promise<Resultado<null>> {
  if (!ehUuid(pessoaId) || !ehUuid(alvoId)) return naoEncontrado()
  return banco().begin(async (tx) => {
    const eu = await exigirMembro(tx, usuarioId, pessoaId)
    if (!eu) return naoEncontrado<null>()
    if (alvoId === usuarioId) {
      return falha<null>(409, "Para sair da família, use a opção de sair.", "use_sair")
    }
    if (!eu.administra) return falha<null>(403, TEXTO_SO_ADMIN, "so_admin")

    const alvo = await vinculoDe(tx, alvoId, pessoaId)
    if (!alvo?.aprovado) return naoEncontrado<null>()
    if (alvo.papel === "acompanhada") {
      return falha<null>(403, "A pessoa acompanhada não pode ser removida por outra conta.", "nao_remove_acompanhada")
    }

    await tx`delete from vinculos where usuario_id = ${alvoId} and pessoa_id = ${pessoaId}`
    await garantirAdministrador(tx, pessoaId)
    return certo(null, 204)
  })
}

// --- pedidos -------------------------------------------------------------------

export async function listarPedidos(usuarioId: string, pessoaId: string): Promise<Resultado<PedidoRecebido[]>> {
  if (!ehUuid(pessoaId)) return naoEncontrado()
  return banco().begin(async (tx) => {
    const eu = await exigirMembro(tx, usuarioId, pessoaId)
    if (!eu) return naoEncontrado<PedidoRecebido[]>()
    if (!eu.administra) return falha<PedidoRecebido[]>(403, TEXTO_SO_ADMIN, "so_admin")

    const linhas = await tx<{ usuario_id: string; nome: string; papel: Papel; criado_em: Date }[]>`
      select v.usuario_id, u.nome, v.papel, v.criado_em
      from vinculos v
      join usuarios u on u.id = v.usuario_id
      where v.pessoa_id = ${pessoaId} and not v.aprovado
      order by v.criado_em
    `
    return certo(
      linhas.map((l) => ({ usuarioId: l.usuario_id, nome: l.nome, papel: l.papel, criadoEm: iso(l.criado_em) ?? "" }))
    )
  })
}

export async function recusarPedido(usuarioId: string, pessoaId: string, alvoId: string): Promise<Resultado<null>> {
  if (!ehUuid(pessoaId) || !ehUuid(alvoId)) return naoEncontrado()
  return banco().begin(async (tx) => {
    const eu = await exigirMembro(tx, usuarioId, pessoaId)
    if (!eu) return naoEncontrado<null>()
    if (!eu.administra) return falha<null>(403, TEXTO_SO_ADMIN, "so_admin")

    const apagados = await tx`
      delete from vinculos where usuario_id = ${alvoId} and pessoa_id = ${pessoaId} and not aprovado returning 1
    `
    return apagados.length > 0 ? certo(null, 204) : naoEncontrado<null>()
  })
}

export async function aprovarPedido(usuarioId: string, pessoaId: string, alvoId: string): Promise<Resultado<Membro>> {
  if (!ehUuid(pessoaId) || !ehUuid(alvoId)) return naoEncontrado()
  try {
    return await banco().begin(async (tx) => {
      const eu = await exigirMembro(tx, usuarioId, pessoaId)
      if (!eu) return naoEncontrado<Membro>()
      if (!eu.administra) return falha<Membro>(403, TEXTO_SO_ADMIN, "so_admin")

      const alvo = await vinculoDe(tx, alvoId, pessoaId)
      if (!alvo || alvo.aprovado) return naoEncontrado<Membro>()
      if (alvo.papel === "acompanhada") {
        const [dona] = await tx`
          select 1 from vinculos where pessoa_id = ${pessoaId} and papel = 'acompanhada' and aprovado
        `
        if (dona) return falha<Membro>(409, "Esta pessoa já tem uma conta como acompanhada.", "ja_tem_acompanhada")
      }

      const [linha] = await tx<{ nome: string; criado_em: Date }[]>`
        update vinculos v set aprovado = true
        from usuarios u
        where v.usuario_id = ${alvoId} and v.pessoa_id = ${pessoaId} and u.id = v.usuario_id
        returning u.nome, v.criado_em
      `
      return certo<Membro>({
        usuarioId: alvoId,
        nome: linha.nome,
        papel: alvo.papel,
        administra: alvo.papel === "acompanhada" || eu.pessoa.cadastrada_por === alvoId,
        desde: iso(linha.criado_em) ?? "",
      })
    })
  } catch (erro) {
    // O índice único do banco é a última trava contra duas acompanhadas.
    if (ehViolacaoDeUnico(erro)) {
      return falha(409, "Esta pessoa já tem uma conta como acompanhada.", "ja_tem_acompanhada")
    }
    throw erro
  }
}

// --- sair, encerrar e recuperar ---------------------------------------------------

/** Sair da família, ou desistir de um pedido pendente. Os dias e alertas ficam. */
export async function sair(usuarioId: string, pessoaId: string): Promise<Resultado<null>> {
  if (!ehUuid(pessoaId)) return naoEncontrado()
  return banco().begin(async (tx) => {
    const pessoa = await travarPessoa(tx, pessoaId)
    if (!pessoa || pessoa.encerrado_em) return naoEncontrado<null>()
    const vinculo = await vinculoDe(tx, usuarioId, pessoaId)
    if (!vinculo) return naoEncontrado<null>()

    if (vinculo.aprovado && (await outrosMembrosAprovados(tx, usuarioId, pessoaId)) === 0) {
      return falha<null>(
        409,
        "Você é a última pessoa da família. Para sair, encerre o acompanhamento.",
        "ultimo_membro"
      )
    }

    await tx`delete from vinculos where usuario_id = ${usuarioId} and pessoa_id = ${pessoaId}`
    if (vinculo.aprovado) await garantirAdministrador(tx, pessoaId)
    return certo(null, 204)
  })
}

/**
 * Encerrar: só o último membro, só com a frase certa. Nada é apagado aqui. A
 * pessoa ganha a data de encerramento e some de tudo; os pedidos pendentes
 * saem; a tarefa agendada da migração 0004 apaga de vez depois de 30 dias.
 */
export async function encerrar(
  usuarioId: string,
  pessoaId: string,
  confirmacao: string
): Promise<Resultado<Encerramento>> {
  if (!ehUuid(pessoaId)) return naoEncontrado()
  return banco().begin(async (tx) => {
    const eu = await exigirMembro(tx, usuarioId, pessoaId)
    if (!eu) return naoEncontrado<Encerramento>()
    if ((await outrosMembrosAprovados(tx, usuarioId, pessoaId)) > 0) {
      return falha<Encerramento>(
        409,
        "Ainda há outras pessoas na família. Nesse caso, o caminho é sair.",
        "outros_membros"
      )
    }
    if (!confirmacaoConfere(confirmacao, eu.pessoa.nome)) {
      return falha<Encerramento>(422, "A frase de confirmação não confere.", "confirmacao_errada")
    }

    await tx`delete from vinculos where pessoa_id = ${pessoaId} and not aprovado`
    const [linha] = await tx<{ encerrado_em: Date }[]>`
      update pessoas set encerrado_em = now(), encerrado_por = ${usuarioId}
      where id = ${pessoaId}
      returning encerrado_em
    `
    return certo<Encerramento>({
      pessoaId,
      nome: eu.pessoa.nome,
      encerradoEm: iso(linha.encerrado_em) ?? "",
      apagaEm: apagaEm(linha.encerrado_em),
    })
  })
}

/** Desfazer o encerramento: só quem encerrou, só dentro do prazo. */
export async function recuperar(usuarioId: string, pessoaId: string): Promise<Resultado<PessoaComPulseira>> {
  if (!ehUuid(pessoaId)) return naoEncontrado()
  return banco().begin(async (tx) => {
    const [pessoa] = await tx<{ id: string }[]>`
      select id from pessoas
      where id = ${pessoaId}
        and encerrado_por = ${usuarioId}
        and encerrado_em > now() - make_interval(days => ${DIAS_PARA_RECUPERAR})
      for update
    `
    if (!pessoa) return naoEncontrado<PessoaComPulseira>()

    await tx`update pessoas set encerrado_em = null, encerrado_por = null where id = ${pessoaId}`
    await garantirAdministrador(tx, pessoaId)

    const [visivel] = await pessoasVisiveis(tx, usuarioId, pessoaId)
    return visivel ? certo(visivel) : naoEncontrado<PessoaComPulseira>()
  })
}
