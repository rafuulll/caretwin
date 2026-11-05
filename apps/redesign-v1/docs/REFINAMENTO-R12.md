# Atmosfera azul suave e composição da hero — r12

04/11/2026. Ajustes locais, sem publicação.

## Celular

A atmosfera azul foi mantida conforme a correção explícita do proprietário. A intensidade ficou separada do material do cenário: o asset r12 possui iluminação neutra e sombra localizada na base, enquanto uma camada de luz azul de baixa opacidade no código dá o esfumaçado suave. Foram retiradas as máscaras de transparência das bordas que produziam a sensação de retângulo esfumaçado. As extremidades se integram à cor da seção.

`cenario-ritmo-r12.webp` é uma edição do cenário r11, preservando onda, base e enquadramento. Prompt e original em `landing/PROMPTS-R12.json`. A base neutra não significa remoção do azul da composição: ele é aplicado por um campo radial amplo, com opacidade máxima aproximada de 13%. Telas, telefone, troca de perspectiva, texto e controles foram preservados.

## Hero

Devolvido o circulado fino azul especificamente em “ritmo.”, conforme solicitado. É um SVG decorativo sem mudança no texto acessível. O traçado aparece uma única vez em 850 ms; movimento reduzido o deixa visível e estático.

No desktop, as colunas ficaram mais equilibradas, a cena do Ritmo ganhou largura e a seção ficou menos alta, reduzindo espaços vazios. Arte, pose, tipografia e CTA aprovados foram mantidos. No mobile, a ordem e os tamanhos aprovados foram preservados; o circulado se adapta à palavra.

## Verificação

Build e 25 verificações passaram: geometria da hero e do circulado, ausência de overflow, separação entre texto e arte no desktop, retirada da máscara de borda, troca de perspectiva sem salto e movimento reduzido. Conferidos 1440, 1920, 1024, 375 e 320 px. Zero erros de JavaScript e zero violações nas três auditorias axe da landing (1440, 375 e 320 px). Inspeção visual confirmou a presença suave do azul e o destaque na hero. Evidência em `VERIFICACAO-R12.json`; capturas no workspace `caretwin-details-r12`. Não houve teste em aparelhos físicos.
