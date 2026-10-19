# ai (linha de base e texto)

A IA do CareTwin tem duas camadas, e so a segunda e um modelo de linguagem.

## Duas camadas

1. Linha de base (estatistica): calcula o que e normal para a pessoa (passos, sono, batimentos) e quanto os dias recentes fogem disso. Aqui acontece a analise de verdade.
2. Texto (LLM): recebe os numeros ja prontos e escreve em portugues, em tom cuidadoso. Nao inventa dados, nao da diagnostico e nao soa como alarme.

## Onde esta hoje

- A regra da linha de base (cartao 2.3: base de 7 dias, 3 dias recentes, faixa de 20% para cada lado, alerta quando 2 dos 3 dias fogem para o mesmo lado, minimo de 5 dias validos) ja existe em TypeScript, em `apps/web/src/lib/modelo.ts` e `apps/web/src/lib/normal.ts`. Hoje ela roda no navegador, sobre os dados de exemplo.
- Os textos do resumo e dos alertas sao modelos prontos preenchidos com os numeros, em `apps/web/src/lib/respostas-ia.ts`.
- Nenhum modelo de linguagem esta ligado ainda.

## O plano

Desde 15/10/2026 a API mora dentro do Next.js (`apps/web`), e nao num servidor Python. Entao:

- Quando a pulseira entregar dias novos, a API recalcula o normal com a mesma regra e grava os alertas na tabela `alertas`.
- Para escrever a frase, a API chama um provedor de texto por HTTP, sempre pela mesma interface:

  ```
  generate_summary(facts) -> texto
  ```

  | Provedor | Quando |
  | --- | --- |
  | Ollama (modelo local) | Primeira opcao: privacidade (LGPD) e custo zero |
  | Texto por regras (os modelos de hoje) | Reserva: sempre funciona, sem modelo |

  Se o Ollama nao responder, a API usa o texto por regras.

- Esta pasta pode guardar uma versao de referencia da regra (por exemplo em Python) e uma bateria de testes para comparar com a versao em TypeScript, usando os cenarios do `simulador/`.

## Onde o modelo roda

A Vercel nao roda modelos de linguagem. Na demo, o Ollama roda num notebook e a API chama ele pela rede; a versao publicada usa o texto por regras como reserva. Testar a qualidade em portugues de modelos pequenos (3B a 8B) antes de decidir.
