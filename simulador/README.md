# simulador (testar sem a pulseira)

Para quem trabalha no backend, na IA ou no site e nao tem o ESP32 em casa. Gera os mesmos dados que a pulseira envia (contrato v1, docs/openapi.yaml) e manda para uma API. Precisa so de Python 3.9 ou mais novo; nao instala nada.

## Em 30 segundos

Terminal 1 (API falsa):
  python simulador/mock_api.py

Terminal 2 (pulseira simulada, 14 dias de dados):
  python simulador/simulador.py --url http://localhost:8080

A API real mora em apps/web (Next.js), com as rotas /v1/device prontas. Com o npm run dev ligado em apps/web e o banco de teste com as pulseiras de apps/web/banco/dev/pulseiras-de-teste.sql, e so trocar a URL e usar o token de uma pulseira de teste:
  python simulador/simulador.py --url http://localhost:3000/api --token token-de-teste-1

## Cenarios (--cenario)

  normal        usuario estavel, cerca de 7000 passos por dia
  queda         ultimos 3 dias cerca de 40% abaixo da media (deve disparar o alerta de baseline)
  aumento       ultimos 3 dias cerca de 40% acima
  sedentario    cerca de 2500 passos por dia
  poucos_dias   so 3 dias (menos que os 5 dias validos minimos da regra de baseline)
  falhas        dias zerados e noites com buracos de dados
  invalidos     dados normais mais 5 registros que a API deve recusar (passos negativos, passos impossiveis, data ruim, noite com 100 valores em vez de 840, ao vivo negativo)

## Opcoes

  --url URL          base da API; sem isso nada e enviado
  --token TOKEN      token do dispositivo (padrao sim-token-nao-secreto), vai em Authorization: Device <token>
  --dias N           quantos dias gerar (padrao 14)
  --data-final DATA  ultimo dia, AAAA-MM-DD (padrao hoje)
  --semente N        mesma semente gera os mesmos dados (padrao 42), bom para testes repetiveis
  --salvar PASTA     grava os JSONs na pasta (fixtures para pytest, Postman, curl)
  --ao-vivo N        envia N vezes /v1/device/live, a cada --intervalo segundos (padrao 5)

## Exemplos por pessoa

Backend (Fabricio): validar as rotas e a recusa de dados ruins
  python simulador/simulador.py --url http://localhost:3000/api --token token-de-teste-1 --cenario invalidos

IA (Lucas): alimentar a linha de base com um caso conhecido e conferir o resultado
  python simulador/simulador.py --url http://localhost:3000/api --token token-de-teste-1 --cenario queda --dias 10
  (7 dias de base e 3 dias recentes 40% abaixo: a regra de 20% deve sinalizar queda)

Site (Rafael): encher o painel com dados e testar o modo ao vivo
  python simulador/simulador.py --url http://localhost:3000/api --token token-de-teste-1 --dias 30
  python simulador/simulador.py --url http://localhost:3000/api --token token-de-teste-1 --ao-vivo 20

Fixtures de teste (sem rede):
  python simulador/simulador.py --salvar simulador/saida --cenario normal --dias 7
  curl -X POST http://localhost:3000/api/v1/device/daily -H "Authorization: Device token-de-teste-1" -H "Content-Type: application/json" -d @simulador/saida/daily_01.json

A pasta simulador/saida esta no .gitignore.

## API falsa (mock_api.py)

Responde ao contrato v1 com validacao simples e guarda tudo na memoria. Serve de referencia do comportamento esperado: a API real deve responder igual (200 com accepted e rejected, 401 sem token, 422 para o ao vivo invalido). Para ver o que chegou: GET http://localhost:8080/v1/debug/recebidos. Opcao --porta muda a porta.

## Formato dos dados

  POST /v1/device/daily   {"firmware", "battery_pct", "days": [{"date", "steps", "active_minutes"}]}   ate 7 dias por envio
  POST /v1/device/nights  {"night_date", "window_start", "counts": [840 valores, minuto sem dado = null]}   janela das 20:00 as 10:00, fuso -03:00
  POST /v1/device/live    {"steps_today", "ts"}

## Simulador versus Wokwi

O simulador Python imita o que a pulseira ENVIA (dados). O Wokwi, em firmware/, imita a pulseira por dentro (sensor, tela, botoes, bateria). Para o backend e a IA, o simulador Python basta e e muito mais simples.
