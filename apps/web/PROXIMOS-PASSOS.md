# Próximos passos do CareTwin

O protótipo funciona sozinho: sem servidor, sem banco e sem chave de API. É isso que faz ele rodar com `npm install` e `npm run dev`.

Este arquivo é o mapa do que vem depois. A página Como usar (`/como-usar`) é a versão dele dentro do app, navegável.

Já estão construídos e testados (outubro de 2026): o login com e-mail e senha pelo Supabase Auth, o banco no Supabase e a família (ligar a pulseira pelo código, pedidos, aprovar, sair, encerrar e recuperar). O banco de produção está montado, com as migrações 0001 a 0005, e o site publicado já usa ele (variáveis na Vercel desde 20/10/2026). O login com Google também está escrito, esperando as chaves. O resto é mapa: o que é, por que vale para o CareTwin e onde encaixa.

## A ordem

- [ ] 1. **API do CareTwin**: trocar os dados de exemplo pelos dados reais da pulseira · *contas, família e as rotas da pulseira (`/v1/device`) prontas; as rotas de leitura (5.6), as telas com os dias reais (7.3) e os alertas criados no servidor (6.1) prontos; falta o firmware apontar para a API (4.8)*
- [ ] 2. **Login**: saber quem está usando · *e-mail e senha pronto e testado, falta ligar em produção; Google escrito, falta a chave*
- [ ] 3. **A IA que escreve os textos**: o resumo do dia e os alertas escritos de verdade
- [ ] 4. **Envio de e-mail**: mandar o resumo do dia para quem acompanha
- [ ] 5. **WhatsApp**: avisar quem acompanha onde a família realmente lê
- [ ] 6. **n8n**: fazer o e-mail e o WhatsApp acontecerem sozinhos
- [ ] 7. **Banco no Supabase**: guardar fora do navegador sem esperar a API · *montado em produção (0001 a 0005), falta a `DATABASE_URL` na Vercel*
- [ ] 8. **Antes de publicar**: rota protegida · *Deployment Protection ligada e variáveis na Vercel feitas; falta o limite de tentativas (cartão 5.10)*

---

## 1. API do CareTwin

**O que é.** A pulseira manda o resumo do dia e o registro da noite para a API do projeto, que mora neste mesmo Next.js, nas rotas de `src/app/api/v1` (decisão do cartão 2.4), com o Postgres do Supabase. As rotas que recebem os dados da pulseira já existem (`src/app/api/v1/device`, cartões 5.3, 5.4 e 5.5). O contrato está em `docs/openapi.yaml`. O app passa a ler de lá.

**Por que vem primeiro.** É o que transforma o protótipo no CareTwin de verdade: o normal deixa de ser calculado sobre pessoas inventadas e passa a ser o da pessoa que usa a pulseira.

**Onde encaixa.** `src/lib/store.ts`. As telas só chamam `useDados()` e `usePessoaNaTela()`, então trocar o miolo dessas funções por chamadas à API não muda tela nenhuma. A regra do normal da API e a de `src/lib/normal.ts` são a mesma (cartão 2.3), e dá pra comparar as duas lado a lado com os mesmos dados.

## 2. Login

São dois caminhos, e os dois gravam a mesma sessão assinada (`src/lib/sessao-servidor.ts`).

**E-mail e senha (Supabase Auth).** Criar conta, entrar e "esqueci minha senha", com a senha guardada pelo Supabase. Para ligar: rode `banco/migracoes/0002_usuario_nasce_com_a_conta.sql` no SQL Editor, preencha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` no `.env.local` (junto com o `AUTH_SECRET`) e libere `http://localhost:3000/**` em Authentication → URL Configuration → Redirect URLs. O código está em `src/lib/conta.ts`, nas rotas de `src/app/api/auth/conta` e na página `/entrar/nova-senha`. O plano gratuito do Supabase manda poucos e-mails por hora; para testar com muita conta, desligue a confirmação de e-mail em Authentication → Sign In / Providers → Email, ou configure um SMTP próprio.

### Google

> **Já está construído.** Falta só a chave. Vai migrar para o Google do próprio Supabase num passo seguinte, para cair na mesma tabela `usuarios`.

**O que fazer.** Abra `/entrar` e clique em "Continuar com Google". O modal é o passo a passo completo no Google Cloud Console (<https://console.cloud.google.com/apis/credentials>), com cada valor pronto para copiar. No fim ele dá três linhas para colar no `.env.local`. Reinicie o servidor e o mesmo botão passa a fazer login de verdade.

**Por que vale.** Sem saber quem entrou, não existe "as pessoas que *eu* acompanho". Com login, cada cuidador vê só as pessoas dele.

**Onde o código está.** `src/lib/google.ts` (a ida e a volta do OAuth, sem biblioteca), `src/lib/sessao-servidor.ts` (o cookie assinado) e as três rotas de `src/app/api/auth`.

## 3. A IA que escreve os textos

**O que é.** Hoje o resumo do dia e o texto de cada alerta são escritos a partir de modelos de texto com os números reais (`src/lib/respostas-ia.ts`). Ligar a IA é pedir esses textos a um modelo.

**O plano do CareTwin.** Uma IA local (Ollama) rodando no computador da API, chamada pela API do CareTwin: sem chave e sem dado de saúde saindo do computador. Os textos de exemplo continuam como reserva quando o modelo não responder.

**Com chave, se preferir.** A chave da OpenAI (<https://platform.openai.com>) tem grupo próprio no `.env.example` (`OPENAI_API_KEY`). A Anthropic (<https://console.anthropic.com>) funciona do mesmo jeito. A chamada sai sempre de uma rota em `src/app/api`, nunca do navegador.

**A regra que não muda.** A estatística decide o que mudou; a IA só escreve a frase. Nenhum texto pode soar como diagnóstico ou alarme.

## 4. Envio de e-mail

**Por que vale.** Quem acompanha recebe o resumo do dia no fim da tarde sem precisar abrir o app.

**Onde encaixa.** O grupo de envio de e-mail do `.env.example`, e uma rota em `src/app/api` chamada pela API quando o dia fecha.

## 5. WhatsApp

**Por que vale.** É onde a família realmente lê. Um aviso curto quando um alerta novo aparece, com o link para a tela de alertas.

**Onde encaixa.** O grupo do WhatsApp no `.env.example`. O caminho mais simples passa pelo n8n (item 6).

## 6. n8n

**O que é.** Automações montadas ligando caixinhas, sem escrever código. O arquivo pronto para subir e um guia com dois exemplos do CareTwin estão em `n8n/README.md`.

**Onde encaixa.** O app ou a API chamam o endereço do webhook guardado em `N8N_WEBHOOK_URL`, e o n8n faz o resto (e-mail, WhatsApp, planilha).

## 7. Banco no Supabase

> **Construído e montado em produção** (migrações 0001 a 0005, rodadas em 15/10/2026). Falta só a `DATABASE_URL` na Vercel.

**O que fazer.** Crie um projeto no Supabase e ligue a extensão `pg_cron` (Database → Extensions), que a migração 0004 usa. Depois, copie a connection string do "Transaction pooler" (botão Connect, porta 6543) e cole em `DATABASE_URL` no `.env.local`, com `?sslmode=require` no final. As tabelas (usuários, pessoas, pulseiras, vínculos, dias e alertas) estão em `banco/migracoes/`: cole cada arquivo no SQL Editor do Supabase, em ordem, e execute uma vez. Com o banco ligado, quem entra com e-mail e senha vê só a própria família, e liga pulseiras, aprova pedidos, sai e encerra pela tela Família.

**O que já está ligado.** Com conta, Painel, Sono e Alertas mostram os dias que a pulseira mandou, lidos pelas rotas do cartão 5.6 (troca no `store`, cartão 7.3). Sem nenhum dia ainda, as telas dizem que os dados estão a caminho. Os alertas nascem no servidor quando a pulseira entrega dias novos (cartão 6.1) e aparecem na tela de Alertas.

## 8. Antes de publicar

**Estado hoje.** O app está publicado na Vercel (<https://caretwin-omega.vercel.app>), a partir da branch main e da pasta `apps/web`, com a Deployment Protection ligada: só abre para quem entra com a conta da Vercel do projeto. Desde 20/10/2026 as variáveis de ambiente estão na Vercel: o site publicado usa o banco de produção e o login de verdade.

**Passo 1 está feito.** Com o banco ligado, toda rota de `src/app/api/v1` exige a sessão assinada de uma conta com e-mail e senha, e só devolve as pessoas com vínculo aprovado com essa conta (sem vínculo, 404). A antiga lista `EMAILS_PERMITIDOS`, a rota `/api/dados` e a tabela `registros` saíram: elas guardavam tudo numa tabela sem dono.

**Falta, nesta ordem:**

1. ~~Variáveis de ambiente na Vercel (Production): `AUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e `DATABASE_URL`, com Redeploy.~~ Feito em 20/10/2026.
2. ~~No Supabase de produção, em Authentication → URL Configuration: Site URL `https://caretwin-omega.vercel.app` e Redirect URLs `https://caretwin-omega.vercel.app/**`.~~ Feito em 20/10/2026.
3. Entre com duas contas diferentes e veja que cada uma vê só a própria família. O `/api/health` já responde `"banco": "configurado"`.
4. Limite as tentativas de código errado ao ligar a pulseira (cartão 5.10) antes de abrir o cadastro para gente de fora do grupo.
5. Para mostrar a alguém de fora (o professor, por exemplo), gere um link no botão Share do deploy ou desligue a proteção em Settings → Deployment Protection.

**Por quê.** O código da pulseira tem só quatro caracteres. Sem limite de tentativas, alguém com uma conta poderia testar códigos até achar uma pulseira livre.

---

## Chave de API é senha

Ela vai no `.env.local`, que nunca sobe para o repositório (o `.gitignore` já bloqueia). O `.env.example` mostra quais chaves existem, sem valor nenhum dentro. Se uma chave vazar, apague no painel do serviço e gere outra.
