-- =============================================================================
-- SÓ PARA TESTE: TRÊS PULSEIRAS DE MENTIRA
-- =============================================================================
--
-- As pulseiras de verdade são cadastradas por nós antes da entrega, com o
-- código impresso atrás e o hash do token do firmware. Para testar a tela de
-- ligar a pulseira sem ter o aparelho, rode este arquivo no SQL Editor: ele cria
-- CT-TST1, CT-TST2 e CT-TST3, livres para qualquer conta digitar.
--
-- Os tokens são de mentira e conhecidos de todo mundo (estão aqui). Nunca rode
-- este arquivo no banco de produção de verdade. Rodar de novo não duplica nada.
-- =============================================================================

insert into pulseiras (codigo, token_hash)
values
  ('CT-TST1', encode(sha256('token-de-teste-1'::bytea), 'hex')),
  ('CT-TST2', encode(sha256('token-de-teste-2'::bytea), 'hex')),
  ('CT-TST3', encode(sha256('token-de-teste-3'::bytea), 'hex'))
on conflict (codigo) do nothing;
