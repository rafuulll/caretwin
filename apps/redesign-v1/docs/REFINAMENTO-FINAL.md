# CareTwin — refinamento de produto e movimento

04/11/2026. Prévia local, com dados sintéticos. Preservar Fustat, branco, azul CareTwin, Ritmo e a composição aprovada. Este refinamento não substitui o aplicativo original.

## Intenção

Painel em modo Operate: reconhecer a pessoa, entender os registros e explorar os dias sem esforço. Landing em modo Persuade: explicar como o cotidiano forma uma referência pessoal. A qualidade vem da continuidade e da clareza, sem acrescentar etapas ou promessas.

## Plano de movimento

- Momento principal da landing: os registros se conectam em histórico e o dia atual encontra esse contexto. Sequência finita, acionada pela pessoa, com conexão e deslocamento coordenados; sem troca automática de abas.
- Dia/noite: transformação do mesmo volume, com revelação da superfície noturna e transição dos símbolos. Texto e cena permanecem no mesmo lugar.
- Continuidade: indicador de aba compartilhado, painéis de texto com espaço reservado e abertura/fechamento coerentes no FAQ e nas ajudas.
- Feedback no painel: leitura do gráfico acompanha o dia apontado; setas e teclado permitem escolher dias; privacidade é imediata, sem animar números sensíveis. Confirmações e recuperação de erro são curtas.
- Orçamento: Motion/Radix já instalados; sem biblioteca adicional, shader, vídeo ou renderização 3D contínua. Movimento não bloqueia controles. Preferência de movimento reduzido remove deslocamentos, máscaras e sequências.

## Princípios de referência

| Fonte | Princípio adaptado |
| --- | --- |
| [Artigo Bold fornecido pelo proprietário](https://lp.boldschool.com.br/viral/ferramentas-referencia-de-ui) | Examinar interação, tempo, espera e erro. O link não abriu na pesquisa; o texto integral colado no chat foi a fonte. |
| [NN/G — 10 heurísticas](https://www.nngroup.com/articles/ten-usability-heuristics/) | Estado visível, controle da pessoa, consistência, reconhecimento, prevenção e recuperação. |
| [NN/G — função do movimento](https://www.nngroup.com/articles/animation-purpose-ux/) | Movimento comunica causa, relação e mudança de estado. Evitar competição de animações. |
| [NN/G — tempos de resposta](https://www.nngroup.com/articles/response-times-3-important-limits/) | Responder imediatamente às ações; não introduzir espera para exibir efeitos. |
| [Bencho — gráfico](https://bencho.dev/blocks/price-chart), [privacidade](https://bencho.dev/blocks/private-balance), [FAQ](https://bencho.dev/blocks/faq-accordion) | Leitura contextual e mudança de estado no lugar. Não copiar números, estilos ou código. |
| [21st](https://21st.dev/), [Kobra](https://kobra.systems/), [ObsidianUI](https://www.obsidianui.dev/) | Catálogo de padrões de abas, navegação e feedback; selecionar conforme a tarefa, sem importar pacotes por aparência. Limites de acesso registrados na entrega de verificação. |

## Skills

sites-com-identidade: preservar decisões aprovadas e fechar o percurso. Impeccable (polish/animate/operate): acabamento, hierarquia e movimento com função. UI/UX Pro Max: regras pontuais de toque, reflow e movimento. Find Skills: seleção de fonte reputada. [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines): semântica, teclado, foco e estados. [Ponytail](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md): reaproveitar o código e as dependências existentes, com alterações completas e proporcionais. Skills consultadas; nenhum pacote global instalado.

## Limites

Revisão de especialista e checagem técnica não substituem teste com idosos e familiares. Não há evidência de ganho de conversão, avaliação clínica ou certificação de acessibilidade. Publicação não faz parte desta etapa.

## Implementado

- Estrutura branca ocupa a janela: removidos fundo/margens/moldura externos. Conteúdo permanece cinza suave e cartões brancos. Cabeçalho e navegação lateral acompanham a rolagem no desktop; navegação inferior continua no celular.
- A indicação de dados fictícios permanece no rodapé do conteúdo. Os controles de cenários foram agrupados em “Testar estados da prévia”, em vez de ocupar uma faixa acima da marca.
- Gráfico com marcador compartilhado do dia apontado/selecionado, botões Dia anterior/Próximo dia e uma única parada de Tab. Setas, Home e End selecionam e mantêm o dia visível pela rolagem interna; períodos e tabela equivalente preservados.
- Atalho de ocultar valores também disponível no cabeçalho móvel, com estado acessível. Ocultação imediata; não anima dados intermediários.
- Abertura/fechamento das ajudas, confirmação, press e setas receberam tempos coerentes. Tentativa de atualização anuncia progresso e preserva os últimos registros.
- Landing: noite revelada por máscara circular no mesmo volume; símbolo acompanha a mudança. Histórico recebe indicador compartilhado, entrada encadeada dos dias e um traço finito que liga a referência a hoje. A seleção continua manual.
- Textos de dia/noite, histórico e família alternam em espaço reservado. Abas não alteram o scroll. FAQ recebeu affordance +/− e transição do conteúdo; título sticky preservado. Menu indica a seção atual.

## Heurísticas aplicadas

| Heurística de Nielsen | Decisão verificável |
| --- | --- |
| 1. Visibilidade do estado | Dia selecionado, período, pessoa, origem e sincronização visíveis; retry com progresso. |
| 2. Correspondência com o mundo real | Passos, noite encerrada, costume e vínculo; sem pontuação clínica ou jargão financeiro. |
| 3. Controle e liberdade | Leitura com Desfazer, Escape nas ajudas, seleção manual, Voltar/Avançar nativos. |
| 4. Consistência e padrões | Mesma tipografia, família de ícones, controles e tempos nas telas; links reais para navegação. |
| 5. Prevenção de erros | Limites nas setas de dia, faixa ausente no aprendizado e distinção entre hoje parcial e dias completos. |
| 6. Reconhecimento | Datas, números e rótulos próximos; ajuda no contexto; seletor de pessoa mantém identificação. |
| 7. Flexibilidade e eficiência | Mouse, toque, botões, setas do teclado, Home/End; texto maior e atalho móvel de privacidade. |
| 8. Estética e minimalismo | Retirada da moldura e da faixa superior de teste; sem novas seções promocionais ou animação contínua nos dados. |
| 9. Recuperação de erros | Explicação da falha, dados anteriores preservados e Tentar novamente. |
| 10. Ajuda e documentação | FAQ, origem da estimativa e explicação da faixa pessoal acessíveis no contexto. |

## Pesquisa de componentes e licença

21st, Kobra e ObsidianUI foram abertos no Chrome para observar os catálogos e padrões de navegação/seleção. Kobra mostrou a prévia de abas e oferta Pro; nenhum código pago foi acessado. As URLs específicas do Bencho abriram o catálogo nesta sessão, limitando a inspeção das demos individuais. Nenhum componente dessas bibliotecas foi copiado ou instalado; a implementação é própria sobre as dependências existentes. Não houve aceite de termos, compra ou instalação de plugin.

## Evidência

33 verificações funcionais passaram, incluindo a confirmação dos ajustes. Axe não apontou violações nas seis áreas do painel e na landing em 1440 e 375 px (14 capturas/auditorias). Nenhum erro de JavaScript; nenhum overflow horizontal nas telas avaliadas. Texto ampliado revisado em 320 px, tablet e paisagem; teclado, estados vazio/aprendizado/erro, privacidade, navegação, ajuda, Desfazer e movimento reduzido exercitados. Detalhes em [VERIFICACAO-FINAL.json](VERIFICACAO-FINAL.json).

Capturas e scripts de revisão ficam no workspace `C:/Users/WIN11/Documents/Playground/caretwin-refinamento-final/`. A captura longa precisa percorrer a landing primeiro para disparar revelações e carregar imagens sob demanda; a página real foi exercitada por seção.

Confirmação: traço de comparação amostrado quadro a quadro (movimento real, finito), troca dia/noite interrompida no meio, todas as imagens carregadas após percorrer a página e todas as revelações de título completas. Moldura ausente em 1440, 1200, 900, 375 e 320 px. Build aprovado; detector Impeccable sem achados. Nenhuma nova dependência. Testes em Chrome local; não houve teste presencial com o público nem em aparelhos físicos.


Atualização posterior r6 — 04/11/2026: amanhecer com opacidade, traço sobre a geometria completa e iPhone frontal com o painel. Registro vigente desses três ajustes e 12 verificações específicas em [landing/REFINAMENTO-R6.md](landing/REFINAMENTO-R6.md).
