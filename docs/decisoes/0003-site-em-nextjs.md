# 0003 Site em Next.js e Tailwind

Decisao: o site (apps/web) usa Next.js 16, React 19, Tailwind 4 e TypeScript, no lugar de React com Vite.
Motivo: rotas por pasta, paginas pre-renderizadas que abrem rapido em celular simples e deploy direto na Vercel com Root Directory apps/web.

Decisao: enquanto a API nao existe, o site funciona sozinho com dados de exemplo guardados no navegador, no lugar do MSW.
Motivo: da para apresentar e testar o fluxo inteiro sem servidor. As telas so falam com apps/web/src/lib/store.ts, entao ligar a API e trocar as funcoes desse arquivo, sem mexer nas telas.

Decisao: a regra oficial de comparacao e a do card 2.3 do Trello (base de 7 dias, 3 dias recentes, +-20%, 2 de 3 dias na mesma direcao, minimo de 5 dias validos), de responsabilidade do Lucao no modulo ai/. O site ja usa essa regra (apps/web/src/lib/modelo.ts e normal.ts), com os passos de hoje comparados ao normal ate o horario atual. Quando o modulo ai/ estiver pronto, a conta passa para ele.

Decisao: o site nao e PWA nesta versao (sem modo offline nem instalacao no celular). Fica para depois, se o grupo quiser.

Detalhes e o sistema de design: apps/web/DECISOES.md.
