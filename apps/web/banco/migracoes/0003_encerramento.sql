-- =============================================================================
-- CARETWIN: ENCERRAR O ACOMPANHAMENTO, COM 30 DIAS PARA VOLTAR ATRÁS
-- =============================================================================
--
-- Como rodar: no SQL Editor do Supabase, cole o arquivo inteiro e execute UMA
-- vez, depois da 0002.
--
-- Encerrar não apaga nada na hora. A pessoa ganha a data de encerramento e,
-- a partir dela, some de todas as telas, a pulseira fica travada e quem
-- encerrou tem 30 dias para recuperar. Quem apaga de vez, passado o prazo, é a
-- tarefa agendada da 0004.
-- =============================================================================

alter table pessoas
  add column encerrado_em  timestamptz,
  add column encerrado_por uuid references usuarios (id) on delete set null;

-- Os dois andam juntos: ou a pessoa está encerrada (com data e autor), ou não.
-- O autor pode sumir depois (conta apagada), por isso só a data é obrigatória.
alter table pessoas
  add constraint encerramento_com_data
  check (encerrado_por is null or encerrado_em is not null);

-- A tarefa diária procura só os encerrados, que são poucos.
create index pessoas_encerradas on pessoas (encerrado_em) where encerrado_em is not null;
