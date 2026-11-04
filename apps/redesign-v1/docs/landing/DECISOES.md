# Decisões da landing v3

**Avaliação do proprietário em 03/11/2026:** aprovou a direção como base e informou que fará alterações. Preservar esta versão para comparação e incorporar ajustes sem reabrir a identidade por iniciativa do assistente. A aprovação visual não equivale a aprovação de publicação, validação com usuários ou autorização para novas funcionalidades. Sequência recomendada: refinamento da landing, consolidação do sistema compartilhado e aplicação gradual no projeto existente.

## Autoridade e limite

O proprietário rejeitou os três estudos anteriores, editou a hero original e escolheu sua composição compacta: base branca, tipografia menor e Ritmo azul reclinado, de olhos fechados. Esta versão preserva esse ponto de partida e remove os quatro fragmentos de dashboard. AbacatePay é a âncora principal. Não foi autorizada uma nova identidade, votação entre caminhos ou substituição dos estudos preservados.

O resultado é uma landing React navegável local com biblioteca, assets e interações contidas de mouse/scroll. Não modifica app, backend, firmware ou Figma, nem publica. `/entrar` é uma demonstração explícita, sem autenticação real. O destino de login só poderá ser integrado ao produto em outro escopo.

## Conteúdo e composição

- Passos e sono estimado por movimento são apresentados com comparação ao próprio histórico; a comparação diurna respeita o mesmo horário.
- Pessoa idosa e familiar têm igual prioridade. Vínculo aprovado condiciona o acompanhamento; acesso usa conta existente.
- Não prometer clínica, diagnóstico, SOS, queda, push, metas universais, batimentos ou cadastro aberto.
- Hero apresenta a ideia; dia/noite explica os registros; histórico explica a referência pessoal; família aborda vínculo e autonomia; FAQ resolve limites antes do CTA final.
- Ritmo 3D fica na hero. O guia é 2D. Poltronas têm igual escala e espaço entre si para comunicar companhia sem vigilância. Tudo é conceitual.
- A linguagem do vidro fica concentrada na navegação; Phosphor sustenta os ícones. FAQ, Tabs e Sheet seguem composição shadcn/Radix adaptada a CSS próprio. Não há Tailwind como sistema visual da página.

## Referências consultadas

| Fonte | Evidência usada e limite |
| --- | --- |
| [AbacatePay](https://www.abacatepay.com/) e [/design](https://www.abacatepay.com/design) | Âncora de linguagem, densidade e acabamento. Sem cópia de logos ou assets. |
| [Nubank](https://nubank.com.br/) | Consulta de conteúdo; não registrar inspeção visual além do que foi observado. |
| [Minicurso NatDesigner](https://minicurso.natdesigner.com/) | Render e CSS consultados: fundos `rgb(10,16,36)` e `rgb(27,44,115)`, fonte Helvetica. A fonte não foi copiada; CareTwin usa Fustat local. |
| Motion: [useScroll](https://motion.dev/docs/react-use-scroll) e [useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) | Scroll e adaptação à preferência do usuário. |
| shadcn/ui Radix: [Accordion](https://ui.shadcn.com/docs/components/radix/accordion), [Tabs](https://ui.shadcn.com/docs/components/radix/tabs), [Sheet](https://ui.shadcn.com/docs/components/radix/sheet) | Composições adaptadas para o projeto. |
| [React Bits Tilted Card](https://reactbits.dev/components/tilted-card) | Consulta de interação. Componente não importado. |

## Método e rastreabilidade

Foram pesquisadas/lidas instruções de [frontend-design da Anthropic](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md) e, por agente, copywriting e product-marketing do repositório de [Corey Haines](https://github.com/coreyhaines31/marketingskills). Também foram lidas as skills locais sites-com-identidade, impeccable, design-taste-frontend, find-skills e imagegen. Isso registra consulta de método, não instalação de pacotes de skills.

`PROMPTS.json` guarda os parâmetros exatos da geração. Os PNGs originais permanecem disponíveis; WebPs são derivados de uso na landing. Seis SVGs originais complementam a biblioteca em `/marca`. `DESIGN.md` registra somente o sistema vigente como proposta, sem promover aprovação da hero a validação da identidade inteira.

## Estado da revisão final — 03/11/2026

Build passou e uma execução do detector registrou `[]`. A primeira verificação apontou nove nós de contraste. Corrigidos textos auxiliares, abas inativas e rodapé; a segunda execução do axe registrou zero violações automáticas na landing desktop/mobile, mantendo itens `incomplete` de contraste como limite de avaliação. Verificação em 1440/390/320 px sem overflow, imagens ausentes, âncoras quebradas ou erros de execução.

O histórico muda com scroll somente no desktop, onde há narrativa sticky. No celular, a pessoa seleciona a etapa; instrução ajustada. O rodapé usa SVG Phosphor no lugar da seta Unicode. Capturas de menu e biblioteca foram refeitas após estabilização da animação. Teste específico confirmou tilt com mouse, três etapas de scroll e estabilidade móvel. Com movimento reduzido, sem inclinação/parallax e sem sticky.

Revisão independente encerrada com **disposition: ship**: quatro achados `resolved`, nenhum material aberto. Evidências em `REVIEW.md`, `verification.json`, `motion-verification.json` e `screenshots/`. Continua sendo proposta para avaliação do proprietário, sem testes com usuários ou resultado de conversão comprovado. A página está disponível apenas como prévia local; nenhum deploy ocorreu.

Fonte local confirmada como TrueType; extensão e declaração CSS foram ajustadas para `.ttf`, sem alterar os dados. A licença oficial Fustat SIL OFL 1.1 está em `public/assets/OFL-Fustat.txt`. Este registro não transforma a prévia em publicação autorizada.
