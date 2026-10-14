-- =============================================================================
-- O QUE O APP CRIA SOZINHO NO NEON
-- =============================================================================
--
-- Você NÃO precisa rodar este arquivo. Na primeira vez que o app fala com o
-- banco, ele executa exatamente isto (veja `preparar()` em src/lib/banco.ts).
-- O arquivo existe pra você poder LER o desenho sem caçar dentro do código, e
-- pra rodar na mão se um dia quiser recriar o banco do zero.
--
-- Como rodar na mão, se quiser: abra o SQL Editor no painel do Neon
-- (https://console.neon.tech), cole tudo e execute.
--
-- No CareTwin, quem guarda os dados de verdade vai ser a API própria (FastAPI
-- com Supabase). Este banco continua desligado de propósito: é o caminho pronto
-- pra guardar os dados fora do navegador sem esperar a API.
-- =============================================================================

CREATE TABLE IF NOT EXISTS registros (
  colecao    text        NOT NULL,   -- 'pessoas', 'pulseiras', 'dias', 'alertas'
  id         text        NOT NULL,   -- o mesmo id que o app já usa (pessoa-a1b2c3)
  dados      jsonb       NOT NULL,   -- o registro inteiro, do jeito que a tela lê
  criado_em  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (colecao, id)
);

CREATE INDEX IF NOT EXISTS registros_colecao_criado_em
  ON registros (colecao, criado_em DESC);


-- =============================================================================
-- O PRÓXIMO DESENHO, QUANDO VALER IR ALÉM
-- =============================================================================
--
-- Uma tabela com jsonb aguenta o protótipo inteiro. O que ela não dá é o
-- banco conferindo as regras: hoje nada impede um dia registrado apontar pra
-- uma pessoa que não existe.
--
-- Quando fizer sentido trocar, o desenho é este. O REFERENCES não deixa dado
-- órfão existir e o ON DELETE CASCADE apaga o que dependia da pessoa sozinho
-- (hoje isso é código nosso, no store e no banco.ts).
--
-- CREATE TABLE pessoas (
--   id              text PRIMARY KEY,
--   nome            text NOT NULL,
--   quem_acompanha  text NOT NULL DEFAULT '',
--   criado_em       timestamptz NOT NULL DEFAULT now()
-- );
--
-- CREATE TABLE pulseiras (
--   id                     text PRIMARY KEY,
--   codigo                 text NOT NULL UNIQUE,
--   pessoa_id              text NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
--   bateria                integer NOT NULL DEFAULT 100,
--   ultima_sincronizacao   timestamptz
-- );
--
-- CREATE TABLE dias (
--   id         text PRIMARY KEY,
--   pessoa_id  text NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
--   data       date NOT NULL,
--   passos     integer,
--   noite      jsonb,           -- 840 contagens por minuto, das 20h às 10h
--   batimentos jsonb NOT NULL DEFAULT '[]',
--   UNIQUE (pessoa_id, data)
-- );
--
-- CREATE TABLE alertas (
--   id         text PRIMARY KEY,
--   pessoa_id  text NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
--   data       date NOT NULL,
--   metrica    text NOT NULL,   -- 'passos', 'sono', 'batimentos'
--   direcao    text NOT NULL,   -- 'abaixo', 'acima'
--   desvio     integer NOT NULL,
--   texto      text NOT NULL,
--   lido       boolean NOT NULL DEFAULT false,
--   criado_em  timestamptz NOT NULL DEFAULT now()
-- );
