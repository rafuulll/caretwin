---
name: CareTwin — proposta visual v3
description: Ritmo pessoal, proximidade e espaço em uma landing clara.
colors:
  blue: "#2549d8"
  navy: "#141d52"
  ink: "#14233d"
  muted: "#586b87"
  soft: "#f4f7fc"
  line: "#dce4f1"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Fustat, Arial, sans-serif"
    fontSize: "60px"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Fustat, Arial, sans-serif"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-.035em"
  body:
    fontFamily: "Fustat, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  button: "12px"
  tabs: "30px"
  navigation: "40px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "14px 23px"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    rounded: "{rounded.button}"
    padding: "14px 23px"
---

# Design System: CareTwin

## Overview

**Creative North Star: "No seu próprio ritmo"** — descrição de trabalho da proposta.

Proposta vigente para a landing v3, ancorada na hero editada e escolhida pelo proprietário: composição compacta, tipografia menor, branco e Ritmo azul reclinado. Documenta a implementação; a identidade completa ainda não foi validada. AbacatePay orienta acabamento, sem reprodução de marca.

A atmosfera é tranquila, adulta e próxima. Objetos e ondas apoiam informação direta; espaço comunica autonomia e companhia.

**Key Characteristics:**

- Azul e branco; tipografia clara; gestos suaves.
- Uma cena dominante; sem recortes de dashboard.
- Profundidade localizada; leitura independente da animação.

## Colors

### Primary

**Azul de ritmo** é a ação principal, o estado selecionado e o traço de apoio. **Azul profundo** sustenta o fechamento e a prévia escura dos assets.

### Neutral

**Tinta** organiza títulos; **texto secundário** sustenta explicações. **Branco**, **superfície suave** e **linha** separam capítulos. O frontmatter contém os valores normativos. Cores auxiliares ainda dependem da correção de contraste e verificação final.

## Typography

**Display Font / Body Font:** Fustat local; fallback Arial e sans-serif. Peso moderado e títulos com entreletra fechada, sem aparência infantil.

Títulos de apoio partem de (32px/1.18), labels de (12–15px), explicações de (16–18px). A hero passa a (52px) no intervalo intermediário e `clamp(40px, 9.8vw, 55px)` no móvel; abaixo de (359px), usa (36px).

## Layout

Contêiner de até (1120px), com margens adaptáveis. Texto e cena em duas colunas no desktop; empilhados no móvel. Seções usam (100px), reduzidos a (65px) no móvel. Breakpoints: (1600px), (1100px), (767px), (359px).

O histórico fixa a cena durante parte do scroll no desktop; suas etapas também são abas. No móvel e com movimento reduzido, segue fluxo linear.

## Elevation & Depth

Vidro concentra-se na navegação: fundo claro com alpha, blur (22px), saturação (150%). Sombras suaves ancoram objetos. Inclinação só responde a mouse com ponteiro preciso; parallax e transformações respeitam movimento reduzido. Conteúdo não depende dos efeitos.

## Shapes

Botões têm curvas moderadas; navegação e abas são cápsulas. Ondas, órbitas e contornos recorrem nos seis SVGs transparentes, independentes de fontes. Não carregam informação sozinhos.

## Components

**Buttons:** primário azul, secundário branco com borda, claro no fechamento. Altura mínima principal (52px); hover altera superfície e foco tem contorno de (3px).

**Navigation:** vidro, links compactos e CTA; Sheet Radix móvel com título, descrição, fechamento e retorno de foco.

**Tabs:** seleção branca/azul em trilho tonal. **FAQ:** Accordion com divisórias e indicador de estado. Composições shadcn/Radix adaptadas para CSS próprio e Phosphor.

**Assets:** Ritmo 3D na hero; guia 2D pontual; poltronas como companhia com autonomia. Biblioteca com fundo claro/escuro e downloads.

## Do's and Don'ts

- **Do** preservar a hero escolhida e a anatomia de Ritmo.
- **Do** manter controles claros com teclado e movimento reduzido.
- **Do** verificar contraste no fundo e tamanho reais antes de aprovar.
- **Don't** reintroduzir os quatro recortes de dashboard removidos.
- **Don't** apresentar imagens como hardware final ou prometer recursos clínicos.
- **Don't** copiar logos, assets ou composição integral das referências.
