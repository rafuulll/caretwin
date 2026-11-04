# CareTwin — direção visual do painel v1

Prévia local independente, documentada em 03/11/2026. Direção: um painel de rotina com a clareza e o acabamento de um produto fintech, preservando o tom adulto e próximo do CareTwin.

## Autoridade e referências

1. [PRODUCT.md](PRODUCT.md) define público, escopo e significado dos dados.
2. A referência Fingoals fornecida pelo proprietário orienta a composição: moldura branca, navegação lateral, área central cinza clara, indicador principal amplo e cartões de apoio. Arquivo de referência: `C:/Users/WIN11/AppData/Local/Temp/codex-clipboard-b1bb311e-670a-4e5b-8a9e-c91f3f41f1c1.png`.
3. A identidade deriva de `C:/Users/WIN11/Documents/Playground/caretwin-landing-v3/DESIGN.md`: azul CareTwin, Fustat, branco, proximidade e Ritmo. O painel adapta a densidade ao acompanhamento; a landing permanece independente.

A referência não autoriza copiar marca, gráficos financeiros, promoções ou decoração sem função. Ritmo 2D usa o asset aprovado existente, pequeno e ligado à explicação da faixa pessoal. Ele aparece apenas no banner contextual e na ajuda; a lateral mantém um bloco educativo claro, sem repetir o personagem.

## Tokens implementados

| Papel | Valor | Aplicação |
| --- | --- | --- |
| Ação e seleção | `#2549d8` | Botões primários, métricas ativas e barras recentes |
| Texto principal | `#182536` | Títulos e valores |
| Texto secundário | `#566576` | Contexto, origem e período |
| Superfície principal | `#f2f4f7` | Área de acompanhamento |
| Fundo externo | `#e9ecf0` | Moldura da prévia |
| Cartão | `#ffffff` | Indicadores e histórico |
| Linha | `#dce2e9` | Divisórias e limites |
| Azul suave | `#eaf0ff` | Token de apoio |
| Azul profundo | `#151e4c` | Explicação contextual com Ritmo |
| Navegação ativa | `#19232e` | Item atual na lateral |
| Comparação dentro da faixa | `#edf5f1` / `#286150` | Fundo / texto; não significa avaliação clínica |
| Mudança observada | `#faf6ee` | Cartão de contexto, sem alarme visual |
| Selo de mudança | `#f8e8cd` / `#77521c` | Fundo / texto |

Fustat local, fallback `sans-serif`, com pesos 400, 500, 600, 700 e 800 disponíveis. Título principal de 29 px no desktop; indicador de passos de 68 px, chegando a 76 px em telas amplas. Texto-base de 16 px; hierarquia por tamanho, peso e espaço. Legendas e textos de apoio foram ampliados na revisão; no móvel, datas e eixos do gráfico usam 12 px. Selos variam por contexto e breakpoint. Números usam algarismos tabulares. A preferência “Texto maior” amplia elementos de leitura.

Cartões têm raio de 16 px; superfície central, 24 px; moldura externa, 28 px. Navegação e seletores usam cápsulas. Espaços principais entre cartões: 20 px no desktop e 16 px no móvel. A sombra fica na moldura, sem elevar todos os cartões.

## Composição e comportamento

- Desktop: cabeçalho horizontal, lateral de 222 px e área principal flexível. Passos lideram; sono e pulseira apoiam; histórico e mudança dão contexto abaixo.
- Até 1200 px: espaçamento e proporções se ajustam. Entre 761 e 1010 px, os blocos principais passam a uma coluna.
- Até 760 px: conteúdo empilhado, navegação inferior e menu em painel. O histórico tem rolagem horizontal própria, centraliza o último dia ou o dia selecionado e exibe “Deslize para explorar os dias”. As áreas de seleção das barras têm largura mínima de 44 px.
- A pessoa selecionada e o instante do cenário permanecem próximos ao título. Hoje é parcial; o histórico contém dias completos até 1 nov.
- No aprendizado, dois dias completos e hoje ilustram 3 de 8 dias. A faixa fica ausente também dos detalhes; sem registros, Família e Preferências continuam acessíveis.

## Componentes, assets e movimento

`src/ui.jsx` contém uma composição Dialog/Sheet adaptada do padrão shadcn/ui sobre `@radix-ui/react-dialog`, com CSS próprio: título, descrição, sobreposição e fechamento. Escape fecha o painel e o foco retorna ao controle que o abriu. Marcar a leitura compartilhada fecha o detalhe para tornar o “Desfazer” acessível. Botões e switches são composições locais. Não há dependência de um pacote completo shadcn/ui.

Ícones são Phosphor, com peso regular como padrão e rótulos acessíveis nos botões de ícone. Fustat está em `public/assets/`, com a licença SIL Open Font License 1.1 em `OFL-Fustat.txt`. `ritmo-guia.webp` é reaproveitado; não foi criado um novo personagem para o painel.

Motion anima a altura das barras em 240 ms, com curva `cubic-bezier(.16,1,.3,1)`. Interações de superfície usam transições breves. `MotionConfig` e CSS respeitam movimento reduzido; a informação não depende da animação.

## Revisão da prévia

Foco visível de 3 px, atalho para o conteúdo, navegação por teclado, alvos de interação de 44 px, leitura em telas estreitas, preferência de texto maior e tabela equivalente ao gráfico orientaram o refinamento. As legendas e os alvos foram ampliados sem alterar os tokens ou os raios de base.

Na verificação de entrega, 14 checagens passaram; axe retornou zero violações nas páginas desktop e móvel avaliadas. O documento não apresentou rolagem horizontal em 1440, 390 ou 320 px. Movimento reduzido foi verificado, e uma execução do detector retornou `[]`. Esses resultados não equivalem a conformidade integral de acessibilidade ou avaliação com usuários. Evidência e limites estão em [DECISOES.md](DECISOES.md) e `qa-results.json`.
