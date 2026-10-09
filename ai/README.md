# ai (linha de base e texto)

Comeca como um modulo Python que a API importa. Se crescer, vira servico separado.

## Duas camadas

1. Linha de base (estatistica): calcula o que e normal para a pessoa (passos, sono, atividade) e quanto o dia/noite atual foge disso. Aqui acontece a analise de verdade.
2. Texto (LLM): recebe os numeros ja prontos e escreve em portugues, em tom cuidadoso. Nao inventa dados e nao da diagnostico.

## Interface do provedor de texto

A API chama sempre a mesma interface:

  generate_summary(facts: dict) -> str

Implementacoes:
  OllamaProvider   modelo local via Ollama (primeira opcao; privacidade/LGPD e custo zero)
  TemplateProvider texto por regras (fallback; sempre funciona, sem modelo)

A variavel LLM_PROVIDER escolhe qual usar. Se o Ollama nao responder, a API cai no TemplateProvider.

## Onde o modelo roda

Railway nao hospeda modelos (sem GPU, pouca RAM). Na demo: API + Ollama no mesmo notebook, com o site apontando para ele, e a versao em nuvem (com TemplateProvider) como reserva. Decidir a hospedagem por volta da semana 5.
Testar a qualidade em portugues de modelos pequenos (3B a 8B) antes de decidir.
