# CareTwin · Redesign v1

**Primeira versão, em desenvolvimento. Nada está finalizado.** Esta entrega reúne a landing e o dashboard para avaliação visual e de navegação. Não representa a versão final do produto.

## Explorar

- `/`: landing page.
- `/painel/`: dashboard interativo com dados fictícios.
- `/marca`: biblioteca inicial de assets da marca.

Os botões da landing levam à demonstração do painel. O dashboard permite voltar ao site, alternar pessoa, consultar passos/sono, explorar mudanças e testar estados da interface.

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
