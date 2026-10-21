# CareTwin: site, app e API

O CareTwin acompanha o dia a dia de uma pessoa por uma pulseira discreta, aprende o que é normal para ela e explica, em palavras simples, quando algo muda. É um acompanhamento gentil, sem diagnóstico e sem susto, para quem usa a pulseira e para o familiar ou cuidador que acompanha à distância.

Esta pasta tem as três coisas que rodam na web: o site de apresentação, o app e a API (o backend). É um projeto Next.js publicado na Vercel. Projeto acadêmico da disciplina UPX (Engenharia da Computação, UniFacens).

## Como rodar

### Só o app, com dados de exemplo

Com Node.js 20.9 ou mais novo (recomendado 22):

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. Sem nenhuma variável de ambiente, o app roda no **modo protótipo**: para entrar, qualquer nome e senha servem, e as telas mostram pessoas e dias inventados, guardados no seu navegador. Nenhum dado sai do computador.

### Com contas e banco de verdade

1. Crie um projeto de teste no [Supabase](https://supabase.com) (o plano gratuito basta).
2. Em Database, Extensions, ligue a extensão `pg_cron`.
3. No SQL Editor, rode em ordem os arquivos de `banco/migracoes/` (0001 a 0006), cada um uma vez.
4. Rode `banco/dev/pulseiras-de-teste.sql`, que cria as pulseiras `CT-TST1`, `CT-TST2` e `CT-TST3`. **Só em banco de teste.**
5. Copie o `.env.example` para `.env.local` e preencha:
   - `DATABASE_URL`: em Connect, Transaction pooler (porta 6543), com `?sslmode=require` no final.
   - `AUTH_SECRET`: 32 caracteres ou mais (`openssl rand -base64 32`).
   - `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`: em Project Settings, API Keys.
6. Em Authentication, URL Configuration, coloque `http://localhost:3000` em Site URL e `http://localhost:3000/**` em Redirect URLs.
7. Crie contas em Authentication, Users, "Add user", marcando a confirmação automática do e-mail (o plano gratuito manda poucos e-mails por hora).
8. Reinicie o `npm run dev`.

Para testar uma família com várias contas, use um navegador diferente para cada conta: o login fica num cookie, e o cookie é de cada navegador.

### Com Docker

Com o Docker Desktop aberto, nesta pasta:

```bash
docker compose up --build
```

Abra <http://localhost:3000>. Para parar, `Ctrl+C` e depois `docker compose down`. Depois de mudar o código, rode de novo o `up --build`. A porta fica presa a este computador. Para ligar o banco no container, descomente a linha `env_file` do `docker-compose.yml`.

### Comandos

```bash
npm run dev            # servidor de desenvolvimento em http://localhost:3000
npx tsc --noEmit -p .  # confere os tipos
npm run lint           # confere o padrão do código
npm run build          # compila como a Vercel compila
npm run storybook      # catálogo de componentes em http://localhost:6006
```

Para o Next.js não enviar dados de uso, rode uma vez `npx next telemetry disable`.

## As telas

| Endereço | Tela |
| --- | --- |
| `/` | Site: o que o CareTwin resolve, com um normal de exemplo desenhado com os dados do app |
| `/entrar` | Entrar, criar conta e esqueci a senha |
| `/como-usar` | O que já funciona e o que ainda falta ligar |
| `/app/painel` | Os passos de hoje contra o normal até este horário, a bateria e a última sincronização da pulseira |
| `/app/sono` | Quanto a pessoa dormiu e quantas vezes acordou. Sempre uma estimativa |
| `/app/batimentos` | Medição guiada de 12 segundos e o histórico |
| `/app/alertas` | O resumo escrito do dia e os alertas de mudança, com marcar como lido |
| `/app/primeiro-uso` | Ligar uma pulseira: código, de quem é e, se for nova, o nome |
| `/app/familia` | Membros, pedidos, sair, encerrar e recuperar. Só aparece para quem entrou com conta |
| `/app/configuracoes` | Perfil e, no modo protótipo, os dados de exemplo |

## Como funciona por dentro

Um clique percorre sempre o mesmo caminho:

```
tela (src/components)  ->  src/lib/store.ts  ->  src/lib/cliente-v1.ts  ->  rota (src/app/api/v1)
      ->  src/lib/rota-v1.ts (quem chama?)  ->  src/lib/familia.ts (regras + SQL)  ->  PostgreSQL
```

- **`store.ts`** é a única porta de dados das telas. Ele escolhe sozinho entre o modo protótipo (dados no navegador) e o modo conta (dados da API), perguntando `GET /api/v1/me`.
- **Rotas** (`src/app/api/v1/**/route.ts`) são finas: conferem a sessão, validam o corpo com zod e chamam a regra.
- **`familia.ts`** tem todas as regras da família. Toda mudança roda numa transação que trava a linha da pessoa (`for update`).
- **Sessão**: o login confere a senha no Supabase Auth (`src/lib/conta.ts`) e grava um cookie `httpOnly` assinado com HMAC (`src/lib/sessao-servidor.ts`). As rotas tiram o id da conta desse cookie, nunca do navegador.
- **Sem vínculo aprovado, a pessoa não existe**: as rotas respondem 404, para não revelar ids.
- **Erros** sempre como `{ erro, codigo, quando }`. A tela escolhe a frase pelo `codigo`, em `src/content/site.ts`.

### A API

O contrato completo está em [`../../docs/openapi.yaml`](../../docs/openapi.yaml).

| Rota | Para quê |
| --- | --- |
| `POST /api/auth/conta/criar`, `/entrar`, `/recuperar`, `/nova-senha` | Contas com e-mail e senha |
| `GET` e `DELETE /api/auth/sessao` | Quem está logado e sair |
| `GET /api/health` | Se o servidor está de pé e se a `DATABASE_URL` chegou. Não pede login |
| `GET /api/v1/me` | A conta, os pedidos esperando e o que dá para recuperar |
| `GET /api/v1/pessoas` e `/pessoas/{id}` | As pessoas que a conta acompanha |
| `POST /api/v1/vinculos` | Digitar o código da pulseira: livre cria a pessoa (201), com família vira pedido (202) |
| `GET /api/v1/pessoas/{id}/membros` e `DELETE .../membros/{usuarioId}` | Ver a família e remover alguém |
| `GET /api/v1/pessoas/{id}/pedidos`, `POST .../pedidos/{usuarioId}/aprovar`, `DELETE .../pedidos/{usuarioId}` | Pedidos para entrar |
| `DELETE /api/v1/pessoas/{id}/vinculo` | Sair da família, ou desistir do pedido |
| `POST /api/v1/pessoas/{id}/encerrar` | O último membro encerra, com a frase de confirmação |
| `POST /api/v1/pessoas/{id}/recuperar` | Desfazer o encerramento em até 30 dias |
| `GET /api/v1/pessoas/{id}/dias?de=&ate=` | Os dias que a pulseira mandou, do mais antigo para o mais novo. Sem filtros, os últimos 30 dias até hoje (horário de Brasília) |
| `GET /api/v1/pessoas/{id}/alertas?lido=` | Os alertas, do mais recente para o mais antigo; `lido=false` só os novos |
| `PATCH /api/v1/alertas/{id}` | Marcar um alerta como lido (ou voltar para novo), para a família toda |

As rotas da pulseira não usam a sessão do site: a pulseira manda `Authorization: Device <token>`, e o banco guarda só o sha256 do token (`pulseiras.token_hash`). A regra comum está em `src/lib/dispositivo.ts` e o formato em `src/app/api/v1/device/esquemas.ts`.

| Rota da pulseira | Para quê |
| --- | --- |
| `POST /api/v1/device/daily` | Passos e minutos ativos dos dias na fila. Cada dia certo vai para `accepted`; dia com mais de 60000 passos, negativo ou com data impossível vai para `rejected` e não é gravado |
| `POST /api/v1/device/nights` | Uma noite (840 minutos a partir das 20h). Grava no dia em que a noite termina: `night_date` 2026-10-20 aparece no dia 21 |
| `POST /api/v1/device/live` | Modo ao vivo. Não cria dia; só marca a hora em que a pulseira deu sinal |

Os resumos e as noites do mesmo dia se completam sem apagar um ao outro. Pulseira ainda sem pessoa grava os dias sem dona, e eles passam para a pessoa quando a família digita o código. Pessoa encerrada: tudo volta em `rejected` e nada é gravado. Para testar sem a pulseira, use o simulador (`python simulador/simulador.py --url http://localhost:3000/api --token token-de-teste-1`, com as pulseiras de `banco/dev/pulseiras-de-teste.sql`).

As leituras de dias e alertas ficam em `src/lib/historico.ts`, com a mesma regra de acesso da família: sem vínculo aprovado, 404.

Com conta, o `store.ts` lê os dias e os alertas de cada pessoa por estas rotas (cartão 7.3), junto com as pessoas, e publica tudo de uma vez. Ele relê sozinho quando a aba volta a aparecer e de 5 em 5 minutos com a aba à vista, para o dia novo da pulseira aparecer sem recarregar. Marcar um alerta como lido muda a tela na hora e grava pelo `PATCH`; se o servidor recusar, a tela volta ao que o banco diz.

Os alertas nascem no servidor (`src/lib/alertas.ts`, cartões 6.1 e 5.5): quando a pulseira entrega dias ou uma noite, a mesma regra do normal das telas (`procurarMudancas` em `src/lib/normal.ts`) roda sobre os últimos 40 dias da pessoa, na mesma transação, e grava os alertas novos. A regra única do banco (pessoa, dia e métrica) faz o recálculo nunca duplicar nem desfazer o lido. Ligar a pulseira pelo código também cria os alertas dos dias que já tinham chegado.

O código da pulseira tem só 4 caracteres, então digitar códigos tem limite (cartão 5.10): cada código que não existe vira uma linha em `tentativas_de_codigo`, e com 10 nos últimos 15 minutos a conta recebe 429 com a hora em que pode tentar de novo (`quando` e o cabeçalho `Retry-After`). Enquanto espera, nem o código certo é consultado. Códigos que existem não contam, e o limite é por conta. Os números estão em `LIMITE_DE_CODIGOS_ERRADOS` (`src/lib/modelo.ts`) e a regra em `digitarCodigo` (`src/lib/familia.ts`). O texto vem dos modelos de `src/lib/respostas-ia.ts`, que ficam como reserva quando a IA local escrever (cartões 6.2 e 6.3).

### O banco

| Migração | O que faz |
| --- | --- |
| `0001_tabelas.sql` | As seis tabelas (usuarios, pessoas, pulseiras, vinculos, dias, alertas) e a RLS ligada sem regras |
| `0002_usuario_nasce_com_a_conta.sql` | Gatilho que cria a linha em `usuarios` junto com a conta do Supabase Auth |
| `0003_encerramento.sql` | Data e autor do encerramento em `pessoas` |
| `0004_apagar_encerrados.sql` | Tarefa diária do pg_cron que apaga o que foi encerrado há mais de 30 dias |
| `0005_tirar_a_ponte.sql` | Apaga a tabela `registros` do protótipo |
| `0006_tentativas_de_codigo.sql` | Tabela `tentativas_de_codigo` do limite de códigos errados (cartão 5.10) e a limpeza diária dela no pg_cron |

Cada arquivo roda uma vez, em ordem, e nunca é editado depois: mudança nova vira o próximo número.

### A regra do normal

A do cartão 2.3. Os números estão em `src/lib/modelo.ts` e a conta em `src/lib/normal.ts`.

1. O normal é a média dos 7 dias que vêm antes dos 3 dias mais recentes.
2. A faixa do normal vai 20% para baixo e 20% para cima dessa média, e nunca fica mais estreita que 1.000 passos para cada lado (para quem anda pouco, 20% é pouco).
3. Um alerta nasce quando 2 dos 3 dias recentes fogem da faixa para o mesmo lado.
4. Com menos de 5 dias válidos, o app diz que ainda está aprendendo e não compara.

Os passos de hoje são comparados com o normal até este horário, e não com o dia inteiro. Passos acima do normal são boa notícia: o alerta sai com o título "Mais ativo que o normal", selo verde e frase positiva (`ehBoaNoticia` em `modelo.ts`). As decisões e os motivos estão no `DECISOES.md`.

## Publicar na Vercel

O projeto já está publicado em <https://caretwin-omega.vercel.app>, a partir da branch `main`, com Root Directory `apps/web`. Cada pull request ganha um link de preview.

Para o site publicado usar o banco:

1. Em Settings, Environment Variables, ambiente Production, coloque `AUTH_SECRET` (um valor novo, diferente do local), `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e, por último, `DATABASE_URL`, todos do projeto de produção do Supabase. Não use `EMAILS_PERMITIDOS`: essa variável não existe mais.
2. Em Deployments, abra o último deploy e use Redeploy. Variável nova só vale para deploy novo.
3. No Supabase de produção, em Authentication, URL Configuration: Site URL `https://caretwin-omega.vercel.app` e Redirect URLs `https://caretwin-omega.vercel.app/**`.
4. Confira em `/api/health`: a resposta deve dizer `"banco": "configurado"`.

Sem essas variáveis, o site publicado roda no modo protótipo, em que qualquer e-mail e senha entram.

A Deployment Protection está ligada: o site só abre para quem entra com a conta da Vercel do projeto. Para mostrar a alguém de fora, gere um link no botão Share do deploy ou desligue a proteção em Settings, Deployment Protection.

## Pastas

```
src/app/            as rotas: site, entrar, como-usar, o app (app/) e a API (api/)
src/components/     ui (peças com Storybook), app (telas de dentro), marketing (o site), auth, onboarding, cena
src/content/        todo texto que aparece na tela (site.ts e tour.ts)
src/lib/            store (a porta de dados), familia (regras), rota-v1, conta, sessao-servidor, banco, modelo, normal, seed
banco/migracoes/    as migrações do banco, em ordem
banco/dev/          pulseiras de teste (nunca em produção)
design-system.json  cores, fonte e cantos do app inteiro
n8n/                automações para quando o n8n for ligado
.storybook/         catálogo de componentes
```

## Regras da casa

- Nenhum texto visível dentro de componente: tudo sai de `src/content`.
- Nenhuma cor escrita na mão: tudo sai do `design-system.json`.
- Nenhuma tela lê ou grava dado por fora de `src/lib/store.ts`.
- O navegador nunca fala com o banco: tudo passa pelas rotas de `src/app/api`.

As regras completas estão em `AGENTS.md`, as decisões de produto e de design em `DECISOES.md`, e o que falta em `PROXIMOS-PASSOS.md`. O jeito de trabalhar do grupo (branches, commits, pull requests) está no `CONTRIBUTING.md` da raiz do repositório.
