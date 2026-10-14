# CareTwin

O CareTwin acompanha o dia a dia de uma pessoa por uma pulseira discreta, aprende o que é normal para ela e explica, em palavras simples, quando algo muda. É um acompanhamento gentil, sem diagnóstico e sem susto, para quem usa a pulseira e para o familiar ou cuidador que acompanha à distância.

Este é o protótipo das telas, projeto acadêmico da disciplina UPX (Engenharia da Computação). Ele roda só neste computador, com pessoas e dias de exemplo guardados no navegador. Nenhum dado é de pessoa de verdade e nenhum dado sai daqui.

## Como rodar

Com Node.js 20 ou mais novo:

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. Para entrar, escreva qualquer nome ou e-mail e qualquer senha: a senha não é conferida nem guardada.

Com Docker (precisa do Docker Desktop aberto), na pasta do projeto:

```bash
docker compose up --build
```

Abra <http://localhost:3000>. Para parar, `Ctrl+C` e depois `docker compose down`. Depois de mudar qualquer tela, rode de novo o `up --build`, porque a imagem guarda o código do momento em que foi feita. A porta fica presa a este computador.

Outros comandos:

```bash
npm run build      # confere que o app compila como ficaria publicado
npm run lint       # confere o estilo do código
npm run storybook  # catálogo de componentes em http://localhost:6006
```

Para o Next.js não enviar dados de uso, rode uma vez `npx next telemetry disable`. A telemetria do Storybook e a da imagem Docker já vêm desligadas.

## As telas

- Site, na raiz (`/`): o que o CareTwin resolve, com um normal de exemplo desenhado com os dados do app.
- Entrar (`/entrar`): nome ou e-mail, senha e o botão do Google.
- Como usar (`/como-usar`): o que já funciona e o que ainda falta ligar.
- Painel (`/app/painel`): os passos de hoje contra o normal até este horário, a bateria e a última atualização da pulseira.
- Sono (`/app/sono`): quanto a pessoa dormiu, quantas vezes acordou. É sempre uma estimativa.
- Batimentos (`/app/batimentos`): medição guiada de 12 segundos e o histórico.
- Alertas (`/app/alertas`): o resumo escrito do dia e os alertas de mudança, com marcar como lido.
- Primeiro uso (`/app/primeiro-uso`): conectar a pulseira e criar o perfil.
- Configurações (`/app/configuracoes`): dados de exemplo e perfil.

## Como o normal funciona

A regra é a do cartão 2.3 do Trello. Os números estão em `src/lib/modelo.ts` e a conta em `src/lib/normal.ts`.

1. O normal é a média dos 7 dias que vêm antes dos 3 dias mais recentes.
2. A faixa do normal vai 20% para baixo e 20% para cima dessa média.
3. Um alerta nasce quando 2 dos 3 dias recentes fogem da faixa para o mesmo lado.
4. Com menos de 5 dias válidos, o app diz que ainda está aprendendo e não compara.

Os passos de hoje são comparados com o normal até este horário, e não com o dia inteiro.

## Publicar na Vercel

Hoje o link de produção está aberto e mostra só dados de exemplo. A rota `/api/dados` já exige sessão e e-mail na lista `EMAILS_PERMITIDOS` quando o banco está ligado, mas antes de colocar `DATABASE_URL` ou as chaves do Google na Vercel, siga a ordem do item 8 do `PROXIMOS-PASSOS.md`.

O projeto vive em `apps/web` dentro do repositório do CareTwin. Na Vercel:

1. Importe o repositório e escolha `apps/web` em Root Directory. O resto a Vercel detecta sozinha.
2. Não precisa de variável de ambiente. Sem chaves, o app roda com os dados de exemplo de quem abre.
3. A branch principal vira o site oficial, e cada outra branch ou PR ganha um link de prévia.

Antes de divulgar o link, ative a proteção da prévia em Settings, Deployment Protection. Sem isso, qualquer pessoa com a URL abre o app. Com o banco desligado, a rota `/api/dados` responde "desligado" e não guarda nada. Com o banco ligado, ela recusa (401) quem não entrou com uma conta de `EMAILS_PERMITIDOS`.

## O que está desligado de propósito

Cada item já está escrito e só espera valores no `.env.local`. Copie o `.env.example`, preencha só o que for usar e reinicie o `npm run dev`. Nenhuma tela muda.

- API do CareTwin: troque as funções de `src/lib/store.ts` por chamadas à API. As telas só falam com `useDados()` e `usePessoaNaTela()`.
- Login com Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `AUTH_SECRET`. O fluxo está em `src/lib/google.ts` e `src/app/api/auth`.
- Banco Neon: `DATABASE_URL`. Fica desligado porque, no CareTwin, quem guarda os dados é a API.
- IA que escreve os textos: `OPENAI_API_KEY`, ou a IA local (Ollama) pela API. A chamada sai sempre de uma rota do servidor. Hoje os textos são de exemplo (`src/lib/respostas-ia.ts`).
- Automações: `n8n/` tem o docker-compose e um guia com dois exemplos do CareTwin.

## Pastas

```
src/app/            as rotas: site, entrar, como-usar, o app e as rotas de servidor (api)
src/components/     ui (peças), app (telas de dentro), marketing (o site), auth, cena, graficos
src/content/        todo texto que aparece na tela (site.ts e tour.ts)
src/lib/            modelo, normal, sono, store (a porta de dados), seed (exemplos) e o resto
design-system.json  cores, fonte e cantos do app inteiro
banco/              o desenho da tabela do banco (desligado)
n8n/                automações
.storybook/         catálogo de componentes
```

## Regras da casa

- Nenhum texto visível dentro de componente: tudo sai de `src/content`.
- Nenhuma cor escrita na mão: tudo sai do `design-system.json`.
- Nenhuma tela lê ou grava dado por fora de `src/lib/store.ts`.

As decisões de produto e de design estão em `DECISOES.md`, e o próximo passo de cada integração em `PROXIMOS-PASSOS.md`.
