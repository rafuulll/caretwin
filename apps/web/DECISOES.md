# Decisões do apps/web

Cada item diz o que foi decidido e por quê, para quem for mexer depois não precisar adivinhar.

## Base

- **Next.js 16 + React 19 + Tailwind 4 + TypeScript**, criado do zero. O plano inicial do repositório falava em React + Vite; a troca foi decidida pelo Rafael. O Next dá rotas por pasta, pré-renderização das páginas (abre rápido mesmo em celular simples) e deploy direto na Vercel com Root Directory `apps/web`.
- Navegação instantânea ligada (`cacheComponents` e `partialPrefetching`): trocar de aba no app não mostra tela branca.
- Dependências mínimas: `lucide-react` (ícones), `zod` (validação dos formulários) e `driver.js` (tour da primeira visita, carregado só quando precisa). Nenhuma biblioteca de gráfico: os gráficos são SVG feitos à mão, para ficarem leves e acessíveis.
- Sem n8n, Neon e Storybook, que estavam no andaime sugerido pela ferramenta de prompt. O projeto já tem API FastAPI e Supabase, e essas peças não somariam nada à entrega.

## Sistema de design

Gerado pela skill **ui-ux-pro-max** para "cuidado de idosos" (arquivo original em `design-system/caretwin/MASTER.md`), com variância 3, movimento 3 e densidade 3: calmo, centrado e espaçoso.

- Estilo Minimalism & Swiss. Azul calmo `#0369A1` como primária e verde `#16A34A` com texto preto nos botões de ação (o contraste do verde com texto branco não passa no AA).
- Fonte **Atkinson Hyperlegible**, feita para baixa visão, servida pelo próprio app (`src/app/fonts`, licença OFL) para funcionar offline e sem depender do Google Fonts.
- Texto base de 17 px e 19 px no modo de texto grande. Alvos de toque de no mínimo 44 px, 48 px nos botões normais.

Adaptações em relação ao MASTER.md da skill:
- Tema escuro derivado à mão, com cada par de cor conferido no contraste (a skill só gera o claro).
- Cores de estado (bom, atenção, informação) acrescentadas, sempre com ícone e texto junto, nunca só a cor.
- Tokens com nomes em português (`--ct-primaria`, `--ct-tinta`...) para combinar com o resto do código.
- Fonte local em vez do `@import` do Google Fonts.

## Telas

- **Uma tela por momento do dia**: Hoje (olhar rápido de manhã), Sono, Batimentos (medir quando quiser), Alertas (ler com calma no fim do dia) e Ajustes.
- **Menu inferior no celular** e lateral no computador, em vez de gaveta: as cinco opções ficam sempre à vista, o que é mais fácil para pessoas idosas.
- **"Ajustes" em vez de "Configurações"**: a palavra longa quebrava no menu inferior em telas de 360 px.
- Hoje compara os passos com o **normal até este horário**, não com o total do dia, para não assustar ninguém às 9 da manhã.
- Alerta nunca é vermelho: usa o tom de atenção (âmbar), com o tamanho do desvio escrito ("29% abaixo da faixa de costume"). O vermelho fica só para ações que apagam algo.
- O seletor de pessoa fica na barra superior, porque quem cuida costuma acompanhar mais de uma pessoa.

## Gráficos

Seguem as regras de visualização de dados: uma série só, linha de 2 px, marcadores com anel, grade fina, rótulo direto só quando cabe, faixa do normal em lavagem clara. Cada gráfico tem uma tabela equivalente ("Ver os números em tabela") e pode ser lido com as setas do teclado, com o valor anunciado para leitor de tela.

## Site

- Abertura com o texto à esquerda e uma prévia do app à direita (no celular, a prévia vai para baixo).
- Fundo com ondas de pulso bem leves, que param quando a seção sai da tela, quando a aba fica escondida e quando a pessoa pede menos movimento no sistema.
- Uma animação por intenção: chegada suave dos cartões (360 ms), ondas do fundo e o progresso da medição. Nada pisca nem chama atenção sozinho.

## Dados e privacidade

- Nesta versão nada sai do navegador. A senha digitada na entrada é lida e descartada na hora, nunca guardada (comentário em `components/auth/formulario-entrada.tsx`).
- Cabeçalhos de segurança em `next.config.ts` (sem iframe de outros sites, sem farejar tipo de arquivo, sem câmera, microfone ou localização).
- A área do app pede aos buscadores para não indexar (`robots: noindex`).

## Textos

- Todo texto fica em `src/content`. Linguagem simples, sem jargão médico, neutra em gênero quando fala de quem usa ("Quem acompanha: Marina").
- O app nunca diagnostica: avisa o que mudou em relação ao normal da pessoa e sugere conversar, e lembra que a medição não substitui aparelho médico.
- Os resumos escritos usam os números reais do dia em modelos de texto variados (`content/ia.ts`) até a IA local (Ollama) estar ligada pela API.
