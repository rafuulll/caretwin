# Ambiente da seção do celular — r11

04/11/2026. Implementação autorizada após o plano r10. Apenas arquivos locais; sem publicação.

## Direção aplicada

O vazio percebido era principalmente o isolamento do iPhone dentro da coluna. A composição agora une um aparelho frontal de maior presença a um cenário de estúdio. A assinatura da marca aparece em uma única onda em baixo-relevo no material do fundo; sua curva sugere ritmo e continuidade, sem riscar palavras nem cruzar controles.

O azul claro da seção, o título, a copy, as abas e a nota de vínculo foram preservados. A hero, dia/noite, histórico, FAQ e encerramento não receberam novos ornamentos. O cenário tem luz difusa, base compacta e fundo integrado nas bordas. Nenhuma outra cena ou objeto foi acrescentado.

## Construção e assets

- `src/landing/phone-scene.jsx` compõe cenário raster, moldura geométrica em CSS e telas independentes. A carcaça permanece estável durante a troca de perspectiva. A imagem não é um aparelho interativo; a figura possui descrição acessível específica para a pessoa mostrada.
- `cenario-ritmo-r11.webp`: cenário gerado com image_gen nativo, usando a composição r7 como referência de materiais. 1254 × 1254; prompt e caminho do original em [landing/PROMPTS-R11.json](landing/PROMPTS-R11.json). A imagem de origem foi preservada.
- `painel-antonio-r11.webp` / `painel-maria-r11.webp`: capturas atuais do próprio painel em 390 × 844 CSS px, escala 3, exportadas em WebP lossless. Valores e tipografia não foram recriados por geração de imagem.
- Moldura frontal, ilha e detalhes de borda usam CSS local. A proporção da tela foi ajustada para preservar o formato das capturas. No desktop de 1440 px, a moldura ocupa aproximadamente 236 × 502 px; no mobile de 375 px, aproximadamente 126 × 268 px.
- A aba “Para quem usa” mostra Antônio; “Para a família” mostra Maria. A tela faz crossfade e deslocamento de 5 px em 240 ms (3 px em mobile). Movimento reduzido troca imediatamente. A altura da seção e a posição da página permanecem estáveis.
- A biblioteca `/marca` passa a expor o cenário e as duas telas como materiais separados. Assets anteriores continuam preservados. Nenhuma dependência nova ou asset externo incorporado.

## Verificação

Build aprovado e 15 verificações aprovadas, sem erros de JavaScript: encaixe do aparelho, proporção, telas 3×, troca de perspectiva com descrição acessível e copy correspondentes, ausência de saltos, teclado, movimento reduzido e biblioteca. Zero violações nas quatro auditorias axe da seção (1440, 1024, 375 e 320 px); sem overflow horizontal nesses tamanhos. Capturas e roteiro no workspace `caretwin-details-r11`; evidência final em `VERIFICACAO-R11.json`.

Na primeira revisão, o teste de movimento reduzido encontrou a duração mínima global da folha de estilo. A cena passou a declarar a ausência de transição de forma explícita; a proporção do aparelho também foi ajustada para manter a tela próxima do aspecto original. A rodada de confirmação passou. Verificação em Chrome local, sem aparelhos físicos ou teste com usuários.
