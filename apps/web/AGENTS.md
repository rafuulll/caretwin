<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regras do CareTwin

Este é o protótipo das telas do CareTwin, um acompanhamento gentil por pulseira que compara cada dia com o normal da própria pessoa. Leia o `README.md` e o `DECISOES.md` antes de mudar uma tela.

- Todo texto visível mora em `src/content/site.ts` (e o do tour em `src/content/tour.ts`). Componente não tem texto solto.
- Cor, fonte e cantos saem do `design-system.json` pelas variáveis `--ds-*`. Nada de cor escrita na mão, e nada de sombra por fora: o relevo é borda, gradiente curto e luz por dentro.
- Nenhuma tela lê ou grava dado por fora de `src/lib/store.ts`. É ali que a API do CareTwin vai entrar.
- Estados, limites e a regra do normal ficam em `src/lib/modelo.ts`. A regra é a do cartão 2.3: média dos 7 dias antes dos 3 recentes, 20% para cada lado, alerta quando 2 dos 3 dias fogem para o mesmo lado, mínimo de 5 dias válidos.
- O app nunca diagnostica, nunca recomenda remédio e nunca soa como alarme. Fora do normal é tom de atenção, sempre com ícone e texto, nunca vermelho. O vermelho é só para apagar dados.
- Toda medição aparece como acompanhamento, nunca como aparelho médico. O sono é sempre "estimativa".
- Quem usa pode ser uma pessoa idosa: botão principal com 56 px de altura e texto de 18 px, alvo de toque de no mínimo 44 px.
- Todo gráfico é SVG feito à mão e tem o mesmo conteúdo em texto (`dl`, `dt`, `dd`).
- Os nomes dos dados de exemplo são inventados. Nenhum dado de pessoa de verdade entra no projeto.
- Português do Brasil, sem traço longo, sem emoji. Comentário explica por que, nunca o que a linha faz.
- Nada é publicado e nenhum repositório remoto é criado a partir desta pasta sem o pedido do dono do projeto.
