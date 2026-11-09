# Segurança e privacidade dos dados (cartão 8.3)

Checklist da revisão de 4 de novembro de 2026. O objetivo do cartão: dado de saúde fica só com quem tem vínculo aprovado com a pessoa, e não aparece em log nem em resposta de erro.

Situação: **Ok** quer dizer conferido e testado; **Risco aceito** quer dizer conhecido, explicado e deixado para depois.

## Quem vê o quê

| Item | Situação | Onde está | Como foi conferido |
| --- | --- | --- | --- |
| Trocar o id na URL não mostra dado de outra família | Ok | `src/lib/familia.ts` (`exigirMembro`), `src/lib/historico.ts` (`enxerga`) | 3 contas de fora (outra família, sem família e com pedido pendente) chamaram as 12 rotas de pessoa, dias, alertas, membros, pedidos, aprovar, remover, sair, encerrar, recuperar e marcar alerta com os ids da família A: as 36 chamadas devolveram 404, sem nenhum nome ou número no corpo |
| Pessoa sem vínculo devolve 404, nunca 403 | Ok | mesmas funções | No mesmo teste; id que não é uuid e uuid inexistente também dão 404 |
| Pedido pendente não vê nada antes de aprovado | Ok | `exigirMembro` exige `aprovado` | A conta com pedido pendente recebeu 404 em todas as rotas |
| Sem login, nenhuma rota de dados responde | Ok | `src/lib/rota-v1.ts` (`quemChama`) | /me, /pessoas e /dias sem cookie: 401 |
| O banco não abre pela API pública do Supabase | Ok | `banco/migracoes/0001` e `0006`: RLS ligado nas 7 tabelas, sem nenhuma policy | Conferir em produção com a consulta abaixo |
| Token da pulseira guardado só como hash | Ok | `src/lib/dispositivo.ts` (`hashDoToken`) | Token errado ou ausente: 401 |
| Limite de códigos errados ao ligar pulseira | Ok | cartão 5.10 | Testado no cartão 5.10 |

## Logs e respostas de erro

| Item | Situação | Onde está | Como foi conferido |
| --- | --- | --- | --- |
| Log de erro sem dado de saúde | Ok (corrigido agora) | `src/lib/registro.ts`, usado em `rota-v1.ts`, `dispositivo.ts` e `api/v1/me` | Antes, `console.error(falha)` imprimia o campo `detail` do Postgres, que numa regra violada traz a linha inteira (um teste real mostrou os 70000 passos no log). Agora o log leva só o tipo, o código, a tabela e o nome da regra. `npm test` confere isso |
| Erro 500 com frase curta, sem detalhe interno | Ok | `src/lib/rota-v1.ts` (`responder`) | Revisão do código |
| Logs da Vercel só com caminho e status | Ok | padrão da Vercel | O caminho tem o id da pessoa (um uuid), mas nenhum nome, passo ou noite |

## Sessão e navegador

| Item | Situação | Onde está | Como foi conferido |
| --- | --- | --- | --- |
| Sessão vence em 30 dias também no servidor | Ok (corrigido agora) | `src/lib/sessao-servidor.ts` (`sessaoNoPrazo`) | Antes, só o navegador apagava o cookie; um cookie copiado valia para sempre. Testado: entrada de hoje e de 29 dias atrás passam, de 31 dias, do futuro ou sem data dão 401. `npm test` confere isso |
| Cookie assinado, `httpOnly`, `secure` e `sameSite=lax` | Ok | `opcoesDoCookie` | Assinatura alterada dá 401 |
| Respostas da API não ficam em cache | Ok (corrigido agora) | `next.config.ts` (`Cache-Control: private, no-store` em `/api`) | Conferido em /me e nas rotas da pulseira |
| Cabeçalhos contra iframe, sniffing e https | Ok | `next.config.ts` (cartão 5.11) | Conferidos em produção no cartão 5.11 |
| Cadastro público fechado durante o protótipo | Ok | Supabase, cartão 5.11 | Reabrir com segurança é o cartão 5.12 |

## Riscos aceitos

| Risco | Por que fica | Quando resolver |
| --- | --- | --- |
| A conexão com o banco usa `sslmode=require`, que criptografa mas não confere o certificado do Supabase | Conferir o certificado (`verify-full`) falha com a cadeia própria do Supabase; precisaria guardar o certificado deles no projeto | Antes de ter usuários de verdade |
| O limite de tentativas de login do Supabase conta por servidor, não por pessoa | Todas as chamadas saem dos servidores da Vercel | Se o cadastro abrir para muita gente (cartão 5.12) |
| Bloquear uma conta no Supabase não derruba quem já entrou | A sessão é o cookie do app, que vale até 30 dias | Para derrubar todo mundo na hora, trocar o `AUTH_SECRET` na Vercel |
| O navegador guarda qual pessoa está selecionada no seletor | É só o id, sem dado de saúde | Limpo ao sair a partir do cartão 7.7 |

## Consulta para conferir o RLS em produção

Só leitura. No SQL Editor do Supabase:

```sql
select c.relname as tabela, c.relrowsecurity as rls_ligado,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;
```

O esperado são 7 linhas (alertas, dias, pessoas, pulseiras, tentativas_de_codigo, usuarios e vinculos), todas com `rls_ligado = true` e `policies = 0`.

## Como repetir os testes

- `npm test` em `apps/web`: log sem dado e validade da sessão (Node 22.18 ou mais novo).
- O teste das 36 chamadas de outra família usa duas famílias de mentira num banco local; o passo a passo está no PR do cartão 8.3.

## Revisão

- [ ] Revisado por Fabrício, em ____/____/2026
