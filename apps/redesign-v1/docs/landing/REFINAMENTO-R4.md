# Landing · refinamento r4

04/11/2026. Entrega local, sem novo commit, push ou deploy.

| Pedido | Solução |
| --- | --- |
| Setinha espremida na aba Comparar | Ligação inferior com curva e ponto final sob Hoje; aparece só nessa aba. Registrar e Conhecer mantêm a composição anterior. |
| Trocar celular por iPhone | Edição nativa da imagem aprovada, preservando a pulseira e a base. Novo asset `pulseira-iphone-r4.webp` com alfa. |
| Retirar faixa de texto no fim da hero | Faixa e divisória removidas. Seta central em uma curva branca contínua com a seção, com alvo de 48 × 48 px e âncora funcional. |
| Animação de títulos como na Julia | Palavras aparecem por máscara vertical de 850 ms, intervalo de 45 ms, na primeira entrada em viewport; sem trocar a Fustat. Aplicado aos títulos de capítulos e FAQ. |
| Troca suave nas abas dia/noite e família | Cápsula branca compartilhada entre posições, transição de 360 ms. Radix mantém papéis, foco e teclado. |
| Limpar fechamento e footer | Removidos a frase de IA, o link Assets da marca e a frase Primeira versão. A biblioteca continua acessível diretamente em `/marca`. A identificação acadêmica e a nota de prévia da hero continuam. |

## Referência observada

[Site da Julia Maschietto](https://julia-maschietto-estudio.classyscout131.chatgpt.site/) inspecionado no Chrome: o título “O trabalho aparece” usa palavras recortadas com movimento vertical de entrada, duração de 900 ms e intervalo de 45 ms. O DOM do título do FAQ usa a mesma estrutura de palavras; a animação desse título específico não disparou nas navegações diretas de teste. A adaptação no CareTwin foi verificada independentemente e dispara no scroll do FAQ.

## Movimento e acessibilidade

Títulos só animam uma vez por montagem. A troca de seleção não altera o texto nem move o alvo de toque. Movimento reduzido elimina a entrada das palavras e a interpolação das cápsulas. Menu por direção de scroll e feedback das setas aprovados em r3 preservados. Sem dependência nova, autoplay contínuo ou captura do scroll.

## Verificação

Build aprovado. 21 verificações locais passaram: âncora central, curva alinhada, deslocamento real das duas cápsulas, estágios do histórico, carregamento da imagem, entrada das palavras no FAQ, abertura das perguntas, teclado, movimento reduzido, remoções de copy e larguras de 320, 390, 900 e 1440 px. Axe sem violações detectadas em desktop e mobile; sem erros de execução ou recursos com falha. Detector uma vez: `[]`. Capturas de computador e celular inspecionadas em conjunto. Resultado em `VERIFICACAO-R4.json`. Sem certificação ou pesquisa com usuários.

Origem e prompt da edição: [PROMPTS-R4.md](PROMPTS-R4.md).
