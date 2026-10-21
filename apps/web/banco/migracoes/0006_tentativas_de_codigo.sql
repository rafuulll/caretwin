-- =============================================================================
-- CARETWIN: LIMITE DE CÓDIGOS ERRADOS AO LIGAR A PULSEIRA (CARTÃO 5.10)
-- =============================================================================
--
-- Como rodar: no SQL Editor do Supabase, cole o arquivo inteiro e execute UMA
-- vez, depois da 0005. Precisa do pg_cron ligado (o mesmo da 0004).
--
-- O código da pulseira tem só 4 caracteres. Sem limite, uma conta poderia
-- testar códigos até achar uma pulseira livre e virar dona dela. Cada código
-- que não existe vira uma linha aqui; com 10 linhas nos últimos 15 minutos, a
-- conta espera antes de tentar de novo (src/lib/familia.ts, digitarCodigo).
--
-- O contador mora no banco porque, na Vercel, cada chamada pode cair num
-- servidor diferente: um contador em memória zeraria a cada servidor novo.
--
-- Guarda só quem tentou e quando. O código digitado não é gravado: ele não
-- serve para nada depois e seria dado a mais.
--
-- Rodar de novo não duplica nada: a tabela e o índice só nascem se faltarem, e
-- a tarefa do pg_cron tem nome (o pg_cron atualiza a que já existe).
-- =============================================================================

create table if not exists tentativas_de_codigo (
  id         bigint generated always as identity primary key,
  usuario_id uuid not null references usuarios (id) on delete cascade,
  criado_em  timestamptz not null default now()
);

-- A conta do limite sempre filtra por conta e por horário.
create index if not exists tentativas_de_codigo_usuario_criado_em
  on tentativas_de_codigo (usuario_id, criado_em);

-- Igual às outras tabelas: RLS ligada e nenhuma regra fecha a API automática
-- do Supabase. Só o servidor do site, pela DATABASE_URL, lê e grava aqui.
alter table tentativas_de_codigo enable row level security;

-- A janela é de 15 minutos; o que passou de um dia não serve para mais nada.
-- Roda todo dia às 6h05 UTC, logo depois da limpeza da 0004.
create extension if not exists pg_cron;

select cron.schedule(
  'caretwin-apagar-tentativas-antigas',
  '5 6 * * *',
  $$delete from public.tentativas_de_codigo where criado_em < now() - interval '1 day'$$
);
