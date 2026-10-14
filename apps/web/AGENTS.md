<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Regras do produto CareTwin

- Todo texto que aparece na tela fica em `src/content`. Componentes não têm texto solto.
- Cor só pelos tokens de `src/app/globals.css` (classes como `bg-primaria`, `text-tinta`). Nada de hex direto em componente.
- Estado de saúde sempre com ícone e texto, nunca só a cor. Alerta usa o tom de atenção, nunca vermelho.
- O app não diagnostica. Fala do que mudou em relação ao normal da própria pessoa, em linguagem simples.
- Alvo de toque com no mínimo 44 px. Teste no tema escuro e no modo de texto grande antes de abrir PR.
- Gráfico novo precisa de tabela equivalente e leitura por teclado (veja `src/components/graficos/base.tsx`).
- Animação respeita `prefers-reduced-motion`.
- Não guarde senha nem dado sensível no navegador.
- As telas só falam com os dados por `src/lib/store.ts` e `src/lib/consultas.ts`. Para ligar a API, troque essas funções, não as telas.
