# CareTwin · direção vigente da landing

Atualização de 04/11/2026. **Redesign v1, refinamento r2, ainda em desenvolvimento.** Este documento substitui a composição orbital e as cadeiras da primeira publicação. O registro das decisões está em [REFINAMENTO-R2.md](REFINAMENTO-R2.md).

## Autoridade visual

Preservar a hero escolhida pelo proprietário, com Fustat, branco, azul e Ritmo reclinado. AbacatePay orienta acabamento e clareza de produto; o fechamento segue a referência de Figma fornecida pelo proprietário, com Ritmo invertido em fundo azul claro. Não copiar marca ou recursos financeiros das referências.

As alterações foram pedidas sobre screenshots específicos: retirar riscos/ondas sobre títulos, substituir cenas orbitais de dia/noite, esclarecer o histórico, trocar cadeiras por contexto humano, aproximar a nota de vínculo e simplificar o fechamento.

## Tokens

| Papel | Valor |
| --- | --- |
| Texto principal | `#14233d` |
| Texto de apoio | `#586b87` |
| Ação / seleção | `#2549d8` |
| Azul profundo de apoio | `#141d52` |
| Fundo dia/noite | `#f4f7fc` |
| Fundo família | `#f1f5ff` |
| Fundo fechamento | `#edf3ff` |
| Divisórias | `#dce4f1` |
| Superfície | `#ffffff` |

Fustat local, pesos 400–800, licença OFL preservada. Corpo 18 px; descrições de conteúdo 16–17 px; títulos de capítulo em torno de 42–50 px; hero 60 px, chegando a 64 px em telas amplas. No celular, títulos usam escala de 29–41 px conforme função; hero 36–55 px. Tracking mínimo -0,04em.

Contêiner máximo 1120 px. Margens 48 px em desktop, 32 px em larguras intermediárias, 20 px no celular e 16 px abaixo de 360 px. Imagens e diagramas com raio de 16 px, reduzido a 14 px em cenas móveis. Botões de 12 px; abas e navegação em cápsulas. Alvos principais de 44 px ou mais; CTA de 52 px no desktop.

## Composição

- **Hero:** copy, Ritmo e CTA aprovados; sem círculo ou sublinhado na palavra ritmo.
- **Dia/noite:** título e abas centralizados; texto e fotografia editorial em duas colunas; cena troca com a aba. No celular, texto precede a cena. Sem ícones flutuantes, órbitas ou etiquetas inclinadas.
- **Histórico:** título e tese; três etapas horizontais Registrar, Conhecer, Comparar; uma explicação e um diagrama por vez. Ritmo como guia abaixo da explicação. Sem calendário orbital, datas fixas, métricas inventadas ou mudança automática de etapa por scroll.
- **Família:** fotografia editorial e conteúdo com abas Para quem usa / Para a família. Nota de vínculo próxima ao painel de texto, sem altura mínima excessiva. No celular, imagem antes do conteúdo.
- **FAQ:** perguntas e divisórias aprovadas, sem onda decorativa.
- **Fechamento:** azul claro, Ritmo invertido pequeno, título, descrição, CTA e ajuda por âncora. Sem ornamentos nos cantos.
- **Rodapé:** branco, compacto, com identificação do protótipo e divulgação do uso de imagens geradas por IA.

## Ícones e assets

Cinco símbolos SVG próprios em `public/assets/brand/icon-*.svg`: movimento, sono, histórico, família e vínculo. Geometria vetorial de 32 unidades, traço arredondado de 1,8, azul e preenchimento leve. Ícones aparecem com rótulos; os dos controles continuam Phosphor. Os SVGs são acessíveis como elementos decorativos quando o texto já oferece o significado.

Três cenas editoriais sintéticas substituem props abstratos. A pulseira é conceitual e aparece com display sem medições. As legendas esclarecem que as pessoas são ilustrativas. Ritmo mantém anatomia azul, onda clara e peito sem listras. O recorte invertido preserva transparência.

## Movimento

Hero responde suavemente ao ponteiro preciso. As fotos de dia/noite usam crossfade de 350 ms e reenquadramento discreto; o diagrama anima apenas a mudança de etapa. O recorte da foto de família abre de 3% para 0% ao entrar na área visível, sem ocultar o conteúdo. Movimento reduzido usa estados estáticos completos. Nenhum conteúdo exige hover, scroll capturado ou animação para ser entendido.

## Escopo técnico

React/Vite multipage; landing e painel têm folhas CSS separadas. Fontes, cenas e ícones são locais. Radix mantém semântica, teclado e estados de Accordion, Tabs e Sheet. A biblioteca em `/marca` expõe personagem, cenas e cinco downloads SVG. Dashboard e aplicativo original não fazem parte deste refinamento.
