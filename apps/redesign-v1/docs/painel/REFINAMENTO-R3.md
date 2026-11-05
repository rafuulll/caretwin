# CareTwin — Passos, Sono, Mudanças, Família e Preferências

04/11/2026. Etapas 2, 3 e 4 solicitadas pelo proprietário: refinar as telas restantes, simplificar o uso e revisar celular/acessibilidade. Entrega local, sem publicação. A visão geral r2 e a landing aprovada foram preservadas.

## Decisões de UX

| Problema | Heurística | Decisão |
| --- | --- | --- |
| Títulos poéticos dificultavam reconhecer a área | Correspondência / reconhecimento | Títulos diretos: Passos, Sono, Mudanças, Sua família e Preferências. A pessoa acompanhada permanece explícita nas áreas de registros. |
| Indicador ocupava a largura inteira sem aproveitar o espaço | Hierarquia / minimalismo | Resumo principal e explicação curta em duas colunas no desktop; fluxo vertical no celular. Histórico abaixo, usando a largura disponível. |
| Seletor de métrica repetia a navegação e podia mudar a tela ao explorar o histórico | Consistência / controle | Em Passos e Sono, a métrica é fixa. Permanecem período e tabela. A visão geral mantém a troca de métrica. |
| Histórico de sono usava linguagem de dias parciais | Correspondência | Noites encerradas na legenda, tabela e rodapé. Estimativa por movimento junto à duração; sem fases, pontuação ou avaliação clínica. |
| Explicação podia sugerir comparação pronta durante aprendizado | Visibilidade do estado | Texto específico: os registros ainda aparecem sem comparação. Faixa permanece ausente. |
| Mudança misturava registro e explicação genérica | Reconhecimento | Registro e datas em destaque, explicação do método ao lado; uma ação para abrir o detalhe. Leitura compartilhada e Desfazer preservados. |
| Família repetia cartões e exibia seletor de pessoa sem função nessa área | Minimalismo / prevenção de erro | Lista de participantes com vínculo, relação e link nomeado. Seletor de pessoa fica apenas nas áreas de registros. |
| Preferências e reinício tinham o mesmo destaque | Controle / minimalismo | Leitura e privacidade em grupos separados. Reinício fica em “Sobre esta prévia”, com explicação do efeito. |
| Reinício deixava texto ampliado e tabela ativos | Consistência | Restaurar todas as escolhas da demonstração e cancelar tentativa pendente; manter a confirmação visível. |
| Navegação não tinha links compartilháveis ou histórico do navegador | Controle / consistência | Links nativos e parâmetros view/person validados. Voltar, Avançar e recarregar preservam tela/pessoa; Ctrl/Cmd+clique mantém comportamento nativo. |
| Foco e alvos podiam competir com navegação fixa | Acessibilidade / controle | Alvos verificados de 44px, margem de scroll no celular, nomes distintos nos switches, detalhes com Escape e retorno de foco, fechamento do painel lateral disponível durante rolagem. |

## Movimento e visual

Fustat, assinatura CareTwin tipográfica, azul e superfícies existentes. Nenhuma imagem, fonte ou dependência adicionada. As cápsulas continuam com transição de 200ms; barras usam escala vertical com origem na base em 240ms, evitando animar altura/layout. Hover e switches usam transições curtas. Movimento reduzido mantém informação estática. A animação corrigida da landing permanece intacta.

## Pesquisa e skills aplicadas

- **sites-com-identidade**: continuidade do briefing e refinamento da direção aprovada.
- **Impeccable**: polish/operate e craft-floor para hierarquia, estados e revisão limitada em duas rodadas.
- **UI/UX Pro Max**: regras de teclado, toque, redução de movimento, carregamento e camadas. O ambiente não tinha Python; foram consultados o quick-reference, pro-rules e as entradas do CSV diretamente, sem alegar resultado do buscador Python ou gerar outro design system.
- **Web Design Guidelines**, da Vercel: [skill oficial](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) e [regras consultadas](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md). Aplicadas à navegação, foco, semântica, movimento, tabelas e controles. Lida pela fonte oficial, sem instalação global.
- **Ponytail** foi localizada a pedido do proprietário, mas seu uso foi adiado para o próximo pedido conforme instrução posterior. Não aplicada nesta finalização.

## Verificação

Build concluído; 25 verificações funcionais aprovadas. Console sem erros. Axe não encontrou violações automáticas nas seis áreas avaliadas em 1440px e 375px, nem na tabela de sono examinada depois. Os controles visíveis examinados atenderam à dimensão de 44px nas duas larguras. Sem rolagem horizontal da página nos cenários de 320px com texto maior, tablet 900px e paisagem 812×375px. Histórico de 14 dias mantém rolagem interna e tabela equivalente.

Foram exercitados: navegação e foco, períodos, barras por teclado, tabela, troca de pessoa, leitura/Desfazer, Escape, Família, Voltar/Avançar, recarregar, preferências, privacidade, aprendizado, vazio, tentativa após falha, menu móvel e reinício. Confirmados o foco acima da barra inferior e o switch visível após ampliar texto. Movimento reduzido verificado.

Evidência detalhada: [VERIFICACAO-R3.json](VERIFICACAO-R3.json). Capturas no workspace: `C:/Users/WIN11/Documents/Playground/caretwin-panel-r3-review/before/` e `after/`. Duas rodadas limitadas: revisão agrupada e confirmação das correções. Sem iterações cosméticas adicionais após os checks passarem.

## Limites

Prévia React/Vite com dados fictícios e estado em memória. URLs guardam tela/pessoa de demonstração; preferências e leitura não são persistidas. Não há autenticação, backend novo, API, integração real com a pulseira ou mudança nas regras do produto original. Tema claro revisado; não foi criado tema escuro. Testes em Chrome e auditoria automática não equivalem a certificação WCAG, teste com leitores de tela completos ou pesquisa com idosos/familiares. Avaliação com o público continua pendente. Sem commit, push ou deploy.

## Links locais

- `/painel/?view=steps`
- `/painel/?view=sleep`
- `/painel/?view=alerts`
- `/painel/?view=family`
- `/painel/?view=settings`
