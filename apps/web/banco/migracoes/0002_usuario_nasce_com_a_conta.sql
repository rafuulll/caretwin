-- =============================================================================
-- CARETWIN: A LINHA EM "usuarios" NASCE JUNTO COM A CONTA
-- =============================================================================
--
-- Como rodar: no SQL Editor do Supabase, cole o arquivo inteiro e execute UMA
-- vez, depois da 0001.
--
-- Quem cria a conta é o Supabase Auth (auth.users). A tabela usuarios guarda o
-- que é nosso sobre a pessoa, e precisa de uma linha para cada conta. Se o app
-- criasse essa linha depois do login, uma falha no meio deixaria conta sem
-- usuário. O gatilho faz as duas coisas na mesma transação: ou nascem juntas,
-- ou nenhuma nasce.
--
-- O nome vem do campo "nome" que a tela de cadastro manda junto com a conta.
-- Sem ele, fica a parte do e-mail antes do @, que a pessoa troca depois.
-- =============================================================================


-- security definer: quem dispara é o serviço do Auth, que não tem permissão
-- para gravar em public.usuarios. A função roda como dona da tabela.
-- search_path vazio: todo nome vai escrito com o schema, para ninguém conseguir
-- trocar uma tabela por outra de mesmo nome num schema diferente.
create function public.criar_usuario_da_conta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, nome)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- A função só existe para o gatilho. Ninguém de fora chama ela direto.
revoke execute on function public.criar_usuario_da_conta() from public, anon, authenticated;

create trigger usuario_nasce_com_a_conta
  after insert on auth.users
  for each row execute function public.criar_usuario_da_conta();

-- Contas criadas antes desta migração (pelo painel, por exemplo) ganham a
-- linha agora. Rodar de novo não duplica nada.
insert into public.usuarios (id, nome)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'nome'), ''), split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;
