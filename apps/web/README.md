# apps/web (PWA)

React + Vite + TypeScript. Deploy na Vercel com Root Directory = apps/web.

Primeiros passos (quando for criar o projeto):
  npm create vite@latest . -- --template react-ts
  npm i -D openapi-typescript msw
  npx openapi-typescript ../../docs/openapi.yaml -o src/api/schema.d.ts

O site fala so com a API, usando VITE_API_URL. Enquanto a API nao estiver pronta, use MSW com respostas baseadas no docs/openapi.yaml.
