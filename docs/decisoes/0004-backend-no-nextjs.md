# 0004 Backend dentro do Next.js, com Supabase

Data: 15/10/2026. Cartoes 2.4, 5.3, 5.9, 7.2 e 7.10.

Decisao: a API fica dentro do proprio Next.js (`apps/web`, rotas em `src/app/api`). A API em Python (FastAPI na Railway) prevista na decisao 0001 nao sera construida; `apps/api` fica sem codigo.
Motivo: prazo curto e time pequeno. Uma linguagem, um deploy (a Vercel que ja existia), sem CORS nem autenticacao entre dois servicos, e uma copia so da regra do normal (`apps/web/src/lib/normal.ts`), sem risco de a conta em TypeScript e a conta em Python darem resultados diferentes.

Decisao: o banco e o Supabase (PostgreSQL), acessado pelo driver `postgres` pelo Transaction pooler (porta 6543). As tabelas nascem das migracoes em `apps/web/banco/migracoes`, rodadas em ordem no SQL Editor. A RLS fica ligada em todas as tabelas sem nenhuma regra, o que fecha a API automatica do Supabase; so o servidor do Next.js acessa os dados.
Motivo: Postgres gerenciado com plano gratuito, contas no mesmo projeto e agendador (pg_cron) incluso.

Decisao: as contas usam o Supabase Auth (e-mail e senha). O servidor confere a senha no Supabase e cria a propria sessao: um cookie `httpOnly` assinado com HMAC (`AUTH_SECRET`). Um gatilho no banco cria a linha em `usuarios` junto com a conta.
Motivo: o Supabase cuida de senha, confirmacao de e-mail e nova senha; o cookie assinado funciona em qualquer copia do servidor na Vercel, sem guardar sessao em memoria.

Decisao: quem ve qual pessoa e decidido pela tabela `vinculos`. Digitar o codigo de uma pulseira livre cria a pessoa; digitar o de uma pulseira com familia vira pedido. Sem vinculo aprovado, a pessoa responde 404. O ultimo membro nao sai, encerra; encerrar marca a data, e a tarefa diaria do pg_cron apaga de vez depois de 30 dias.
Motivo: uma pessoa pode ter varios cuidadores, e a propria pessoa tambem pode ter conta.

Decisao: o contrato da pulseira nao muda. Os caminhos `/v1/device/*` continuam iguais e o firmware so troca a URL base. O contrato passa a ser escrito a mao em `docs/openapi.yaml` (v0.2).

Decisao: quem calcula o alerta e o backend, ao receber dias novos. O site so mostra.
Motivo: o alerta precisa existir mesmo com o site fechado.

Limites: funcoes da Vercel tem tempo maximo e nao guardam estado em memoria. Por isso o limite de tentativas de codigo errado (cartao 5.10) vai precisar de uma tabela. Processamento pesado, se um dia existir, sai para um servico a parte sem mudar o contrato.
