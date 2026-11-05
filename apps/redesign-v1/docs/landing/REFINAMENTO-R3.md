# Landing · refinamento r3

04/11/2026. Redesign v1 em desenvolvimento. Entrega exclusivamente local, conforme instrução mais recente do proprietário.

| Retorno | Decisão | Razão |
| --- | --- | --- |
| Fotografias não combinam com a landing | Retirar das seções e da biblioteca ativa | Preservar a linguagem ilustrada escolhida |
| Sol/lua eram uma boa ideia, com execução confusa | Composição nova: um único volume, uma base e troca clara de símbolo/cor | Clareza com menos elementos, sem voltar à cena orbital |
| Cada registro do histórico não tinha significado claro | Rótulos por dia e descrição “Cada peça representa um dia de registros” | Correspondência com a rotina; sem definir prazo de aprendizado |
| Animação profissional ao trocar abas | Manter o SVG montado; conectar os dias e destacar hoje com transformação contínua | Explicar relação e comparação, sem apenas substituir imagens |
| Remover legenda de representação e ícones superiores | Removidos exatamente desse trecho | Reduzir ruído e repetição |
| Não restaurar cadeiras, mas manter acabamento 3D | Criar imagem de pulseira azul e celular marfim | Vínculo com autonomia, com materiais compatíveis com a marca |
| Menu deve sumir ao descer e voltar ao subir | Direção de scroll com limiares, transição de 320 ms e proteção de foco/menu aberto | Liberar espaço sem perder acesso à navegação |
| Movimento no ícone dos botões | Seta sai e se recompõe no hover/foco, em 320 ms | Feedback direto, sem mover layout nem área de toque |

## Arquivos

- `src/landing/interaction.jsx`: menu e seta compartilhada.
- `src/landing/routine-scene.jsx`: sol/lua geométricos e transição.
- `src/landing/sections-r2.jsx`: histórico persistente, nova arte de família e biblioteca.
- `public/assets/pulseira-familia-r3.webp`: nova imagem com alfa, 1200 × 800, aproximadamente 82 KiB.
- [PROMPTS-R3.md](PROMPTS-R3.md): origem, processo e prompt integral da imagem nativa.

## Conferência

Build aprovado. Os fluxos de dia/noite, histórico, menu, setas, teclado, movimento reduzido e larguras de 320, 390, 900 e 1440 px foram verificados; 23 verificações passaram na confirmação, sem erros de execução, recursos inválidos ou violações detectadas pelo axe em desktop/mobile. Detector uma vez: `[]`. A arte de dispositivos substituiu a composição provisória das cadeiras e o estudo de elos após novas orientações do proprietário; o carregamento, as abas e a leitura da nova arte foram conferidos separadamente em computador e celular. Sem pesquisa com usuários ou certificação de acessibilidade.

Nenhum backend, autenticação ou lógica de produto foi alterado. Sem novo commit/push/deploy nesta revisão.
