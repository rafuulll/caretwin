# CareTwin · Redesign v1

**Primeira versão, em desenvolvimento. Nada está finalizado.** Esta entrega reúne a landing e o dashboard para avaliação visual e de navegação. Não representa a versão final do produto.

## Explorar

- `/`: landing page.
- `/painel/`: dashboard interativo com dados fictícios.
- `/marca`: biblioteca inicial de assets da marca.

Os botões da landing levam à demonstração do painel. O dashboard permite voltar ao site, alternar pessoa, consultar passos/sono, explorar mudanças e testar estados da interface.

Refinamento atual de 04/11/2026: painel ocupa a janela, gráfico com exploração por dias, navegação acessível durante a rolagem e transições de contexto na landing. Os controles de cenários ficam em **Testar estados da prévia**, ao final do painel. Decisões, pesquisa, heurísticas e limites em [docs/REFINAMENTO-FINAL.md](docs/REFINAMENTO-FINAL.md).

## Executar

Requer Node.js 22.12 ou superior. Nesta pasta:

```sh
npm ci
npm run dev
```

Prévia local: http://127.0.0.1:4322/. Build: `npm run build`.

## Publicar na Vercel

Crie ou vincule um projeto de prévia com **Root Directory `apps/redesign-v1`** no repositório `rafuulll/caretwin`. O preset é Vite, a instalação usa `npm ci`, o build `npm run build` e a saída `dist`. O arquivo `vercel.json` resolve as entradas da landing e do painel. Não configurar esta pasta como substituta do app oficial `apps/web` neste momento.

## Escopo e pendências

- Landing e painel ainda exigem ajustes de layout, copy, responsividade e refinamento humano.
- Dados, pessoas, pulseiras e sincronização são fictícios; o cenário é 2 nov. 2026, 15:30.
- Sem autenticação, API, persistência, banco de dados ou integração com a pulseira. Preferências e leituras existem apenas na sessão.
- Não há diagnóstico, meta universal ou avaliação clínica. Sono é estimado por movimento.
- O aplicativo Next.js e o backend em `apps/web` continuam independentes. Nenhuma regra de negócio foi migrada.
- Esta prévia usa `noindex` e identifica a versão como em desenvolvimento.

As decisões anteriores estão preservadas em `docs/landing` e `docs/painel`; seus caminhos e relatos de servidor referem-se aos estudos originais. Este README e a configuração da app definem o empacotamento desta primeira versão para revisão.

Assets próprios de estudo gerados com IA, ícones Phosphor, componentes Radix e fonte Fustat com licença OFL preservada em `public/assets/OFL-Fustat.txt`.

## Refinamento da landing · 04/11/2026

Títulos sem marcações decorativas, cenas editoriais de dia/noite e família, histórico em três etapas manuais e fechamento com Ritmo invertido. A biblioteca `/marca` reúne as novas cenas e cinco ícones SVG originais. O dashboard mantém a primeira versão.

Decisões e validação: [REFINAMENTO-R2.md](docs/landing/REFINAMENTO-R2.md). Direção atual: [DESIGN.md](docs/landing/DESIGN.md). Prompts das imagens: [PROMPTS-R2.md](docs/landing/PROMPTS-R2.md).

## Refinamento local r3 · 04/11/2026

A direção vigente está em docs/landing/DESIGN.md: sol/lua com composição nova, histórico animado por dias, arte 3D de vínculo, menu por direção de scroll e setas de CTA. Cadeiras e fotografias saíram da composição ativa. Decisões em docs/landing/REFINAMENTO-R3.md; evidências em docs/landing/VERIFICACAO-R3.json. Esta revisão foi pedida para avaliação local, sem novo push/deploy.

## Refinamento local r4 · 04/11/2026

Curva central com seta na passagem da hero, títulos animados por palavras, cápsulas de seleção deslizantes, ligação inferior na aba Comparar e iPhone na cena de produto. Fechamento simplificado conforme retorno do proprietário. Direção atual em docs/landing/DESIGN.md; decisões e verificação em REFINAMENTO-R4.md e VERIFICACAO-R4.json. Sem novo push/deploy.

## Refinamento local r5 · 04/11/2026

Abas sem salto de scroll, foco por teclado preservado, FAQ com título acompanhando a coluna e nota de prévia retirada da hero. Estudos de logo em /estudos/logo-caretwin.html, sem alterar a marca ativa. Detalhes em docs/landing/REFINAMENTO-R5.md e VERIFICACAO-R5.json. Sem novo commit, push ou deploy.


## Refinamento do painel r2 · 04/11/2026

Visão geral com registros prioritários, colunas alinhadas, resumos de sono/pulseira, gráfico refinado e Ritmo como guia após os dados. Assinatura apenas tipográfica. Seletores de métrica/período usam transição breve; corrigida a piscada dos títulos da landing. Direção e limites em docs/painel/REFINAMENTO-R2.md. Outras telas continuam funcionais e aguardam revisão detalhada. Somente local, sem novo commit, push ou deploy.


## Painel r3 · 04/11/2026

Passos, Sono, Mudanças, Família e Preferências refinados. Links locais: /painel/?view=steps, ?view=sleep, ?view=alerts, ?view=family e ?view=settings. Navegação nativa preserva tela/pessoa em Voltar/Avançar e recarregar. Preferências e leitura continuam em memória. Revisão de mobile, teclado, toque e estados concluída nos cenários de docs/painel/VERIFICACAO-R3.json. Direção e limites: docs/painel/REFINAMENTO-R3.md. Somente local, sem novo commit, push ou deploy.
