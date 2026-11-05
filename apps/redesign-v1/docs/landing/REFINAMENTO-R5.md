# Landing · refinamento r5

04/11/2026. Entrega local; sem commit, push ou deploy.

## Ajustes

- **Abas sem salto:** o componente compartilhado `TabsTrigger` intercepta o foco de mouse/clique e usa `focus({preventScroll: true})`. Evita a chamada de foco sem opção de rolagem identificada no Radix instalado. A seleção automática e o teclado continuam funcionando. A correção vale para dia/noite, família e Registrar/Conhecer/Comparar.
- **Conteúdo estável:** painéis de texto de dia/noite e histórico ocupam a mesma célula de grid. Os inativos permanecem fora da leitura e do foco por `visibility`, `aria-hidden` e `tabIndex`; a seleção não desmonta o espaço da descrição. Rolagem não é restaurada à força nem capturada.
- **Foco:** clique/toque não exibe o contorno azul nas abas. Teclado preserva foco visível de 2 px. Modalidade atual registrada apenas em atributo DOM, sem persistência.
- **FAQ:** coluna de título com `position: sticky`, topo 110 px e limite da própria seção. A referência da Julia foi novamente inspecionada no Chrome e o CSS local confirmou esse comportamento. Em largura até 900 px ou altura até 550 px, mantém fluxo normal para não sobrepor perguntas.
- **Hero:** retirada a frase de prévia solicitada pelo proprietário.

## Exploração de logo

Comparação em `/estudos/logo-caretwin.html`, independente da landing. A marca ativa não foi substituída.

1. **Cadência — recomendação inicial:** C aberto com onda da rotina; origem no nome, na pulseira e no personagem.
2. **Monograma CT:** iniciais integradas para uma presença mais tecnológica e compacta.
3. **Assinatura:** nome como elemento principal; alternativa mais discreta, que ainda precisaria de um símbolo complementar para o app.

Os dois símbolos são SVGs vetoriais originais em `public/assets/brand/estudos/`. Os estudos não usam geração raster. A próxima decisão é a escolha de direção, antes de refinamento e aplicação.

## Verificação

Build aprovado. 32 verificações locais passaram. A matriz inclui cliques reais nas sete trocas de abas de cada uma das larguras 1440, 900 e 390 px: todos mantiveram a posição de scroll e a URL. Testados foco por mouse/teclado, título sticky, fluxo mobile do FAQ, remoção da nota da hero e prancha de logo. Axe sem violações detectadas em desktop/mobile; sem erros de execução. Detector uma vez: `[]`. Resultado completo e posições antes/depois em `VERIFICACAO-R5.json`. Sem pesquisa com usuários ou certificação.

Adendo do proprietário no mesmo refinamento: removido o bloco final da seção dia/noite, incluindo a frase sobre contexto, divisória e link Entenda a comparação. Espaço próprio do bloco e CSS correspondente retirados.

Adendo de espaçamento: topo da seção dia/noite ampliado de 114 para 146 px no desktop e de 90 para 114 px no mobile, dando mais respiro entre a seta central e o título.
