# 0005 IA de texto na nuvem, com verificador e texto de regra

Data: 10/11/2026. Cartões 6.2, 6.3 e 7.6.

Decisão: o texto do resumo do dia e da explicação dos alertas é escrito por um modelo de linguagem na nuvem, por uma API no formato da OpenAI. Serve para Gemini, Groq, OpenAI e outros: trocar de serviço é trocar `IA_URL`, `IA_CHAVE` e `IA_MODELO`, sem mexer no código. Se o modelo não estiver ligado, falhar, demorar ou escrever algo que o verificador reprova, o texto de regra entra no lugar, e a tela trata os dois como uma explicação normal.

O modelo só escreve. Quem calcula é a regra do normal (`normal.ts`), em código comum. Cada texto passa pelo verificador (`src/lib/ia/verificador.ts`) antes de aparecer: bloqueia número inventado, lado errado (abaixo ou acima), diagnóstico, remédio, ordem à pessoa, tom de alarme e formato fora do padrão. Por isso trocar de serviço, ou de modelo, não muda a segurança do que o usuário lê.

## Por que nuvem e não um modelo local

A primeira versão foi com um modelo local (Ollama, llama3.2:3b), porque a ideia era manter o dado de saúde dentro do computador. Testamos no computador do grupo, sem placa de vídeo, e medimos:

- o modelo levou 1 min 36 s para carregar na memória;
- depois de carregado, escreveu a 7,3 tokens por segundo, uns 20 s por parágrafo;
- o site esperava 90 s e mesmo assim, no primeiro clique, voltou ao texto padrão.

Além da lentidão, um modelo local tem outro limite: a Vercel, onde o site fica publicado, não alcança o computador de ninguém. Com Ollama, a IA só funcionaria na demonstração local.

| | Nuvem (escolhida) | Local (Ollama) |
| --- | --- | --- |
| Velocidade | segundos | no computador do grupo, dezenas de segundos; num servidor alugado sem placa de vídeo, igual |
| Funciona no site publicado (Vercel) | sim | não |
| Custo | por uso, uma fração de centavo por texto (estimativa, conferir o preço do modelo escolhido) | zero por texto, mas um servidor com placa de vídeo ligado o mês todo custa centenas de dólares (estimativa) |
| Privacidade | o dado sai do servidor para o provedor | o dado não sai da máquina |
| Manutenção | nenhuma | instalar, atualizar modelo, cuidar do servidor |

O que explica a escolha: o CareTwin gera poucos textos por pessoa por dia, então o custo por uso é pequeno e um servidor próprio ficaria parado quase o tempo todo. A privacidade, que é o forte do modelo local, pesa menos aqui porque o pedido ao provedor leva só números do dia e para que lado fugiram do normal. O nome não vai: o pedido leva `[NOME]`, e o nome entra no texto só depois que ele volta ao nosso servidor.

Quando o modelo local seria a melhor escolha: se um cliente (hospital, plano de saúde, casa de repouso) exigir por contrato que nenhum dado saia do ambiente dele, se o produto precisar funcionar sem internet, ou se o volume de textos ficar tão alto que o custo por uso passe o de um servidor com placa de vídeo. Voltar a esse caminho não exige reescrever o sistema: o verificador, o texto de regra e as rotas continuam iguais, e só a função que fala com o modelo (`src/lib/ia/modelo.ts`) muda. Servidores locais como o Ollama também oferecem um endereço no formato da OpenAI, então em tese bastaria apontar `IA_URL` para ele (não testamos).

## Cuidados

- A chave do serviço mora só nas variáveis de ambiente do servidor (`.env.local` e Vercel). Nunca no GitHub, no navegador ou em log. A mensagem de erro nunca leva a chave (testado).
- As rotas abertas da demonstração têm um freio de 30 pedidos a cada 10 minutos por endereço, para ninguém esvaziar a cota da chave. A conta é por instância do servidor, então não é exata; basta contra abuso simples.
- Planos gratuitos de alguns serviços podem usar o que recebem para melhorar produtos. Por isso nenhum dado identificável sai, e em produção o plano deve ser o pago, com a opção de não treinar com os dados. Conferir os termos do serviço escolhido antes de ter usuários de verdade.
- Os textos de regra continuam testados: `npm test` confere que todos passam no próprio verificador.

## Perguntas que a banca pode fazer

Por que nuvem e não local, se dado de saúde é sensível? Porque o pedido não leva nada que identifique a pessoa: só números do dia e o lado do normal. O nome fica no nosso servidor. E testamos o local: no computador do grupo ele levou mais de 1 minuto e meio só para carregar e escrevia devagar demais para uma tela de app.

E se o modelo errar ou inventar? O verificador confere cada texto contra os números que a regra calculou e bloqueia o que contradiz, inventa número ou fala como médico. Se reprovar, o usuário lê o texto de regra, que é escrito por nós e testado.

E se a API da nuvem cair ou acabar a cota? O site continua inteiro: entra o texto de regra, e a tela nem trata como erro.

Quanto custa? Poucos centavos por mês por família, pelos preços de mercado de modelos pequenos (estimativa, vale conferir antes de apresentar). Um servidor próprio com placa de vídeo custa muito mais e só se paga com volume alto.

E se um cliente exigir que o dado não saia do ambiente dele? Aí o modelo local passa a ser a melhor escolha, e a arquitetura já está pronta para isso: só a função que fala com o modelo muda.

Por que não treinar um modelo próprio? Porque a parte que exige exatidão, o normal da pessoa, é estatística comum e roda em código nosso. O modelo só reescreve números prontos em português, e para isso um modelo pronto basta.
