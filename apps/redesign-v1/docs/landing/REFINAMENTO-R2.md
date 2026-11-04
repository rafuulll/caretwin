# Landing CareTwin · refinamento r2

04/11/2026. Alterações autorizadas pelo proprietário após a revisão da primeira versão. A landing continua como **redesign v1 em desenvolvimento**, sem integração com contas, dados reais ou hardware.

## Decisões

| Problema observado | Decisão aplicada | Motivo e heurística |
| --- | --- | --- |
| Riscos, ondas e círculos competiam com os títulos | Retirar marcações da hero, capítulos, FAQ e fechamento | Hierarquia tipográfica e design minimalista |
| Ícones orbitais e textos inclinados pouco explicavam dia/noite | Cenas editoriais de movimento e descanso, alternadas pelas abas | Correspondência com a rotina, reconhecimento e controle |
| Histórico tinha muitas camadas de texto e scroll que trocava o estado | Três etapas explícitas: Registrar, Conhecer, Comparar; seleção manual | Controle, previsibilidade e divulgação progressiva |
| Calendário orbital era abstrato | Diagrama geométrico de registros, sem dias fixos ou números de saúde | Explicar o processo sem inventar métricas ou prazo de aprendizado |
| Cadeiras exigiam interpretar uma metáfora | Cena editorial de duas pessoas no cotidiano | Relação direta com autonomia e proximidade |
| Nota sobre vínculo distante das abas | Conteúdo sem altura mínima excessiva; nota a 20 px do painel | Proximidade visual e reconhecimento |
| Fechamento tinha ondas nos cantos e texto sublinhado | Fundo azul claro, Ritmo invertido, título e CTA simples | Retomar a referência de Figma fornecida pelo proprietário |
| Ícones grandes e repetidos se comportavam como decoração | Cinco SVGs próprios para conteúdo e Phosphor para controles | Consistência, legibilidade e função |

## Movimento e interação

As abas de dia/noite alternam texto e imagem com transição de 350 ms. A explicação do histórico muda por clique, toque e teclado; rolar não troca a etapa selecionada. O diagrama anima apenas as diferenças entre etapas. Uma abertura discreta do recorte da foto de família acompanha a entrada da seção no viewport; a imagem permanece visível desde o início. A preferência por movimento reduzido elimina essas transições. A hero conserva a inclinação suave por ponteiro preciso.

## Assets

Geração nativa `image_gen`: três cenas editoriais e recorte de Ritmo, com limpeza adicional da pose invertida. Nenhuma imagem representa usuários reais, depoimentos ou desenho industrial final. Cenas receberam legendas explícitas; a pulseira aparece como conceito, sem medições inventadas no display.

- `public/assets/rotina-dia-r2.webp`: caminhada com wearable conceitual.
- `public/assets/rotina-noite-r2.webp`: pulso em repouso, mesma linguagem de wearable.
- `public/assets/familia-cotidiano-r2.webp`: proximidade cotidiana com autonomia.
- `public/assets/ritmo-oi-r2.webp`: pose invertida com canal alfa.
- `public/assets/brand/icon-{movement,sleep,history,family,link}.svg`: ícones vetoriais próprios.

WebPs de cenas em 1200×900; pose invertida em 640×427 com alfa preservado. Os PNGs originais foram guardados localmente em `C:/Users/WIN11/Documents/Playground/caretwin-r2-artwork-sources/`, separados do bundle público. Os arquivos usados pela interface estão versionados na app. Prompts integrais: [PROMPTS-R2.md](PROMPTS-R2.md).

## Conferência

Build aprovado. Primeira rodada agrupada: 23 verificações funcionais aprovadas, axe sem violações nas vistas desktop/mobile, sem erros de runtime ou respostas inválidas. Conferidos 1440, 900, 390 e 320 CSS px, navegação por teclado, foco ao fechar o menu, movimento reduzido, ambas as perspectivas de família e biblioteca com downloads SVG. Capturas inspecionadas por seção em computador e celular. Detector executado uma vez: `[]`.

Não houve pesquisa com usuários nem certificação de acessibilidade. Esta revisão não altera o dashboard, APIs, banco, autenticação ou regras de negócio. A publicação deve ser conferida novamente na URL final após o push.

Rodada de confirmação: os mesmos 23 testes passaram novamente no build final. Conferência adicional da família confirmou abertura do recorte no scroll e recorte estático com movimento reduzido. Resultado estruturado em VERIFICACAO-R2.json.
