import postgres from "postgres"
import type { Alerta, Dados, DiaRegistrado, Pessoa, Pulseira } from "./types"

/**
 * O banco no Supabase (Postgres), montado e desligado.
 *
 * Esta é a ponte: guarda as telas fora do navegador numa tabela só, enquanto as
 * rotas novas da API (que leem as tabelas de banco/migracoes/) não estão no
 * ar. É o caminho já testado pra guardar os dados num Postgres sem tocar em
 * tela nenhuma.
 *
 * O app inteiro funciona sem ele: o `store` guarda tudo no navegador e ninguém
 * precisa criar conta em lugar nenhum pra rodar `npm run dev`. Quando a
 * `DATABASE_URL` aparece no `.env.local`, este arquivo acorda, cria a tabela
 * sozinho na primeira chamada e o `store` passa a falar com o Postgres em vez
 * do navegador. Não tem código pra escrever no meio: é colar a conexão.
 *
 * SOBRE O FORMATO DA TABELA. É uma tabela só, com a coleção, o id e o registro
 * em `jsonb`. É a escolha que sobrevive a um produto ainda mudando: um campo
 * novo na pessoa, uma métrica nova no dia registrado ou um cadastro a mais não
 * pedem migração aqui. Numa coluna por campo, cada mudança de ideia no produto viraria
 * `ALTER TABLE`. As tabelas de verdade, com chave estrangeira e as regras de
 * vínculo, estão em `banco/migracoes/0001_tabelas.sql`.
 *
 * Este arquivo só é importado pelas rotas de `src/app/api`. A `DATABASE_URL`
 * traz a senha do banco dentro dela e nunca chega no navegador.
 */

/** As coleções que o app guarda hoje. Serve de porteiro do que vem da rede. */
export const COLECOES = ["pessoas", "pulseiras", "dias", "alertas"] as const
export type Colecao = (typeof COLECOES)[number]

export function ehColecao(valor: unknown): valor is Colecao {
  return typeof valor === "string" && (COLECOES as readonly string[]).includes(valor)
}

function urlDoBanco(): string | null {
  return process.env.DATABASE_URL?.trim() || null
}

export function bancoConfigurado(): boolean {
  return urlDoBanco() !== null
}

/**
 * Uma conexão só por servidor, criada na primeira vez que alguém precisa.
 *
 * O `postgres` abre um pequeno grupo de conexões e reaproveita. Criar um novo a
 * cada requisição abriria conexões sem fim até o banco recusar. Ele também não
 * conecta na hora em que é criado, só na primeira consulta.
 *
 * O jsonb vai sempre por `sql.json(objeto)`, nunca como texto com `::jsonb`:
 * este driver já converte o objeto, e um texto convertido de novo seria
 * gravado como uma string dentro do jsonb, não como o registro.
 *
 * `prepare: false` é exigência do pooler do Supabase (o endereço da porta
 * 6543, o certo para a Vercel): ele reparte a mesma conexão entre muitas
 * requisições e não guarda consultas preparadas de uma para a outra.
 */
let cliente: postgres.Sql | null = null

/** Também usada pelas rotas de `/api/v1`, que leem as tabelas de verdade (`src/lib/familia.ts`). */
export function conexao(): postgres.Sql | null {
  const url = urlDoBanco()
  if (!url) return null
  cliente ??= postgres(url, { prepare: false, max: 3, idle_timeout: 20 })
  return cliente
}

/**
 * Cria a tabela na primeira chamada e nunca mais.
 *
 * A promessa fica guardada de propósito: sem isso, duas requisições ao mesmo
 * tempo no primeiro acesso rodariam o `CREATE TABLE` em paralelo. O `IF NOT
 * EXISTS` já protege do erro, mas a corrida gastaria duas idas ao banco em toda
 * inicialização.
 */
let preparacao: Promise<void> | null = null

async function preparar(sql: postgres.Sql) {
  if (!preparacao) {
    preparacao = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS registros (
          colecao    text        NOT NULL,
          id         text        NOT NULL,
          dados      jsonb       NOT NULL,
          criado_em  timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (colecao, id)
        )
      `
      // A ordem das telas é sempre "mais novo primeiro". Sem este índice, cada
      // listagem varre a tabela inteira pra ordenar.
      await sql`
        CREATE INDEX IF NOT EXISTS registros_colecao_criado_em
        ON registros (colecao, criado_em DESC)
      `
      // O Supabase publica toda tabela do schema public numa API automática.
      // RLS ligada sem regra nenhuma fecha essa porta; o app segue lendo e
      // gravando porque é o dono da tabela.
      await sql`ALTER TABLE registros ENABLE ROW LEVEL SECURITY`
    })().catch((erro) => {
      // Falhou a preparação, esquece a promessa: a próxima requisição tenta de
      // novo em vez de herdar o erro pra sempre.
      preparacao = null
      throw erro
    })
  }
  return preparacao
}

/** Devolve a conexão já com a tabela garantida, ou `null` se não tem banco. */
async function pronto() {
  const sql = conexao()
  if (!sql) return null
  await preparar(sql)
  return sql
}

type Linha = { colecao: string; id: string; dados: unknown }

function montar(linhas: Linha[]): Dados {
  const dados: Dados = { pessoas: [], pulseiras: [], dias: [], alertas: [] }
  for (const linha of linhas) {
    if (linha.colecao === "pessoas") dados.pessoas.push(linha.dados as Pessoa)
    else if (linha.colecao === "pulseiras") dados.pulseiras.push(linha.dados as Pulseira)
    else if (linha.colecao === "dias") dados.dias.push(linha.dados as DiaRegistrado)
    else if (linha.colecao === "alertas") dados.alertas.push(linha.dados as Alerta)
  }
  return dados
}

export async function lerTudo(): Promise<Dados | null> {
  const sql = await pronto()
  if (!sql) return null
  const linhas = await sql<Linha[]>`
    SELECT colecao, id, dados FROM registros ORDER BY criado_em DESC
  `
  return montar(linhas)
}

export async function inserir(colecao: Colecao, item: { id: string }): Promise<void> {
  const sql = await pronto()
  if (!sql) return
  await sql`
    INSERT INTO registros (colecao, id, dados)
    VALUES (${colecao}, ${item.id}, ${sql.json(item as postgres.JSONValue)})
    ON CONFLICT (colecao, id) DO UPDATE SET dados = EXCLUDED.dados
  `
}

/**
 * Aplica um patch parcial sem trazer o registro pra cá primeiro.
 *
 * O `||` do jsonb funde os dois objetos dentro do banco, numa ida só. Ler,
 * mesclar em JavaScript e gravar de volta seriam duas idas com uma janela no
 * meio onde outra aba poderia gravar por cima.
 */
export async function atualizar(
  colecao: Colecao,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const sql = await pronto()
  if (!sql) return
  await sql`
    UPDATE registros
    SET dados = dados || ${sql.json(patch as postgres.JSONValue)}
    WHERE colecao = ${colecao} AND id = ${id}
  `
}

export async function remover(colecao: Colecao, id: string): Promise<void> {
  const sql = await pronto()
  if (!sql) return
  await sql`DELETE FROM registros WHERE colecao = ${colecao} AND id = ${id}`

  // Apagar uma pessoa apaga o que só existia por causa dela: a pulseira, os
  // dias registrados e os alertas. A regra é a mesma do `removerPessoa` do
  // store, e ela mora nos dois lugares porque cada um pode ser o único ligado.
  // Um dia isso vira chave estrangeira com ON DELETE CASCADE.
  if (colecao === "pessoas") {
    await sql`
      DELETE FROM registros
      WHERE colecao IN ('pulseiras', 'dias', 'alertas')
        AND dados ->> 'pessoaId' = ${id}
    `
  }
}

/**
 * Troca todo o conteúdo de uma vez, numa transação.
 *
 * É o que está por trás de "restaurar exemplos" e "limpar tudo" na tela de
 * configurações. Apagar e inserir em duas idas soltas deixaria o banco vazio se
 * a segunda falhasse; dentro da transação, ou troca inteiro ou não troca.
 */
export async function substituirTudo(dados: Dados): Promise<void> {
  const sql = await pronto()
  if (!sql) return

  const linhas: Array<[Colecao, string, postgres.JSONValue]> = []
  for (const colecao of COLECOES) {
    for (const item of dados[colecao] as Array<{ id: string }>) {
      linhas.push([colecao, item.id, item as postgres.JSONValue])
    }
  }

  await sql.begin(async (tx) => {
    await tx`DELETE FROM registros`
    for (const [colecao, id, corpo] of linhas) {
      await tx`
        INSERT INTO registros (colecao, id, dados)
        VALUES (${colecao}, ${id}, ${tx.json(corpo)})
      `
    }
  })
}
