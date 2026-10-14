# Como trabalhamos

## Branches e Pull Requests

1. A branch main e protegida: ninguem faz push direto. Tudo entra por Pull Request.
2. Crie uma branch curta a partir da main, com o prefixo da area:
   web/tela-de-resumo, api/endpoint-daily, ai/baseline-sono, fw/display-st7789, docs/contrato-v1
3. Faca commits pequenos, com mensagem clara em portugues ("api: valida data no POST /daily").
4. Abra o Pull Request usando o modelo em .github/pull_request_template.md.
5. Todo PR precisa de pelo menos 1 aprovacao de outra pessoa (revisao cruzada: front revisa API, API revisa IA, etc.).
6. Cada PR cita o cartao do Trello (link no corpo do PR). Ao fazer merge, mova o cartao no quadro.
7. Merge com "Squash and merge" para manter o historico limpo.

## Segredos

Nunca coloque chaves, senhas ou URLs privadas no codigo. Use variaveis de ambiente.
Cada app tem um .env.example com os NOMES das variaveis (sem valores reais). Valores reais ficam em .env local (ignorado pelo Git) e nos paineis da Vercel e da Railway.
Se um segredo vazar no Git, troque a chave na hora e avise o grupo.

## Contrato primeiro (contract first)

O arquivo docs/openapi.yaml descreve a API. Quem muda um endpoint muda o contrato no mesmo PR e avisa o grupo.

1. O Fabricio gera/atualiza o OpenAPI a partir do FastAPI e commita em docs/openapi.yaml.
2. O Rafael gera os tipos TypeScript a partir dele (openapi-typescript). Ate a API real estar no ar, o site usa dados de exemplo no proprio navegador (apps/web/src/lib/store.ts).
3. A pulseira usa os endpoints v1 do contrato. Mudanca incompativel vira v2, nao altera a v1.

## Testar sem a pulseira

O simulador em simulador/ gera os dados da pulseira (varios cenarios) e a API falsa mostra o comportamento esperado do contrato. Backend e IA nao precisam do ESP32 para testar: veja simulador/README.md. Ao mudar o contrato, atualize tambem simulador/mock_api.py e simulador/simulador.py.

## Previews e ambientes

Vercel cria um link de preview para cada PR do site. A API tem um ambiente de teste na Railway e um de producao. Hoje o site ainda nao chama a API: quando ela entrar, o ponto de ligacao e apps/web/src/lib/store.ts.

## Integracao semanal

Uma vez por semana (sugestao: sabado) o grupo junta tudo, roda de ponta a ponta (pulseira simulada -> API -> site) e anota o que quebrou no Trello.

## Regra para a IA

A linha de base (estatistica) faz a analise de verdade. O modelo de linguagem so escreve o texto em portugues a partir dos numeros. A API chama o provedor de texto por uma interface unica (veja ai/README.md), entao trocar o modelo nao muda o resto.
