# Rolagem e redução de repetição — r10

04/11/2026. Ajustes locais; sem publicação.

- Landing: rolagem suave com Lenis 1.3.27 (MIT) para mouse/trackpad de precisão. Touch preserva a rolagem nativa. Movimento reduzido desativa o controlador, inclusive quando a preferência muda com a página aberta. Âncoras mantêm hash e afastamento do menu; abas continuam mudando apenas o conteúdo. Bloqueio de rolagem de diálogos é preservado.
- Painel: removidos “Dias completos · faixa pessoal 4.800–7.200”, “Estimativa por movimento” na leitura selecionada e “Faixa de dias completos: 4.800–7.200”. Mantidos os dados, gráfico, indicação de aprendizado, tabela e explicações contextuais já existentes.
- Removido “Entenda o painel” do rodapé direito. A ajuda da lateral permanece funcional; o contexto com Ritmo permanece no conteúdo.
- Ambiente visual: somente pesquisa e planejamento. A proposta [landing/PLANO-AMBIENTE-R10.md](landing/PLANO-AMBIENTE-R10.md) prioriza a seção do iPhone, conforme o último direcionamento. Nenhuma mudança visual de fundo ou novo asset foi aplicada.

Build e 18 verificações funcionais aprovados, sem erros de JavaScript: rolagem progressiva, âncoras, abas sem salto, preferência de movimento em tempo real, quatro vistas do painel, ajuda preservada, comportamento touch, menu mobile e ausência de overflow móvel. Evidência em `VERIFICACAO-R10.json`, capturas no workspace `caretwin-details-r10`. Verificação em Chrome local; sem teste em aparelho físico.
