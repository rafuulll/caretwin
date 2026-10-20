# CareTwin

Pulseira e app que acompanham o dia de uma pessoa (passos, sono estimado e batimentos de bancada) e comparam cada dia com o normal da propria pessoa. Quando algo muda de forma consistente, a familia le um aviso em palavras simples, sem diagnostico e sem tom de alarme.

Projeto academico da disciplina UPX, Engenharia da Computacao, UniFacens.

- Equipe: Rafael (produto, UX, frontend e hardware), Fabricio (backend, banco e infra) e Lucas (IA e linha de base)
- Quadro de tarefas: https://trello.com/b/v8PlBQcb/upx
- Site publicado: https://caretwin-omega.vercel.app (protegido pela Vercel: abre so para quem entra com a conta do projeto ou recebe um link de compartilhamento)

## Situacao atual (outubro de 2026)

| Parte | Situacao |
| --- | --- |
| Site de apresentacao e app com dados de exemplo | Funciona, publicado na Vercel |
| Contas com e-mail e senha (Supabase Auth) | Pronto e testado |
| Familia: ligar pulseira pelo codigo, pedidos, aprovar, sair, encerrar e recuperar | Pronto e testado (52 verificacoes na API, 22 no navegador e teste manual com tres contas) |
| Banco de producao no Supabase | Montado (migracoes 0001 a 0005) |
| Site publicado usando o banco | Pronto: variaveis na Vercel e URLs no Supabase configuradas em 20/10/2026 |
| Rotas que recebem os dados da pulseira (/v1/device) | Prontas e testadas com o simulador; falta apontar o firmware para elas (cartao 4.8) |
| Alertas criados quando chegam dias novos | Falta (cartao 6.1) |
| Rotas de leitura de dias e alertas (/v1/pessoas/{id}/dias e /alertas) | Prontas e testadas (cartao 5.6) |
| Dias e alertas reais nas telas | Falta trocar o store.ts para usar as rotas de leitura (cartao 7.3) |
| IA escrevendo os textos | Falta (hoje os textos sao modelos preenchidos com os numeros) |

O roteiro completo do que falta esta em [apps/web/PROXIMOS-PASSOS.md](apps/web/PROXIMOS-PASSOS.md).

## Como as partes se conectam

```
Pulseira (ESP32-S3)  --HTTPS-->  apps/web: API do Next.js (/api/v1)  -->  Supabase (PostgreSQL + Auth)
Navegador            --HTTPS-->  apps/web: telas e API do Next.js
API                  -->  IA (Ollama, planejado)  -->  texto em linguagem simples
```

A API e o centro: o navegador e a pulseira so conversam com ela, e ela e a unica que fala com o banco. O contrato fica em [docs/openapi.yaml](docs/openapi.yaml).

Desde 15/10/2026 o backend mora dentro do proprio Next.js, em `apps/web/src/app/api`, no lugar da API em Python (FastAPI na Railway) planejada no inicio. O motivo esta em [docs/decisoes/0004-backend-no-nextjs.md](docs/decisoes/0004-backend-no-nextjs.md).

## Estrutura do repositorio

| Pasta | O que tem |
| --- | --- |
| `apps/web` | O site, o app e a API (Next.js, React, TypeScript, Tailwind). Deploy na Vercel com Root Directory `apps/web` |
| `apps/web/banco` | As migracoes SQL do banco (Supabase) e as pulseiras de teste |
| `apps/api` | Nao e mais usada. Ficou so um README explicando a mudanca |
| `firmware` | Programa da pulseira (ESP32-S3, C++, PlatformIO), com simulador Wokwi e testes |
| `simulador` | Pulseira simulada e API falsa em Python, para testar sem o ESP32 |
| `ai` | O plano da IA: linha de base estatistica e texto por um modelo local |
| `docs` | Contrato da API, registros de decisao e documentos de hardware |

## Stack

| Camada | Tecnologia |
| --- | --- |
| Site, app e API | Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, zod |
| Banco e contas | Supabase: PostgreSQL, Supabase Auth e pg_cron |
| Hospedagem | Vercel (deploy automatico da branch main, preview por pull request) |
| Pulseira | ESP32-S3, MPU-6050, MAX30102, display ST7789, LiPo; PlatformIO e Wokwi |
| Testes sem hardware | Python 3 (simulador e API falsa) |
| Qualidade | TypeScript (tsc), ESLint, Storybook |
| Container local | Docker (node:22-alpine) |

## Como rodar o site

Com Node.js 20.9 ou mais novo (recomendado 22):

```bash
cd apps/web
npm install
npm run dev
```

Abra http://localhost:3000. Sem nenhuma variavel de ambiente, o app roda no modo prototipo: o login aceita qualquer nome e senha e as telas mostram pessoas inventadas, guardadas no navegador. Para ligar contas e banco de verdade, siga [apps/web/README.md](apps/web/README.md).

Firmware: abra a pasta `firmware` no VS Code e siga [firmware/README.md](firmware/README.md).
Simulador: [simulador/README.md](simulador/README.md).

## Onde esta cada coisa

| Documento | Para que serve |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Como o grupo trabalha: branches, commits, pull requests, banco e segredos |
| [apps/web/README.md](apps/web/README.md) | Como rodar, configurar e publicar o site, e como ele funciona por dentro |
| [apps/web/DECISOES.md](apps/web/DECISOES.md) | O que foi decidido nas telas e por que |
| [apps/web/PROXIMOS-PASSOS.md](apps/web/PROXIMOS-PASSOS.md) | O que falta e em que ordem |
| [apps/web/AGENTS.md](apps/web/AGENTS.md) | As regras do codigo do site (textos, cores, acessibilidade) |
| [docs/openapi.yaml](docs/openapi.yaml) | O contrato da API (v0.2) |
| [docs/decisoes](docs/decisoes) | As decisoes de arquitetura |

## Variaveis de ambiente

Cada app tem um `.env.example` com os NOMES das variaveis e as instrucoes, sem valores. Copie para `.env.local` (que nunca vai para o Git). Em producao, os valores ficam no painel da Vercel.
