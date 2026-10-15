# Próximos passos do CareTwin

O protótipo funciona sozinho: sem servidor, sem banco e sem chave de API. É isso que faz ele rodar com `npm install` e `npm run dev`.

Este arquivo é o mapa do que vem depois. A página Como usar (`/como-usar`) é a versão dele dentro do app, navegável.

Dois itens já estão construídos e desligados: o login com Google e o banco no Supabase. O código está escrito e testado, esperando só as chaves no `.env.local`. Do terceiro em diante é mapa: o que é, por que vale para o CareTwin e onde encaixa.

## A ordem

- [ ] 1. **API do CareTwin**: trocar os dados de exemplo pelos dados reais da pulseira
- [ ] 2. **Login**: saber quem está usando · *e-mail e senha pelo Supabase Auth e Google: os dois construídos, falta ligar*
- [ ] 3. **A IA que escreve os textos**: o resumo do dia e os alertas escritos de verdade
- [ ] 4. **Envio de e-mail**: mandar o resumo do dia para quem acompanha
- [ ] 5. **WhatsApp**: avisar quem acompanha onde a família realmente lê
- [ ] 6. **n8n**: fazer o e-mail e o WhatsApp acontecerem sozinhos
- [ ] 7. **Banco no Supabase**: guardar fora do navegador sem esperar a API · *já construído, falta a conexão*
- [ ] 8. **Antes de publicar**: rota protegida · *falta a Deployment Protection e as variáveis na Vercel*

---

## 1. API do CareTwin

**O que é.** A pulseira manda o resumo do dia e o registro da noite para a API do projeto, que mora neste mesmo Next.js, nas rotas de `src/app/api/v1` (cartão 2.4), com o Postgres do Supabase. O contrato está em `docs/openapi.yaml`. O app passa a ler de lá.

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

> **Já está construído.** Falta só a conexão.

**O que fazer.** Crie um projeto no Supabase, copie a connection string do "Transaction pooler" (botão Connect, porta 6543) e cole em `DATABASE_URL` no `.env.local`, com `?sslmode=require` no final. As tabelas (usuários, pessoas, pulseiras, vínculos, dias e alertas) estão em `banco/migracoes/`: cole cada arquivo no SQL Editor do Supabase, em ordem, e execute uma vez. Com o banco ligado, quem entra com e-mail e senha vê só a própria família, e liga pulseiras, aprova pedidos, sai e encerra pela tela Família.

**O que ainda falta.** Os dias e os alertas da pessoa chegam ao site com as rotas de leitura (cartão 5.6) e a troca no `store` (cartão 7.3). Até lá, com conta, as telas dizem que os dados ainda não chegaram.

## 8. Antes de publicar

**Estado hoje.** O app está publicado na Vercel, a partir da branch main e da pasta `apps/web`, com o link de produção aberto para quem tiver a URL. Sem banco, ele só mostra dados de exemplo guardados no navegador de quem abre.

**Passo 1 está feito.** Com o banco ligado, toda rota de `src/app/api/v1` exige a sessão assinada de uma conta com e-mail e senha, e só devolve as pessoas com vínculo aprovado com essa conta (sem vínculo, 404). A antiga lista `EMAILS_PERMITIDOS` e a rota `/api/dados` saíram: elas guardavam tudo numa tabela sem dono.

**Falta, nesta ordem:**

1. Ative a Deployment Protection na Vercel (Settings, Deployment Protection) para a prévia e para a produção, se o link deixar de ser só para mostrar.
2. Coloque nas variáveis de ambiente da Vercel, todas juntas: `AUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e só por último `DATABASE_URL`.
3. Entre com duas contas diferentes e confira que cada uma vê só a própria família. Em janela anônima, sem entrar, o app tem que continuar mostrando só os exemplos.
4. Limite as tentativas de código errado ao ligar a pulseira (cartão 5.10) antes de abrir o cadastro para gente de fora do grupo.

**Por quê.** O código da pulseira tem só quatro caracteres. Sem limite de tentativas, alguém com uma conta poderia testar códigos até achar uma pulseira livre.

---

## Chave de API é senha

Ela vai no `.env.local`, que nunca sobe para o repositório (o `.gitignore` já bloqueia). O `.env.example` mostra quais chaves existem, sem valor nenhum dentro. Se uma chave vazar, apague no painel do serviço e gere outra.
