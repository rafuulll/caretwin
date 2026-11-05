# Ajustes de detalhe — r7

04/11/2026. Retorno do proprietário aplicado à prévia local. Sem publicação.

## Painel

- Removido o retângulo de inspeção do gráfico e seu elemento compartilhado. A própria barra e a legenda continuam respondendo ao apontamento e à seleção. Atalhos e botões de navegação entre dias foram preservados.
- Número principal e legenda passaram a ter elementos explícitos e 24 px de separação no desktop. No celular, a legenda permanece abaixo. Valores principais e dos três dias observados usam algarismos proporcionais para evitar separadores visualmente largos; tabela equivalente preservada.
- Número, percentagem e descrição da bateria formam um único grupo. No desktop, “78% de bateria” fica na mesma linha; no celular, ícone + percentagem permanecem visíveis sem quebrar a descrição em palavras soltas.
- Barras de rolagem nativas mais finas, com cor neutra e pista transparente, na página, lateral, ajudas, gráfico e tabela. Rolagem e teclado continuam nativos; cores forçadas usam a aparência do sistema.
- O menu de pessoas usa o seletor nativo personalizável em navegadores compatíveis: lista branca, seleção azul suave, confirmação da escolha, foco por teclado, Escape e posicionamento na camada superior. Nenhuma biblioteca ou gestão manual de foco adicionada. Navegadores sem `appearance: base-select` mantêm o seletor nativo funcional. [Documentação primária MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select).

## Landing

- Restaurada a volta ao dia com retração circular da máscara. O sol só começa a reaparecer quando o raio azul já está fora de toda a área do símbolo, corrigindo sol azul sobre fundo azul. A entrada na noite continua com a composição aprovada.
- O componente acompanha a preferência de movimento reduzido, inclusive mudanças feitas enquanto a página está aberta. Nenhum percurso depende do efeito.
- Arte simplificada para um único iPhone quase frontal, com leve perspectiva e base menor. Tela baseada na captura real do painel. Substituição na landing e na biblioteca `/marca`; anteriores preservadas. Fonte, edição e prompt em [landing/PROMPTS-R7.md](landing/PROMPTS-R7.md).

## Verificação

Build aprovado, 16 verificações funcionais aprovadas, nenhum erro de JavaScript. Axe não apontou violações na landing e no painel em desktop e celular. Conferidos teclado do seletor, Escape, dados/URL da pessoa, rolagem da lateral e ajuda, valores agrupados, ausência do retângulo, máscara quadro a quadro, trocas rápidas, alteração da preferência de movimento, imagem e reflow com texto ampliado em 320 px. Detector Impeccable sem achados.

Na rodada inicial, a automação tentou clicar no seletor coberto pelo cabeçalho após ter rolado o gráfico; o roteiro foi corrigido para retornar ao topo. O teste de bateria foi ajustado ao comportamento de blockificação nativo do flexbox. Também foi corrigida a leitura dinâmica da preferência de movimento no componente, pois a versão instalada do hook da biblioteca usa um snapshot inicial. Evidência final em [VERIFICACAO-R7.json](VERIFICACAO-R7.json); captura e roteiro no workspace `C:/Users/WIN11/Documents/Playground/caretwin-details-r7/`.

Revisão no Chrome local; não representa certificação de acessibilidade nem avaliação com usuários ou em aparelhos físicos.
