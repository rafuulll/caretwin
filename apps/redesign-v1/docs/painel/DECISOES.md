# CareTwin — decisões de UX do painel v1

Decisões do estudo local, em 03/11/2026. Público: pessoa idosa que usa a pulseira e familiar com vínculo aprovado, com o mesmo peso no produto.

| Decisão | Racional de UX |
| --- | --- |
| Painel independente da landing | Permite avaliar o acompanhamento sem alterar a página em aprovação, backend, Figma ou produção. |
| Acabamento fintech aplicado à rotina | A composição Fingoals oferece hierarquia, contraste entre superfícies e leitura rápida. O conteúdo continua sendo rotina pessoal, sem metas financeiras ou recursos emprestados da referência. |
| Pessoa e instante explícitos | O seletor distingue “você” e “familiar”; data, horário e sincronização reduzem dúvidas sobre de quem são os registros e sua atualidade. A conta permanece a de Antônio ao acompanhar Maria. |
| Passos de hoje em destaque | O indicador responde à consulta mais imediata e informa “até 15:30”. A faixa de 3.166 a 4.750 usa o mesmo horário; o dia parcial não é comparado a um dia encerrado. |
| Histórico separado do dia atual | Dias completos até 1 nov. usam faixa de 4.800 a 7.200 passos. A mudança de 30 out., 31 out. e 1 nov. se apoia nesses três dias completos, evitando uma leitura de queda causada apenas pelo horário. |
| Faixa pessoal, sem meta universal | A comparação é com o costume da pessoa. Não há pontuação, competição, streak ou selo de saúde. A explicação fica disponível junto aos dados. |
| Sono descrito como estimativa | A origem por movimento acompanha a duração. O detalhe explica os limites sem prometer diagnóstico ou fases clínicas do sono. O gráfico de sono não inventa uma faixa pessoal nesta prévia. |
| Mudança com contexto antes da ação | O cartão apresenta datas, valores e faixa de referência; o detalhe explica o período. O tom convida a observar, sem tratar a mudança como emergência. |
| Leitura compartilhada, simulada e reversível | Antes da ação, a interface informa que toda a família verá a mudança como lida. O detalhe fecha após a ação para deixar a mensagem com “Desfazer” acessível; o retorno confirma a simulação. |
| Detalhes em painel lateral | Divulgação progressiva mantém a visão geral curta e permite explorar passos, sono, pulseira, conta e explicações sem perder o contexto. Escape fecha o painel e o foco volta ao controle de origem. |
| Gráfico com tabela e seleção | Valores podem ser consultados por foco, ponteiro ou seleção de barra. A tabela oferece leitura textual da mesma série. A rolagem interna centraliza o último dia ou a seleção e a dica “Deslize” torna o gesto reconhecível; legendas e alvos foram ampliados. |
| Estados demonstráveis | “Com dados”, “Em aprendizado”, “Sem registros” e “Falha ao atualizar” distinguem ausência de informação de zero. O aprendizado mostra dois dias completos e hoje como 3 de 8 dias, sem faixa inclusive nos detalhes. Família e Preferências permanecem disponíveis sem registros. A falha mantém os últimos dados e sua sincronização; tentar novamente é uma simulação. |
| Preferências de leitura | Ocultar valores e ampliar texto oferecem controle sobre exposição e legibilidade. A navegação móvel mantém acesso às quatro áreas principais. |
| Ritmo como guia pontual | O personagem aprovado aparece apenas no banner contextual e na ajuda. A lateral usa um bloco educativo claro sem mascote duplicado, preservando a prioridade dos registros. |

As heurísticas aplicadas são visibilidade do estado, correspondência com a linguagem da pessoa, consistência, reconhecimento, controle e prevenção de interpretações equivocadas. A revisão da prévia confirma o funcionamento nos cenários exercitados; a eficácia com o público ainda depende de avaliação com usuários.

## Confirmação de entrega — 03/11/2026

Decisão: **SHIP da prévia local independente**. Landing, backend, Figma e produção ficaram fora das alterações. O servidor persistente do painel na porta 4321 e a landing na porta 4320 responderam HTTP 200 na verificação de entrega; `INICIAR.ps1` e `serve.mjs` permitem reabrir a prévia pelo build local.

| Evidência | Resultado registrado |
| --- | --- |
| `qa-results.json` | 14 verificações aprovadas: métricas e períodos, tabela, troca de pessoa, leitura e desfazer, privacidade, aprendizado e seus detalhes, vazio, acesso a Família/Preferências, tentativa após falha, seleção móvel, menu/Escape e texto maior |
| Console | Sem erros registrados |
| Axe | Zero violações nas páginas desktop e móvel avaliadas |
| Largura do documento | Sem rolagem horizontal em 1440, 390 e 320 px; histórico com rolagem interna |
| Movimento reduzido | Verificado |
| Detector de revisão | Uma execução, retorno `[]` |
| Build | Concluído com aviso de chunk JavaScript de 505,73 kB, 154,61 kB gzip |

A aprovação se limita à prévia local e aos cenários exercitados. Não certifica desempenho de produção, conformidade integral de acessibilidade ou adequação clínica. Avaliação com usuários e auditoria manual completa de acessibilidade não foram realizadas.

## Limites assumidos

Todos os valores, vínculos e dispositivos são fictícios. A prévia usa estado React em memória; recarregar a página reinicia a sessão. Não há autenticação, persistência, integração com pulseira, envio de convite, notificação real ou alteração de permissão. O período inicial de aprendizado exibido é um exemplo, não uma regra clínica validada.

O escopo não inclui diagnóstico, SOS, detecção de queda, push, meta universal, streak, batimentos integrados ou novo cadastro. O estudo serve para revisar uma direção de interface, sem publicar ou modificar o produto em produção.
