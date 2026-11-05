# Movimento e mockup — r6

04/11/2026. Alterações locais solicitadas pelo proprietário; sem publicação.

## Volta ao dia

A entrada na noite mantém a revelação circular de 680 ms. Na volta, a lua sai em 150 ms, a superfície azul perde opacidade (480 ms, início após 80 ms) e o sol retorna após 180 ms, sem giro visível. A máscara só é zerada quando a camada azul já está invisível. Trocas rápidas interrompem os controles anteriores; callbacks obsoletos não alteram o estado atual. Movimento reduzido aplica os valores finais imediatamente.

## Percurso da comparação

O defeito vinha da interpolação entre poucas coordenadas: o ponto cortava as curvas e o caminho azul. Agora, as linhas visíveis e o percurso compartilham os mesmos comandos SVG. `getPointAtLength()` calcula a posição exata ao longo do trajeto, incluindo a curva da referência, a subida até a junção, a reta azul e a curva final. Movimento linear de 950 ms, sem loop; interrompido ao sair da aba e ausente em movimento reduzido.

Referências técnicas primárias: [SVGGeometryElement.getPointAtLength — MDN](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength) e [animate — Motion](https://motion.dev/docs/animate). Sem nova dependência.

## iPhone com o painel

Edição da composição aprovada com a ferramenta nativa image_gen e captura real do painel móvel como referência. Pulseira e base preservadas; iPhone de frente, com o dashboard. Asset ativo: `public/assets/pulseira-iphone-painel-r6.webp`. A landing e `/marca` usam o novo arquivo; a versão anterior foi preservada. Imagem ilustrativa: os textos da tela são uma reprodução gerada da captura, não um iframe funcional. Prompt, entradas e origem em [PROMPTS-R6.md](PROMPTS-R6.md).

## Verificação

Build aprovado. 12 verificações funcionais passaram: ponto sobre as linhas em todos os quadros visíveis amostrados, passagem pela reta e curva azuis, término e cancelamento, amanhecer sem máscara retraída visível, ordem lua/sol, trocas rápidas, imagem carregada e enquadrada no desktop/celular, reflow em 320 px e movimento reduzido.

Desvio máximo medido entre o centro do ponto e o traçado visível: 0,097 unidade SVG (a amostragem do caminho usa intervalo de 0,2). Sem erros de JavaScript. Axe não apontou violações nas duas larguras avaliadas. Esses testes não substituem avaliação em aparelhos físicos ou com usuários. Evidência: [VERIFICACAO-R6.json](VERIFICACAO-R6.json); capturas e script no workspace `C:/Users/WIN11/Documents/Playground/caretwin-motion-r6/`.
