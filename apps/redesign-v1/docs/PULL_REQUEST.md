# web: primeira versao do redesign v1 (em desenvolvimento)

## O que muda

Primeira versão da landing e do dashboard do redesign CareTwin, reunidos em `apps/redesign-v1`. **Nada está finalizado:** esta entrega serve para avaliar direção visual, estrutura e navegação; layout, copy, interações e integração continuarão evoluindo.

O aplicativo atual, autenticação, API, banco, firmware e regras de negócio permanecem independentes em `apps/web`. Esta prévia trabalha exclusivamente com dados fictícios.

## Cartao do Trello

Não informado para esta etapa de exploração visual.

## Area

- [x] web (telas)
- [x] docs

## Validação desta entrega

- [x] Build da app `apps/redesign-v1` aprovado.
- [x] 14 verificações de integração: landing, painel, biblioteca, navegação entre páginas, contexto de pessoa, imagens, mobile e ausência de erros de runtime/HTTP.
- [x] Sem segredos ou URLs locais no runtime da prévia.
- [x] Configuração Vercel para app Vite multipage.
- [ ] Ajustes finais da landing e do dashboard.
- [ ] Integração com autenticação, API, persistência e pulseira.
- [ ] Revisão e validação com usuários.

Os comandos de TypeScript/lint/build de `apps/web` não foram executados nesta etapa, pois o aplicativo original não foi alterado. A validação acima corresponde à app independente de redesign, não à integração futura com o produto real.

## Como testar

1. Na pasta `apps/redesign-v1`, execute `npm ci` e `npm run dev`.
2. Acesse a landing em `http://127.0.0.1:4322/`.
3. Clique em **Explorar o painel** e confira `/painel/`.
4. Troque a pessoa acompanhada, período e métrica do histórico; consulte mudanças e preferências.
5. Volte ao site e explore a biblioteca em `/marca`, também no celular.

Sugestão: abrir como **Draft PR**, pois é uma primeira versão em desenvolvimento.
