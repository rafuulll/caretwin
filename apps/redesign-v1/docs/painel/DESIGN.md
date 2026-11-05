# CareTwin — direção visual do painel v1

Prévia local independente, refinada em 04/11/2026. Registro vigente: [REFINAMENTO-R7.md](../REFINAMENTO-R7.md). [REFINAMENTO-FINAL.md](../REFINAMENTO-FINAL.md) preserva o acabamento geral. r2/r3 preservam o histórico das etapas anteriores. Direção: um painel de rotina com a clareza e o acabamento de um produto fintech, preservando o tom adulto e próximo do CareTwin.

## Autoridade e referências

1. [PRODUCT.md](PRODUCT.md) define público, escopo e significado dos dados.
2. A referência Fingoals fornecida pelo proprietário orienta a composição: base branca, navegação lateral, área central cinza clara, indicador principal amplo e cartões de apoio. Arquivo de referência: `C:/Users/WIN11/AppData/Local/Temp/codex-clipboard-b1bb311e-670a-4e5b-8a9e-c91f3f41f1c1.png`.
3. A identidade deriva de `../landing/DESIGN.md`: azul CareTwin, Fustat, branco, proximidade e Ritmo. O painel adapta a densidade ao acompanhamento; a landing permanece independente.

A referência não autoriza copiar marca, gráficos financeiros, promoções ou decoração sem função. Ritmo 2D usa o asset aprovado existente, pequeno e ligado à explicação da faixa pessoal. Ele aparece na faixa educativa abaixo dos registros e na ajuda. A lateral usa texto compacto, sem repetir o personagem. A assinatura da marca usa somente CareTwin em Fustat, pesos 500/600, com ponto azul.

## Tokens implementados

| Papel | Valor | Aplicação |
| --- | --- | --- |
| Ação e seleção | `#2549d8` | Botões primários, métricas ativas e barras recentes |
| Texto principal | `#14233d` | Títulos e valores |
| Texto secundário | `#586b87` | Contexto, origem e período |
| Superfície principal | `#f3f5f9` | Área de acompanhamento |
| Base do aplicativo | `#ffffff` | Janela, cabeçalho e navegação |
| Cartão | `#ffffff` | Indicadores e histórico |
| Linha | `#dce4f1` | Divisórias e limites |
| Azul suave | `#eaf0ff` | Token de apoio |
| Azul claro do guia | `#e9eefb` | Faixa explicativa com Ritmo após os registros |
| Navegação ativa | `#19232e` | Item atual na lateral |
| Comparação dentro da faixa | `#edf5f1` / `#286150` | Fundo / texto; não significa avaliação clínica |
| Mudança observada | `#faf6ee` | Cartão de contexto, sem alarme visual |
| Selo de mudança | `#f8e8cd` / `#77521c` | Fundo / texto |

Fustat local, fallback `sans-serif`, com pesos 400, 500, 600, 700 e 800 disponíveis. Título principal de 30 px no desktop; indicador de passos de 76 px, 70 px no celular e 64 px em telas estreitas na visão geral. Texto-base de 16 px; hierarquia por tamanho, peso e espaço. Legendas e textos de apoio foram ampliados na revisão; no móvel, datas e eixos do gráfico usam 12 px. Selos variam por contexto e breakpoint. Números usam algarismos tabulares. A preferência “Texto maior” amplia elementos de leitura.

Cartões têm raio de 16 px; a superfície de conteúdo encontra a navegação com um canto de 20 px no desktop. A moldura externa foi removida. Navegação e seletores usam cápsulas. Espaços principais entre cartões: 20 px no desktop e 16 px no móvel. O aplicativo não usa sombra de moldura; cartões não recebem elevação indiscriminada.

## Composição e comportamento

- Desktop: cabeçalho horizontal sticky, lateral de 224 px que acompanha a rolagem e área principal flexível. A janela inteira é usada; não há margem externa. Passos lideram, com sono e pulseira na lateral. Histórico e mudança usam as mesmas colunas. O guia com Ritmo aparece após os registros.
- Até 1200 px: espaçamento e proporções se ajustam. Entre 761 e 1060 px, os blocos da visão geral passam a uma coluna; sono e pulseira permanecem lado a lado.
- Até 760 px: conteúdo empilhado, navegação inferior e menu em painel. O histórico tem rolagem horizontal própria, centraliza o último dia ou o dia selecionado e exibe “Deslize para explorar os dias”. As áreas de seleção das barras têm largura mínima de 44 px.
- A pessoa selecionada e o instante do cenário permanecem próximos ao título. Hoje é parcial; o histórico contém dias completos até 1 nov.
- No aprendizado, dois dias completos e hoje ilustram 3 de 8 dias. A faixa fica ausente também dos detalhes; sem registros, Família e Preferências continuam acessíveis.

## Componentes, assets e movimento

`src/painel/ui.jsx` contém uma composição Dialog/Sheet adaptada do padrão shadcn/ui sobre `@radix-ui/react-dialog`, com CSS próprio: título, descrição, sobreposição e fechamento. Escape fecha o painel e o foco retorna ao controle que o abriu. Marcar a leitura compartilhada fecha o detalhe para tornar o “Desfazer” acessível. Botões e switches são composições locais. Não há dependência de um pacote completo shadcn/ui.

Ícones são Phosphor, com peso regular como padrão e rótulos acessíveis nos botões de ícone. Fustat está em `public/assets/`, com a licença SIL Open Font License 1.1 em `OFL-Fustat.txt`. `ritmo-guia.webp` é reaproveitado; não foi criado um novo personagem para o painel.

Motion anima as cápsulas de período/métrica em 200 ms e a escala vertical das barras em 240 ms, com curva `cubic-bezier(.16,1,.3,1)`. Interações de superfície usam transições breves. `MotionConfig` e CSS respeitam movimento reduzido; a informação não depende da animação.

## Revisão da prévia inicial (03/11/2026)

Foco visível de 3 px, atalho para o conteúdo, navegação por teclado, alvos de interação de 44 px, leitura em telas estreitas, preferência de texto maior e tabela equivalente ao gráfico orientaram o refinamento. As legendas e os alvos foram ampliados sem alterar os tokens ou os raios de base.

Na verificação de entrega, 14 checagens passaram; axe retornou zero violações nas páginas desktop e móvel avaliadas. O documento não apresentou rolagem horizontal em 1440, 390 ou 320 px. Movimento reduzido foi verificado, e uma execução do detector retornou `[]`. Esses resultados não equivalem a conformidade integral de acessibilidade ou avaliação com usuários. Evidência e limites estão em [DECISOES.md](DECISOES.md) e `qa-results.json`.


## Revisão anterior r2 (04/11/2026)

Escopo e decisões em REFINAMENTO-R2.md. O refinamento da visão geral está em src/painel/overview-r2.css; os componentes existentes preservam os outros percursos. O gráfico mantém o dia selecionado visível após resize e carregamento da fonte, apenas pela rolagem interna. Guardas de hover impedem leitura de índice ausente na troca de estados. Evidências atuais em VERIFICACAO-R2.json.


## Direção atual das demais telas — r3

Passos e Sono usam resumo + explicação curta no topo e histórico abaixo. A métrica fica fixa nessas páginas; somente período e tabela são controles. Sono usa noites encerradas, com origem da estimativa explícita. Mudanças separa o registro observado da explicação; Família usa lista de participantes com uma ação por pessoa; Preferências organiza leitura e privacidade em grupos nativos, com reinício em divulgação progressiva. Datas e seletor de pessoa aparecem apenas nas áreas de registros. Navegação lateral e inferior usam links reais com view/person e histórico nativo do navegador.

A superfície permanece clara, com Fustat e a assinatura tipográfica aprovada. Desktop usa colunas; tablet e celular empilham os dados. Movimento reduzido usa estados estáticos. Foco, alvos de toque, tabela equivalente e texto ampliado foram revisados. Componentes em views-r3.jsx e estilos em views-r3.css. Decisões e evidências em REFINAMENTO-R3.md e VERIFICACAO-R3.json.


## Refinamento final — aplicação e feedback

A estrutura branca ocupa a janela. Os controles de cenário estão no fim do conteúdo, em divulgação progressiva. Gráfico: seleção pela própria barra e legenda, setas visíveis e uma parada de Tab com ArrowLeft/ArrowRight/Home/End. Privacidade também no cabeçalho móvel. Ajuda fecha em 150 ms; setas respondem em 280 ms; confirmação entra em 240 ms. Nenhuma animação de número ou atraso de navegação. Detalhes e evidência em [REFINAMENTO-FINAL.md](../REFINAMENTO-FINAL.md).


## Detalhes atuais r7

Sem retângulo de hover no gráfico. Número principal e legenda agrupados com espaço explícito; bateria em uma unidade de leitura; algarismos proporcionais nos valores de destaque e nos dias observados. Barras de rolagem nativas finas e neutras. Seletor de pessoa personalizável com fallback nativo. Decisões e evidência em ../REFINAMENTO-R7.md.
