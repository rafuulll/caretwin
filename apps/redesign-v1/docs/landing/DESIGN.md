# CareTwin · direção vigente da landing

Atualização de 04/11/2026. **Redesign v1, refinamento r12, ainda em desenvolvimento.** A direção visual aprovada está preservada. Ajustes atuais: abas sem deslocamento de página, foco visível reservado ao teclado, coluna do FAQ acompanhando o scroll e retirada da nota da hero. Registro atual: [REFINAMENTO-R12.md](../REFINAMENTO-R12.md); [REFINAMENTO-R6.md](REFINAMENTO-R6.md) registra a etapa anterior; [REFINAMENTO-FINAL.md](../REFINAMENTO-FINAL.md) registra o acabamento geral; [REFINAMENTO-R5.md](REFINAMENTO-R5.md) registra a etapa anterior; r2/r3/r4 registram as decisões anteriores. Destino desta revisão: prévia local; sem novo push ou deploy.

## Autoridade visual

Preservar a hero escolhida pelo proprietário, com Fustat, branco, azul e Ritmo reclinado. AbacatePay orienta acabamento e clareza de produto; o fechamento segue a referência de Figma fornecida pelo proprietário, com Ritmo invertido em fundo azul claro. Não copiar marca ou recursos financeiros das referências.

Preservar os títulos aprovados, com o circulado fino solicitado em “ritmo.” na hero; manter o histórico em três abas, a nota de vínculo próxima ao conteúdo e o fechamento aprovado. As fotografias de r2 foram rejeitadas pelo proprietário. Dia/noite mantém o conceito de sol e lua em uma composição nova, com menos elementos. Família usa uma cena 3D inédita do produto, com os materiais e as cores da composição anterior.

## Tokens

| Papel | Valor |
| --- | --- |
| Texto principal | `#14233d` |
| Texto de apoio | `#586b87` |
| Ação / seleção | `#2549d8` |
| Azul profundo de apoio | `#141d52` |
| Fundo dia/noite | `#f4f7fc` |
| Fundo família | `#f1f5ff` |
| Fundo fechamento | `#edf3ff` |
| Divisórias | `#dce4f1` |
| Superfície | `#ffffff` |

Fustat local, pesos 400–800, licença OFL preservada. Corpo 18 px; descrições de conteúdo 16–17 px; títulos de capítulo em torno de 42–50 px; hero 60 px, chegando a 64 px em telas amplas. No celular, títulos usam escala de 29–41 px conforme função; hero 36–55 px. Tracking mínimo -0,04em.

Contêiner máximo 1120 px. Margens 48 px em desktop, 32 px em larguras intermediárias, 20 px no celular e 16 px abaixo de 360 px. Imagens e diagramas com raio de 16 px, reduzido a 14 px em cenas móveis. Botões de 12 px; abas e navegação em cápsulas. Alvos principais de 44 px ou mais; CTA de 52 px no desktop.

## Composição

- **Hero:** copy, Ritmo e CTA aprovados; circulado fino azul na palavra “ritmo.” conforme pedido mais recente, com desenho único e alternativa estática em movimento reduzido. Proporções e respiro desktop refinados para dar mais presença ao Ritmo. Sem faixa de texto no fim; seta central em curva branca contínua com a seção seguinte.
- **Dia/noite:** título e abas centralizados; texto e composição geométrica em duas colunas. Um volume claro com sol alterna para azul profundo com lua; base única, sem ícones repetidos, órbitas ou etiquetas inclinadas. No celular, texto precede a cena.
- **Histórico:** três etapas horizontais Registrar, Conhecer, Comparar. Cada peça representa um dia e recebe rótulo Dia 1–5 / Hoje. O diagrama permanece montado durante as transições: os dias se conectam e hoje é comparado ao histórico. A quantidade é ilustrativa e não define prazo de aprendizado. Removidos os dois ícones/legendas superiores e a nota de representação. Ritmo como guia. Sem mudança automática de etapa por scroll.
- **Família:** um único iPhone frontal em uma cena de estúdio com onda material em baixo-relevo. A moldura nativa em CSS mantém a tela independente do cenário. Capturas atuais do próprio painel em 3× mostram Antônio ou Maria conforme a perspectiva escolhida, com transição de 240 ms e estado imediato em movimento reduzido. A base permanece compacta; nenhuma curva toca textos ou controles.
- **FAQ:** perguntas e divisórias aprovadas, sem onda decorativa. Título e apoio na coluna esquerda acompanham a rolagem com sticky a 110 px, limitados à seção. Fluxo normal em telas até 900 px ou altura até 550 px.
- **Fechamento:** azul claro, Ritmo invertido pequeno, título, descrição, CTA e ajuda por âncora. Sem ornamentos nos cantos.
- **Rodapé:** branco, compacto, com identificação acadêmica e navegação simples. Sem link da biblioteca, frase de IA ou aviso de primeira versão no fechamento, conforme pedido do proprietário. Proveniência dos assets mantida na documentação e biblioteca.

## Ícones e assets

Cinco símbolos SVG próprios em `public/assets/brand/icon-*.svg`: movimento, sono, histórico, família e vínculo. Geometria vetorial de 32 unidades, traço arredondado de 1,8, azul e preenchimento leve. Ícones aparecem com rótulos; os dos controles continuam Phosphor. Os SVGs são acessíveis como elementos decorativos quando o texto já oferece o significado.

A composição vigente usa `cenario-ritmo-r12.webp` como fundo de estúdio e `painel-antonio-r11.webp` / `painel-maria-r11.webp` como capturas atuais. A moldura do aparelho é geometria nativa de interface em CSS. O cenário é uma imagem gerada, convertida para WebP; telas são capturas em 1170 × 2532 com exportação lossless. A cena r7 e os demais estudos anteriores permanecem arquivados. Ritmo e a hero mantêm seus assets aprovados. Proveniência em `PROMPTS-R11.json`.

## Movimento

Momento principal: continuidade dos dias no histórico. Traçado conecta os dias; o registro de hoje se destaca e recebe ligação inferior na etapa Comparar, em 520 ms com desaceleração. Sol/lua alternam em 480 ms. Cápsula branca de seleção desliza entre as abas de dia/noite e família em 360 ms. Títulos de capítulo e FAQ revelam as palavras por máscara vertical em 850 ms, com intervalo de 45 ms, uma vez por entrada inicial. A seta de CTA desliza para fora e sua sucessora entra, em 320 ms, sem alterar o texto ou a área de clique. Menu oculta após 28 px de deslocamento descendente, fora do topo; retorna após 10 px ascendentes. Navegação aberta e foco por teclado mantêm o menu disponível. Movimento reduzido usa estados estáticos completos e troca instantânea. Nenhum conteúdo exige hover ou scroll capturado para ser entendido.

## Escopo técnico

React/Vite multipage; landing e painel têm folhas CSS separadas. Fontes, arte e ícones são locais. Radix mantém semântica, teclado e estados de Accordion, Tabs e Sheet. A biblioteca em `/marca` expõe personagem, vínculo 3D e cinco downloads SVG. Dashboard e aplicativo original não fazem parte deste refinamento.

As abas compartilhadas usam foco de ponteiro com `preventScroll`; teclado mantém o comportamento de navegação e indicador visível. Os painéis ocultos de dia/noite e histórico preservam o espaço em grid, com leitura/foco desativados. Não há navegação por âncora na seleção das abas. Estudos de logo separados em `/estudos/logo-caretwin.html`; nenhuma opção foi aplicada à marca ativa.


Adendo de movimento — 04/11/2026: o deslocamento inicial das palavras está na regra-base para impedir piscada antes de useInView ativar a revelação. Movimento reduzido remove animação e transformação. A assinatura permanece apenas tipográfica, com o ponto azul ajustado em .32em; estudos de logo foram deixados de lado pelo proprietário.


## Refinamento de movimento e leitura — 04/11/2026

Mantida a composição aprovada. Noite revelada por máscara de 680 ms, histórico com indicador compartilhado de 320 ms e traço finito de 950 ms ligando referência e hoje. Abas preservam o espaço do texto; estado entra em 300 ms. FAQ usa +/− e expansão existente. Menu indica a seção atual. Seleção sempre manual, sem scroll capturado, sem pacote novo e com estados instantâneos em movimento reduzido. Os textos e a finalidade dos dados foram preservados. Evidência em ../REFINAMENTO-FINAL.md.


Adendo r6: volta ao dia por clareamento da camada azul, sem retração visível de máscara; lua sai em 150 ms, sol retorna após 180 ms sem giro. Na aba Comparar, o ponto acompanha a geometria SVG exata das duas linhas e das curvas. iPhone da composição agora frontal, com reprodução da captura real do painel. Prompt, evidências e limites em REFINAMENTO-R6.md.


## Detalhes atuais r7

Arte ativa: somente iPhone quase frontal com painel, sobre base pequena; sem pulseira na composição desta seção. Volta ao dia novamente circular: sol oculto até a máscara azul deixar a região do símbolo. Preferência de movimento é acompanhada ao vivo. As decisões r6 de clareamento por opacidade foram substituídas conforme retorno do proprietário. Ver ../REFINAMENTO-R7.md.


## R12 — integração suave

O cenário do iPhone mantém a atmosfera azul com menor contraste. Material neutro e campo radial azul discreto são camadas separadas; sem máscara de borda esfumaçada. A hero recupera o circulado em “ritmo.” e usa colunas mais equilibradas com menor altura desktop. Proveniência e critérios em REFINAMENTO-R12.md e PROMPTS-R12.json.
