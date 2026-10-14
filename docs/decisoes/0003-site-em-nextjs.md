# 0003 Site em Next.js e Tailwind

Decisao: o site (apps/web) usa Next.js 16, React 19, Tailwind 4 e TypeScript, no lugar de React com Vite.
Motivo: rotas por pasta, paginas pre-renderizadas que abrem rapido em celular simples, PWA com modo offline e deploy direto na Vercel com Root Directory apps/web.

Decisao: enquanto a API nao existe, o site funciona sozinho com dados de exemplo guardados no navegador, no lugar do MSW.
Motivo: da para apresentar e testar o fluxo inteiro sem servidor. As telas so falam com apps/web/src/lib/store.ts, entao ligar a API e trocar as funcoes desse arquivo, sem mexer nas telas.

Decisao: a regra do normal pessoal da versao do site (percentis 20 a 80 dos 14 dias anteriores, margem de 10%) serve de referencia para a linha de base do modulo ai/.

Detalhes e o sistema de design: apps/web/DECISOES.md.
