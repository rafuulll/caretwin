# Próximos passos do CareTwin

O protótipo funciona sozinho: sem servidor, sem banco e sem chave de API. É isso que faz ele rodar com `npm install` e `npm run dev`.

Este arquivo é o mapa do que vem depois. A página Como usar (`/como-usar`) é a versão dele dentro do app, navegável.

Dois itens já estão construídos e desligados: o login com Google e o banco no Neon. O código está escrito e testado, esperando só as chaves no `.env.local`. Do terceiro em diante é mapa: o que é, por que vale para o CareTwin e onde encaixa.

## A ordem

- [ ] 1. **API do CareTwin**: trocar os dados de exemplo pelos dados reais da pulseira
- [ ] 2. **Login com Google**: saber quem está usando · *já construído, falta a chave*
- [ ] 3. **A IA que escreve os textos**: o resumo do dia e os alertas escritos de verdade
- [ ] 4. **Envio de e-mail**: mandar o resumo do dia para quem acompanha
- [ ] 5. **WhatsApp**: avisar quem acompanha onde a família realmente lê
- [ ] 6. **n8n**: fazer o e-mail e o WhatsApp acontecerem sozinhos
- [ ] 7. **Banco no Neon**: guardar fora do navegador sem esperar a API · *já construído, falta a conexão*
- [ ] 8. **Antes de publicar**: proteger as rotas de servidor

---

## 1. API do CareTwin

**O que é.** A pulseira manda o resumo do dia e o registro da noite para a API própria do projeto (FastAPI com Supabase). O app passa a ler de lá.

**Por que vem primeiro.** É o que transforma o protótipo no CareTwin de verdade: o normal deixa de ser calculado sobre pessoas inventadas e passa a ser o da pessoa que usa a pulseira.

**Onde encaixa.** `src/lib/store.ts`. As telas só chamam `useDados()` e `usePessoaNaTela()`, então trocar o miolo dessas funções por chamadas à API não muda tela nenhuma. A regra do normal da API e a de `src/lib/normal.ts` são a mesma (cartão 2.3), e dá pra comparar as duas lado a lado com os mesmos dados.

## 2. Login com Google

> **Já está construído.** Falta só a chave.

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

## 7. Banco no Neon

> **Já está construído.** Falta só a conexão.

**O que fazer.** Crie um projeto Postgres no Neon, copie a string de conexão e cole em `DATABASE_URL` no `.env.local`. O app cria a tabela sozinho na primeira chamada (o desenho está em `banco/schema.sql`) e passa a gravar lá, sem nenhuma tela mudar.

**Por que fica desligado.** No CareTwin quem guarda os dados é a API do projeto. O Neon é a ponte pronta, caso o grupo queira dados fora do navegador antes de a API estar no ar.

## 8. Antes de publicar

Nada deste protótipo é publicado hoje. Se um dia for, duas coisas vêm antes:

- A rota `src/app/api/dados` ainda não pergunta quem está chamando. Ela precisa exigir a sessão assinada de `src/lib/sessao-servidor.ts` e recusar o que não for de quem pediu. Dado de saúde nunca fica aberto.
- Os dados de exemplo saem, e entram os da API.

---

## Chave de API é senha

Ela vai no `.env.local`, que nunca sobe para o repositório (o `.gitignore` já bloqueia). O `.env.example` mostra quais chaves existem, sem valor nenhum dentro. Se uma chave vazar, apague no painel do serviço e gere outra.
