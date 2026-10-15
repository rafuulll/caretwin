import postgres from "postgres"

/**
 * A conexão com o banco no Supabase (Postgres).
 *
 * O app inteiro funciona sem ele: sem `DATABASE_URL`, o `store` guarda tudo
 * no navegador, com os dados de exemplo, e ninguém precisa criar conta em
 * lugar nenhum pra rodar `npm run dev`. Com a `DATABASE_URL` no `.env.local`,
 * as rotas de `src/app/api/v1` acordam e leem as tabelas de
 * `banco/migracoes/` (as regras de quem vê qual pessoa estão em
 * `src/lib/familia.ts`).
 *
 * Antes existia aqui uma ponte que guardava as telas do protótipo numa tabela
 * só (`registros`), protegida pela lista EMAILS_PERMITIDOS. Ela saiu junto com
 * a lista: era uma tabela sem dono, e qualquer conta permitida via tudo.
 *
 * Este arquivo só é importado pelas rotas de `src/app/api`. A `DATABASE_URL`
 * traz a senha do banco dentro dela e nunca chega no navegador.
 */

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

export function conexao(): postgres.Sql | null {
  const url = urlDoBanco()
  if (!url) return null
  cliente ??= postgres(url, { prepare: false, max: 3, idle_timeout: 20 })
  return cliente
}
