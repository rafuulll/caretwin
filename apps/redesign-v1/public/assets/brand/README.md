# Marcações geométricas CareTwin

Seis SVGs originais para apoiar a linguagem da landing page. São abstrações decorativas, com pequenas assimetrias de traço; não representam personagens, símbolos clínicos ou um novo logotipo.

Todos têm fundo transparente, `viewBox`, `<title>` e geometria independente de fontes. Os traços usam largura 3, pontas e junções arredondadas. A paleta é azul `#2549D8` e azul claro `#AFC2FF`. Não há filtros, turbulência, gradientes, scripts ou recursos externos.

| Arquivo | viewBox | Uso sugerido |
| --- | --- | --- |
| `circle-note.svg` | `0 0 320 112` | Contornar uma palavra ou frase curta. Posicionar atrás do texto com margem interna; o texto continua em HTML. |
| `underline-wave.svg` | `0 0 320 44` | Sublinhar uma expressão breve ou acompanhar um título. |
| `wave-line.svg` | `0 0 600 96` | Separar capítulos ou criar um intervalo visual de baixa intensidade. |
| `day-path.svg` | `0 0 480 160` | Sugerir a passagem do dia com uma linha e três pontos, sem escalas ou números. |
| `twin-orbit.svg` | `0 0 320 160` | Apoiar uma mensagem sobre vínculo e proximidade com dois arcos conectados. |
| `burst-small.svg` | `0 0 72 72` | Destacar discretamente um detalhe com quatro traços curtos. |

## Consumo e acessibilidade

Os assets são decorativos: ao inserir inline, usar `aria-hidden="true"` e `focusable="false"` no elemento `svg`. Com `img`, usar `alt=""` e `aria-hidden="true"`. O `<title>` do arquivo ajuda na identificação isolada e não transforma a decoração em conteúdo essencial.

Preservar a proporção do `viewBox`; evitar esticar os desenhos em apenas um eixo. A largura 3 acompanha a escala do SVG. Usar uma marcação por composição e não colocar traços sobre letras, controles ou indicadores de foco.

## Cor e contraste

O azul `#2549D8` é a cor principal de traço sobre branco. O azul claro `#AFC2FF` é um acento decorativo de menor contraste, presente em `day-path.svg` e `twin-orbit.svg`; não deve carregar sozinho estados, instruções ou informação necessária.

Este conjunto não certifica conformidade AA. Conferir contraste no tamanho e fundo reais de uso, especialmente se as cores, opacidade ou espessura forem alteradas. Textos e controles precisam de verificação própria; as marcações não substituem seus rótulos.
