-- =============================================================================
-- A PONTE: O QUE O APP CRIA SOZINHO NO BANCO
-- =============================================================================
--
-- Você NÃO precisa rodar este arquivo. Na primeira vez que o app fala com o
-- banco, ele executa exatamente isto (veja `preparar()` em src/lib/banco.ts).
-- O arquivo existe pra você poder LER o desenho sem caçar dentro do código, e
-- pra rodar na mão se um dia quiser recriar a ponte do zero (SQL Editor do
-- Supabase, cola e executa).
--
-- É uma tabela só, com o registro inteiro em jsonb: o que a rota /api/dados usa
-- hoje para guardar as telas fora do navegador. As tabelas de verdade, com
-- chaves estrangeiras, vínculos e regras, estão em banco/migracoes/. Quando as
-- rotas novas da API entrarem, elas leem de lá e esta ponte sai.
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

-- O Supabase publica toda tabela do schema public numa API automática. A RLS
-- ligada sem nenhuma regra fecha essa porta; o app continua lendo e gravando
-- porque se conecta como dono da tabela.
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
