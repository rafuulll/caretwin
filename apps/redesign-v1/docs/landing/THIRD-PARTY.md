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
