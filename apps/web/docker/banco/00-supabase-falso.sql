-- =============================================================================
-- SÓ PARA O DOCKER: O PEDAÇO DO SUPABASE QUE AS MIGRAÇÕES PRECISAM
-- =============================================================================
--
-- As migrações de banco/migracoes/ foram escritas para o Supabase. Elas usam
-- três coisas que só existem lá: o esquema `auth` (onde moram as contas), os
-- papéis `anon` e `authenticated`, e a extensão pg_cron (o agendador). Num
-- Postgres comum do Docker nada disso existe, então este arquivo cria o mínimo
-- para as migrações rodarem sem mudar uma linha.
--
-- O que NÃO vem junto: o login com e-mail e senha (quem faz é o Supabase Auth,
-- um serviço à parte) e o agendador. Por isso, no Docker, as tarefas do
-- pg_cron (apagar contas encerradas, limpar tentativas) só aparecem na lista e
-- não rodam. As páginas /demo e /ao-vivo e a API da pulseira funcionam
-- inteiras. Nunca use este arquivo no banco de produção.
-- =============================================================================

create schema if not exists auth;
create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;

-- O pg_cron de mentira: aceita o agendamento e não agenda nada.
create schema if not exists cron;
create table if not exists cron.job (jobid bigserial primary key, jobname text, schedule text, command text);
create or replace function cron.schedule(job_name text, schedule text, command text)
returns bigint language sql as $$
  insert into cron.job (jobname, schedule, command) values (job_name, schedule, command) returning jobid
$$;
