-- =============================================================================
-- CARETWIN: EXCLUIR A CONTA, COM 30 DIAS PARA RECUPERAR
-- =============================================================================
--
-- Como rodar: no SQL Editor do Supabase, cole o arquivo inteiro e execute UMA
-- vez, depois da 0006. Precisa do pg_cron ligado (o mesmo da 0004).
--
-- Excluir a conta não apaga nada na hora, do mesmo jeito que encerrar uma
-- pessoa (0003 e 0004). A conta ganha a data de exclusão e, a partir dela:
--   - para de funcionar: o servidor recusa a sessão de quem tem essa data
--     (src/lib/rota-v1.ts, quemChama);
--   - quem entra com o e-mail e a senha vê "Recuperar minha conta" e tem
--     30 dias para voltar atrás (src/app/api/auth/conta/entrar);
--   - passados os 30 dias, a tarefa abaixo apaga o login no Supabase Auth.
--
-- O resto vem junto pelas chaves do banco: apagar a linha de auth.users apaga
-- a de usuarios (on delete cascade), que apaga os vínculos e as tentativas de
-- código. Quem a conta cadastrou ou encerrou fica sem autor (on delete set
-- null). As pessoas que ela encerrou ao sair seguem o prazo da 0004.
--
-- Rodar de novo não duplica nada: a coluna e o índice só nascem se faltarem, e
-- a tarefa do pg_cron tem nome (o pg_cron atualiza a que já existe).
-- =============================================================================

alter table usuarios add column if not exists excluida_em timestamptz;

-- A tarefa diária procura só as contas excluídas, que são poucas.
create index if not exists usuarios_excluidos on usuarios (excluida_em) where excluida_em is not null;

-- security definer: a função roda como dona do banco (postgres), que pode
-- apagar em auth.users. search_path vazio, como na 0002: todo nome vai com o
-- schema escrito, para ninguém trocar uma tabela por outra de mesmo nome.
create or replace function public.apagar_contas_excluidas()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  apagadas integer;
begin
  delete from auth.users
  where id in (
    select id from public.usuarios
    where excluida_em < now() - interval '30 days'
  );
  get diagnostics apagadas = row_count;
  return apagadas;
end;
$$;

-- Só a tarefa agendada chama. Ninguém de fora, nem pela API do Supabase.
revoke execute on function public.apagar_contas_excluidas() from public, anon, authenticated;

-- Roda todo dia às 6h10 UTC (3h10 em Brasília), depois da limpeza da 0004 e da 0006.
create extension if not exists pg_cron;

select cron.schedule(
  'caretwin-apagar-contas-excluidas',
  '10 6 * * *',
  $$select public.apagar_contas_excluidas()$$
);
