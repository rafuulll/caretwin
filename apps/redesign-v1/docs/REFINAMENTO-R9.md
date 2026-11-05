# Refinamento de filtros, navegação e transição — r9

04/11/2026. Solicitações do proprietário aplicadas localmente, sem publicação.

- Histórico mobile: título e período usam duas colunas estáveis. Trocar entre Passos e Sono não desloca o seletor de 7/14 dias para outra linha. O título pode quebrar dentro de sua própria coluna quando a largura exige.
- Navegação desktop: removida a área de rolagem independente. Em janelas mais baixas, o texto educativo repetido é resumido ao acesso à ajuda, com todos os links e alvos de pelo menos 44 px preservados. Em alturas de até 650 px, a lateral acompanha o fluxo do documento para manter os acessos alcançáveis.
- Números dos detalhes e leituras do histórico usam algarismos proporcionais, como o resumo. Isso corrige o espaço do ponto em “3.800”; legenda com espaçamento normal.
- Retirados da interface os avisos de dados fictícios, versão de teste e demonstração, incluindo rodapés, detalhes, conta, tabela, preferências, títulos e descrições das páginas. Ferramentas de estados da prévia removidas da interface. Informações sobre estimativa do sono, comparação pessoal, vínculo e ausência de diagnóstico foram preservadas.
- Os dados continuam sendo os fixtures locais existentes. A remoção editorial dos avisos não conecta o protótipo a backend, contas ou dispositivos reais.
- Volta ao sol: a máscara circular parte do limite geométrico exato da esfera (aproximadamente 208,17 unidades), substituindo o raio excedente de 320. Ícones e máscara usam o mesmo valor animado, eliminando movimentos com relógios separados. A volta ao dia tem saída imediata com desaceleração; a entrada na noite mantém sua curva anterior. Duração de 680 ms, comportamento interrompível e movimento reduzido preservados.

Build aprovado. 27 verificações funcionais aprovadas; zero erros de JavaScript e zero violações nas quatro auditorias axe executadas (painel desktop, painel mobile, detalhe de passos e landing). Conferidos filtros em 320/375/390 px, lateral em 1440×900/1366×700/1024×650, número dos detalhes, retirada dos avisos nas seis telas e movimento quadro a quadro. Inspeção no Chrome local, sem teste em dispositivo físico. Evidência em `VERIFICACAO-R9.json`; capturas e roteiro no workspace `caretwin-details-r9`.

A primeira rodada mostrou que a curva anterior ainda demorava a produzir uma mudança perceptível no início da volta ao dia. A curva dessa direção foi corrigida; a confirmação final passou.
