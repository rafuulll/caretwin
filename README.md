# CareTwin

Projeto UPX (UniFacens). Pulseira com ESP32-S3, API FastAPI, Supabase, site em Next.js e IA que explica os dados com base em uma linha de base pessoal.

Equipe: Rafael (produto, UX, frontend e hardware), Fabricio (backend, banco, API, infra) e Lucas (IA e linha de base).
Quadro de tarefas: https://trello.com/b/v8PlBQcb/upx

## Como as partes se conectam

  Pulseira (ESP32-S3)  ->  HTTPS  ->  API FastAPI (Railway)  ->  Supabase (Postgres)
  Site (Vercel)        ->  HTTPS  ->  API FastAPI
  API  ->  modulo de IA (ai/)  ->  texto em linguagem natural

A API e o centro: todo mundo conversa com ela e o contrato fica em docs/openapi.yaml. O site nunca fala direto com o banco nem com a IA.

## Estrutura

  apps/web      Site (Next.js, React, Tailwind, TypeScript). Dono: Rafael. Deploy: Vercel, Root Directory apps/web
  apps/api      API (FastAPI). Dono: Fabricio. Deploy: Railway, Root Directory apps/api
  ai            Linha de base pessoal e geracao de texto. Dono: Lucas. Comeca como modulo Python usado pela API
  firmware      Programa da pulseira, com simulador Wokwi e testes. Dono: Rafael
  simulador     Pulseira simulada em Python e API falsa, para testar sem o ESP32
  docs          Contrato da API (openapi.yaml), decisoes e documentos de hardware

## Por onde comecar (cada um no seu papel)

Backend ou IA, sem a pulseira:
  1. Leia docs/openapi.yaml (o contrato v1).
  2. Rode a API falsa e o simulador para ver os dados chegando: simulador/README.md.
  3. Faca a sua API responder igual a simulador/mock_api.py e teste com o simulador apontando para ela.

Site:
  1. Rode o site com dados de exemplo (npm install e npm run dev em apps/web) e veja como ligar a API em apps/web/README.md.
  2. Para encher o painel com dados realistas, use o simulador com a sua API local.

Firmware:
  1. Abra a pasta firmware no VS Code e siga firmware/README.md.

## Variaveis de ambiente

Cada app tem um .env.example com os NOMES das variaveis. Copie para .env (o .env nunca vai para o Git).

## Fluxo de trabalho

Leia CONTRIBUTING.md. Resumo: main protegida, branches curtas, Pull Request com revisao de outra pessoa, cada PR cita o cartao do Trello.
