-- =============================================================================
-- CARETWIN: TIRAR A TABELA-PONTE DO PROTÓTIPO
-- =============================================================================
--
-- Como rodar: no SQL Editor do Supabase, cole o arquivo inteiro e execute UMA
-- vez, depois da 0004. Pode rodar mesmo que a tabela nunca tenha existido.
--
-- A tabela registros era a ponte do protótipo: guardava as telas inteiras em
-- jsonb, numa tabela só e sem dono, protegida pela lista EMAILS_PERMITIDOS.
-- O site agora lê as tabelas de verdade pelas rotas /api/v1, com a regra de
-- vínculo de cada conta, e a lista saiu. Nada mais lê nem grava aqui, e o que
-- sobrou dentro são dados de exemplo.
-- =============================================================================

drop table if exists registros;
