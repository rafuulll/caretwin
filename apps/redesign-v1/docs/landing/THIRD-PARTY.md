# Origens e licenças

Registro desta landing local. Os componentes e pacotes conservam suas próprias licenças; este arquivo não substitui os avisos distribuídos pelos autores. Versões instaladas estão fixadas no `package-lock.json`.

| Recurso | Uso e licença observada |
| --- | --- |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Referência de composição para Button, Accordion, Tabs e Sheet; código adaptado a CSS CareTwin e ícones Phosphor. Fonte shadcn/ui sob MIT, copyright (c) 2023 shadcn. |
| [Radix Primitives](https://www.radix-ui.com/primitives) | Accordion, Dialog/Sheet, Tabs e Slot. MIT; copyright (c) 2022 WorkOS. |
| [Phosphor Icons](https://phosphoricons.com/) | Ícones via `@phosphor-icons/react`. MIT; copyright (c) 2020 Phosphor Icons. |
| [Motion](https://motion.dev/) | Scroll, transformações e preferência de movimento reduzido. MIT; copyright (c) 2024 Motion B.V. |
| React / React DOM | Runtime; MIT. |
| Vite / plugin React | Desenvolvimento e build; MIT. |
| clsx / tailwind-merge | Dependências declaradas; MIT. |
| class-variance-authority | Dependência declarada; Apache-2.0. |
| axe-core | Verificação de acessibilidade em desenvolvimento; MPL-2.0. |
| [Fustat / Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/fustat/OFL.txt) | TrueType local (`fustat-0.ttf` a `fustat-4.ttf`), pesos 400–800. SIL Open Font License 1.1; copyright 2024 The Fustat Project Authors. Licença completa incluída em `public/assets/OFL-Fustat.txt`. |

Os avisos originais dos pacotes instalados estão em seus arquivos `LICENSE`/`LICENSE.md` em `node_modules/`. Ao preparar um pacote de distribuição, preservar os avisos exigidos para o código efetivamente incluído.

## Aviso MIT dos componentes e ícones adaptados

Aplicável aos materiais MIT descritos acima, com os respectivos avisos de copyright. Texto da licença:

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Referências visuais e materiais próprios

[AbacatePay](https://www.abacatepay.com/) e [seu design](https://www.abacatepay.com/design), [Nubank](https://nubank.com.br/) e [NatDesigner](https://minicurso.natdesigner.com/) foram consultados como referências. Não foram incorporados logos, imagens, CSS ou fontes dessas marcas. A consulta ao [Tilted Card do React Bits](https://reactbits.dev/components/tilted-card) não resultou em importação do componente.

Os três PNGs da primeira versão foram gerados por IA para este estudo, usando as referências de Ritmo fornecidas pelo proprietário quando indicadas. `PROMPTS.json` registra os pedidos exatos. Os WebPs derivam desses PNGs. Os seis SVGs em `public/assets/brand/` são desenhos geométricos originais produzidos para a landing. Essas imagens são conceituais, sem validação como desenho industrial ou identidade final.

Atualização r2 (04/11/2026): três cenas editoriais e um recorte de Ritmo foram produzidos com a ferramenta nativa image_gen. Os cinco ícones icon-*.svg são geometria vetorial própria. Os materiais e prompts vigentes estão em REFINAMENTO-R2.md e PROMPTS-R2.md. Pessoas e wearable nas cenas são conceituais, sem depoimentos ou usuários reais.

## Refinamento r3

Novo asset vinculo-autonomia-r3.webp gerado com image_gen nativo a partir da referência de materiais da arte anterior; prompt integral em PROMPTS-R3.md. Transparência preservada na conversão para WebP. Sol/lua são geometria SVG original animada com a biblioteca Motion existente. Nenhuma dependência adicionada.

## Refinamento r4

Cena pulseira-iphone-r4.webp editada com image_gen nativo a partir da cena aprovada; prompt em PROMPTS-R4.md. Fonte Fustat preservada. Motion existente usado para seleção compartilhada das abas; animação de máscara das palavras adaptada da referência do site da Julia indicado pelo proprietário. Nenhuma dependência nova.
# Adendo r6 — iPhone frontal com painel

`pulseira-iphone-painel-r6.webp` editado com image_gen nativo a partir de `pulseira-iphone-r4.webp` e captura real da prévia do painel. Prompt e caminho do original em [PROMPTS-R6.md](PROMPTS-R6.md). Conversão WebP preserva alpha; 1536 × 1024. A tela é uma reprodução ilustrativa gerada a partir da captura. A versão r4 permanece arquivada. Movimento usa Motion existente e a API SVG nativa, sem código importado de biblioteca adicional.


## R7 — iPhone individual

Asset iphone-painel-r7.webp editado com image_gen nativo a partir do mockup r6 e da captura real do painel. 1122 × 1402, alpha preservado em WebP. Prompt e arquivo original em PROMPTS-R7.md. Imagem conceitual, sem integração com um dispositivo. Nenhuma dependência acrescentada para o menu: CSS nativo com fallback.


## R10 — rolagem suave

[Lenis](https://github.com/darkroomengineering/lenis), versão 1.3.27 fixada no manifesto e lockfile, licença MIT. Usado somente na landing para rolagem com mouse/trackpad de precisão; touch e movimento reduzido permanecem nativos. A licença é distribuída pelo pacote npm. Nenhum asset das referências pesquisadas nesta etapa foi incorporado. Planejamento visual em PLANO-AMBIENTE-R10.md.


## R11 — ambiente do iPhone

`cenario-ritmo-r11.webp` gerado com image_gen nativo a partir da referência de materiais da composição r7. Prompt e original em [PROMPTS-R11.json](PROMPTS-R11.json). A curva pertence ao cenário, sem imagens ou modelos de terceiros. A moldura de telefone usa CSS próprio; as telas são capturas atuais do painel local, exportadas em WebP lossless a partir de 390×844 em escala 3. Nenhum asset de ls.graphics, Shapefest, Mercury, Oura, illo ou AbacatePay foi incorporado. Fontes, licenças e dependências existentes preservadas; nenhuma nova dependência.


## R12 — material e atmosfera

`cenario-ritmo-r12.webp` editado com image_gen nativo a partir do asset r11. Enquadramento, base e onda preservados; iluminação neutralizada para permitir integração com a atmosfera azul suave aplicada em CSS. Original e prompt em PROMPTS-R12.json. O circulado da hero é geometria SVG decorativa própria. Nenhuma dependência, fonte ou imagem de terceiros acrescentada.
