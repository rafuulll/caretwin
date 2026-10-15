-- =============================================================================
-- CARETWIN: APAGAR DE VEZ O QUE FOI ENCERRADO HÁ MAIS DE 30 DIAS
-- =============================================================================
--
-- Como rodar: no Supabase, ative antes a extensão pg_cron (Database →
-- Extensions, procure por pg_cron). Depois cole este arquivo no SQL Editor e
-- execute UMA vez, depois da 0003.
--
-- O pg_cron é o agendador do próprio Postgres: a tarefa abaixo roda todo dia
-- às 6h UTC (3h no horário de Brasília) e apaga as pessoas encerradas há mais
-- de 30 dias. O resto vem junto pelas chaves do banco: os dias, os alertas e os
-- vínculos são apagados em cascata, e a pulseira fica livre (pessoa_id vazio).
--
-- Rodar de novo não duplica a tarefa: ela tem nome, e o pg_cron atualiza a que
-- já existe. Para conferir: select * from cron.job;
-- =============================================================================

create extension if not exists pg_cron;

select cron.schedule(
  'caretwin-apagar-encerrados',
  '0 6 * * *',
  $$delete from public.pessoas where encerrado_em < now() - interval '30 days'$$
);
