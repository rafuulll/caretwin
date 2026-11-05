# CareTwin — visão geral, refinamento r2

04/11/2026. Entrega local em `/painel/`. Aprovado iniciar pela visão geral e corrigir antes a piscada dos títulos da landing. Não publicar.

## Problemas e decisões

| Problema observado | Heurística | Decisão e motivo |
| --- | --- | --- |
| Banner explicativo disputava a primeira leitura com os registros | Design minimalista / reconhecimento | Passos, sono e pulseira compõem o resumo. Ritmo passa para uma faixa educativa após o histórico; o dado vem antes da explicação. |
| Colunas do resumo e do histórico não se alinhavam | Consistência | As duas linhas usam as mesmas proporções; em larguras menores o conteúdo empilha sem comprimir os valores. |
| Logo do painel usava ícone e peso diferentes da landing | Consistência | Manter somente CareTwin em Fustat, pesos 500/600, ponto azul com posição óptica proporcional. Estudos de logo continuam arquivados. |
| Sono e sincronização tinham pouca prioridade visual | Visibilidade do estado | Resumos independentes com origem do sono, vínculo, bateria e horário explícitos. Sem inferir dados novos. |
| Seleção de período e métrica pouco conectada à troca | Feedback / consistência | Controles compartilhados com seleção deslizante de 200ms, estado aria-pressed e grupo nomeado. Sem navegação, foco forçado ou deslocamento da página. Movimento reduzido usa troca imediata. |
| Dados auxiliares pequenos e diferença de leitura entre cartões | Reconhecimento | Escala de legendas e informações ampliada, algarismos tabulares, gráfico mais alto e resumo selecionado mais claro. Tabela equivalente preservada. |
| Referência de hover podia apontar para linha ausente ao mudar para aprendizado | Prevenção de erros | Validar índice e limpar hover ao mudar pessoa, período, métrica, privacidade ou aprendizado. Nenhuma regra de dados mudou. |
| Dia selecionado podia ficar fora do gráfico após mudar a largura | Controle / visibilidade | Recentralizar apenas a rolagem interna do gráfico em resize e após carregar a fonte; preservar o scroll da página. |
| Texto auxiliar dos passos quebrava mal no celular | Legibilidade | Em telas compactas, valor e horário ficam em linhas separadas e estáveis. |

## Preservado

Cenário sintético de 2 nov. 2026 às 15:30; pessoas e valores existentes. Hoje parcial permanece separado dos dias completos; faixa pessoal não é meta. Sono continua descrito como estimativa por movimento. Sem diagnóstico, batimentos integrados, SOS ou funções inventadas. Leitura compartilhada continua simulada e reversível. Backend, API, autenticação e aplicativo Next.js não foram alterados.

## Landing: correção pontual

Os títulos estavam visíveis antes de `useInView` ativar a animação. A máscara agora recebe o deslocamento inicial já na regra-base `.heading-word-inner`. Ao entrar na viewport, a animação parte do mesmo estado e termina em zero; não ocorre o ciclo visível → oculto → visível. A regra de movimento reduzido continua exibindo o conteúdo estático, sem transformação. FAQ sticky e demais interações preservados.

## Skills e referências

Continuidade do briefing com **sites-com-identidade** e refinamento com **Impeccable**, playbooks polish/operate e craft-floor. Referências já aprovadas: Fingoals para composição e a landing CareTwin para identidade. Esta rodada não abriu nova direção visual, não gerou imagens e não precisou de biblioteca adicional. Motion, Radix e Phosphor existentes foram reutilizados.

## Escopo da revisão

Visão geral refinada e controles compartilhados do gráfico. Passos, Sono, Mudanças, Família e Preferências permanecem funcionais; sua revisão visual detalhada fica para as próximas etapas. Estado da prévia reinicia ao recarregar. Sem commit, push ou deploy.

Resultados: `VERIFICACAO-R2.json` e `LANDING-ANIMACAO-R2.json`. Capturas antes/depois no workspace `C:/Users/WIN11/Documents/Playground/caretwin-panel-r2-review/`. As verificações técnicas não substituem avaliação com idosos e familiares.


## Resultado da verificação

Build concluído. 14 checagens funcionais aprovadas; console sem erros. Axe não encontrou violações automáticas nas páginas desktop e móvel avaliadas. Sem transbordamento horizontal em 1440, 900, 390 e 320px, incluindo texto ampliado. Imagens de desktop, tablet, celular e texto ampliado inspecionadas em duas rodadas limitadas; corrigidos a quebra do horário e o enquadramento do último dia no resize. O gráfico de 14 dias continua com rolagem interna e tabela equivalente.

Landing em 1440 e 390px: 70/71 quadros amostrados, deslocamento inicial presente antes do gatilho, movimento monotônico até zero e conteúdo estático visível com movimento reduzido. Não houve ciclo visível→oculto no teste.
