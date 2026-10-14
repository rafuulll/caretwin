# Decisões do CareTwin

Cada item diz o que foi decidido e por quê, com as palavras da proposta de valor ao lado. Quem for mudar alguma coisa lê aqui antes.

## O plano em quinze linhas

- O app é pra: acompanhar o dia de uma pessoa pela pulseira e explicar, em palavras simples, quando algo muda em relação ao normal dela.
- Usam ele: a pessoa que usa a pulseira e o familiar ou cuidador que acompanha de 1 a 3 pessoas.
- As coisas que ele guarda: pessoa (nome, quem acompanha), pulseira (código, pessoa, bateria, última sincronização), dia registrado (pessoa, data, passos, movimento da noite, medições de batimentos) e alerta (pessoa, data, o que mudou, para que lado, quanto, o texto, se já foi lido).
- Elas se ligam assim: cada pessoa tem uma pulseira, muitos dias registrados e muitos alertas. Tudo que é da pessoa sai junto com ela.
- Estados: só o alerta tem estado, e são dois (novo e lido).
- O site da raiz diz: a promessa com a prévia do app; o normal de cada um, desenhado com os dados de exemplo; o que muda no dia de quem usa; o percurso do dia, um passo por momento.
- A entrada fica em: `/entrar`, com o título "Veja como está o dia de hoje".
- A tela que abre o app é: o Painel (`/app/painel`), o momento 2.
- As outras telas são: Sono, Batimentos, Alertas, Primeiro uso e Configurações.
- Ele não faz: diagnóstico, meta igual pra todo mundo, ranking, comparação entre pessoas, chat, pontos, pagamento, propaganda, nem manda dado pra fora do computador.

## Os momentos e as telas

| Momento | Quem | Quando | Precisa fazer | Toques | Tela |
|---|---|---|---|---|---|
| 1 | A pessoa | De manhã, ao acordar | "ver como foi a noite e se a pulseira sincronizou" | 1 | Sono |
| 2 | A pessoa | Durante o dia | "conferir os passos de hoje comparados com o normal dela e a bateria da pulseira" | 0 (abre nela) | Painel |
| 3 | A pessoa | Quando quiser | "pedir uma medição de batimentos e ver o histórico" | 2 | Batimentos |
| 4 | O familiar ou cuidador | À noite | "ler o resumo escrito do dia e ver se houve algum alerta de mudança" | 2 | Alertas |
| 5 | Qualquer pessoa | No primeiro uso | "seguir o passo a passo para conectar a pulseira e criar o perfil" | 3 | Primeiro uso |

- O momento mais frequente é o 2 (duas a três vezes por dia), por isso o app abre no Painel. `/app` sozinho leva pra `/app/painel`, e o rótulo do menu e o endereço falam a mesma palavra.
- Os momentos 1 e 2 são da mesma pessoa em instantes diferentes do dia, então são duas telas.
- O momento 4 é de outra pessoa (quem cuida), então é uma tela própria, com o resumo em primeiro lugar.
- O Primeiro uso fica fora do menu: acontece uma vez por pulseira. Chega-se nele pelo painel vazio e pelo botão de conectar outra pulseira, ao lado da troca de pessoa no topo.
- Ninguém só lê sem escrever: a pessoa mede batimentos e quem cuida marca alertas como lidos.

## Os cadastros e os campos (regra 5, campo por campo)

- **Pessoa**: `nome` (lido em todas as telas e nos textos) e `quemAcompanha` (escrito no primeiro uso; é quem lê o resumo). A **idade aproximada** ficou de fora: ela está só na linha do cadastro, e nenhum momento lê ou escreve ela. O **normal da pessoa** não é guardado, é calculado dos dias registrados (guardar seria guardar uma conta que fica velha no dia seguinte).
- **Pulseira**: `codigo` (escrito no momento 5), `pessoaId`, `bateria` (momento 2) e `ultimaSincronizacao` (momento 1). A **versão** ficou de fora: nenhum momento lê.
- **Dia registrado**: `passos` (momento 2), `noite` (momento 1, de onde sai o sono) e `batimentos` (momento 3). Os **minutos de atividade** ficaram de fora: só aparecem na linha do cadastro, e nenhum momento nem funcionalidade lê. O **quanto o dia ficou perto ou longe do normal** é calculado na hora, não guardado.
- **Alerta**: `metrica`, `direcao`, `desvio`, `texto` e `data` (todos lidos no momento 4). O **lido** ficou, com ressalva: ele está escrito na linha do cadastro, e o momento 4 pede pra "ver se houve algum alerta", o que só dá pra responder separando os novos dos já vistos.
- As métricas que viram alerta são passos, sono e batimentos, as três que os momentos leem. "Atividade" saiu junto com os minutos de atividade.

## A forma de cada coleção

- **Pessoas**: troca no topo do app, num seletor. Momento: o cuidador acompanha "de 1 a 3 pessoas". Considerada e descartada: lista com busca (três itens não pedem busca).
- **Pulseira**: tela única, mostrada como cartão no Painel e no Sono. Momento: "se a pulseira sincronizou" e "a bateria da pulseira". Descartada: tela própria de pulseiras (uma por pessoa, nada pra listar).
- **Dias registrados**: o dia de hoje em número grande contra o normal, e os últimos 14 dias em barras com a faixa do normal. Momento: "os passos de hoje comparados com o normal dela". Descartada: tabela (o uso é no celular, e a pergunta é "foi um dia ou vários?", que a forma no tempo responde melhor).
- **Medições de batimentos**: o botão de medir primeiro, depois a lista das últimas e os pontos dos 14 dias. Momento: "pede uma medição de batimentos e vê o histórico". Descartada: linha ligando as medições (elas são soltas; a linha inventaria o que houve entre duas).
- **Alertas**: linha do tempo agrupada por dia, com os novos marcados e um botão de marcar como lido. Momento: "vê se houve algum alerta de mudança". **Quadro por etapas: reprovado** (os alertas têm dois estados, não três ou mais escritos num momento, e mover entre colunas não é o trabalho de ninguém).

## O painel

O portão do painel de abertura abriu pelo segundo caminho: a Parte A pede, com estas palavras, "Mostrar o painel do dia, com os passos de hoje contra o normal da pessoa, a bateria da pulseira e a última atualização". O volume é pequeno (uma pessoa, um dia), então o painel mostra exatamente o que foi pedido e nada mais: um número que decide (passos contra o normal até agora), o estado da pulseira e o gráfico que mostra o que a contagem sozinha não mostra (se a mudança é de um dia ou de vários).

## A regra do normal

A do cartão 2.3: média dos 7 dias antes dos 3 recentes, faixa de 20% para cada lado, alerta quando 2 dos 3 dias fogem para o mesmo lado, mínimo de 5 dias válidos. Os números ficam em `src/lib/modelo.ts`. Duas decisões em cima dela:

- Os passos de hoje são comparados com o normal **até este horário** (uma curva de quanto se anda em cada hora). Comparar com o dia inteiro às 10h diria "abaixo do normal" pra todo mundo, todo dia.
- O alerta nasce no **primeiro** dia em que a mudança fica clara, e não se repete nos dias seguintes enquanto ela continua. Sem isso, quem cuida leria o mesmo aviso toda noite.

## O site da raiz

Arranjo da abertura: **(a)**, promessa, apoio e botão à esquerda, prévia do app à direita. A promessa é curta mas o produto é visual (um número contra uma faixa), e mostrar o painel ao lado prova a frase. O arranjo (c) foi descartado porque quem chega no site primeiro precisa entender o que é o CareTwin, e não criar conta.

| Dobra | O que carrega |
|---|---|
| Abertura, com a prévia do app | A frase do problema: perceber cedo quando o dia muda. A prévia é o Painel da Dona Cida, em HTML, com os dados de exemplo. |
| O normal de cada um (a dobra viva) | Benefício 1, "comparado com o meu normal, e não com a meta dos outros". Mostra os 7 últimos dias da Dona Cida com a faixa do normal dela, com a mesma conta do app. |
| O que muda no seu dia (grade) | Os quatro benefícios, um por célula, com o sentido escrito na Parte A. |
| Do acordar ao fim do dia (percurso) | Os cinco momentos, em ordem, um passo por momento. |

Dobras guardadas (o arquivo existe e não entra na página): planos e time. O CareTwin não é vendido e o site não apresenta time; as chaves delas no `site.ts` ficam vazias de propósito. Dobras do cardápio deixadas de fora: faixa de números, depoimento, prova social e faixa de logos (nenhum material pra elas). O brilho que segue o cursor também ficou de fora: a única grade de cartões do site é curta, e o efeito não ensinaria nada.

## O visual

- O `design-system.json` é o da proposta: canvas branco, tinta `#181d26` como cor principal dos botões e dos números, borda `#d5d6d8`, raio de 10 px.
- A fonte original da referência visual é paga e não pode vir junto com o projeto. Entrou a **Inter**, que é a família livre mais próxima do mesmo desenho neutro, com o peso 500 e o espaçamento 0 do JSON.
- **Ressalva de contraste**: a borda `#d5d6d8` fica em 1,45:1 contra o branco. Ela é decorativa nos cartões; nos campos, quem garante a leitura é o rótulo visível e o foco. O valor ficou como está no JSON, sem troca de cor.
- Profundidade sem sombra externa: borda, gradiente curto e luz por dentro. Por isso a variante primária do `button.tsx` e o `botao-link.tsx` deixaram de usar o brilho colorido, o `shadow-sm` saiu da variante de perigo, e a `.superficie-elevada` ficou só com o fio de dentro.
- Fora do normal é **atenção** (âmbar), sempre com seta e texto. O vermelho existe só pra apagar dados.
- Quem usa pode ser uma pessoa idosa: os botões principais têm 56 px de altura e texto de 18 px, o texto principal das telas do app é de 16 px pra cima.

## Uma linha por animação

- **Fundo vivo da abertura**: cumpre a REGRA DO SITE 2. A família (malha) e os parâmetros saem do hash do nome "CareTwin". Para fora da tela, com a aba escondida e com "reduzir movimento" (um quadro parado).
- **Barra de progresso da medição**: ensina quanto falta dos 12 segundos. Só `transform`.
- **Cor de botão e de link ao passar o mouse (150 ms)**: confirma que aquilo é clicável. Veio do andaime.
- **Cabeçalho do site que ganha fundo ao rolar**: separa o cabeçalho do conteúdo que passa por baixo. Veio do andaime, CSS puro, desliga com "reduzir movimento".
- **Tour da primeira visita**: o deslizar entre paradas, do driver.js. Veio do andaime e desliga com "reduzir movimento".
- **Indicador girando no botão que está carregando**: mostra que o pedido foi recebido. Some quando termina.

## Dependências

Nenhuma biblioteca nova entrou. Consideradas e descartadas: biblioteca de gráfico (barras e pontos de uma série só cabem em SVG à mão, que acompanha o tema sem peso) e three.js para o fundo da abertura (a família sorteada, malha, sai em canvas puro com poucas linhas).

## Mudanças pequenas no andaime, e por quê

- `src/lib/design-system.ts`, `src/lib/cn.ts` e `src/app/globals.css`: as seis linhas da escala de três raios, do PASSO 9.
- `src/app/globals.css`: o `:root` de reserva deixou de ter cor escrita na mão (quem pinta é o layout, a partir do JSON), o realce passou a usar mistura com as palavras `white` e `black` em vez de `rgba`, o bloco de "reduzir movimento" zera também os atrasos, e dois comentários que citavam um site de terceiros saíram.
- `src/app/layout.tsx`: escreve também as variáveis de ritmo do JSON (`--ds-space`, `--ds-line-height`) e o tom de marca usado como tinta.
- `src/lib/tema.ts`: calcula os dois raios novos para o catálogo de outros visuais. Hoje nenhuma tela usa esse catálogo (a seção de trocar o design system saiu das configurações), e ele fica parado no projeto, junto com `contraste.ts`, `design-systems.json` e a rota `/api/diagnostico-contraste`.
- `src/components/onboarding/tour.tsx`: a última parada de cada página já guarda onde a jornada continua. Sem isso, quem clicava direto no "Entrar" destacado (que é o que a parada pede) chegava no app sem o tour retomar.
- `src/lib/formato.ts`: saíram as funções de dinheiro (o CareTwin não tem dinheiro) e entraram as de duração e de tempo decorrido.
- `src/components/auth/modal-google.tsx`: o rodapé ficou só com "Entendi". A entrada que funciona hoje (nome e senha) está logo atrás do modal, e um atalho de entrar sem senha furaria a validação.

## O que ficou de fora, e por quê

- **Idade aproximada, versão da pulseira e minutos de atividade**: estão só nas linhas dos cadastros, e nenhum momento lê nem escreve (regra 5).
- **Remover pessoa pela tela**: nenhum momento pede. A função existe no `store` (com a cascata) e o "Limpar tudo" das configurações zera tudo.
- **Modo escuro, texto grande e funcionamento sem internet**, que existiam na versão anterior do `apps/web`: não estão na proposta de valor. O seletor de design system das configurações, que deixava comparar visuais escuros, saiu a pedido do dono do projeto.
- **Sincronizar a pulseira a qualquer hora**: a pulseira faz isso sozinha. A sincronização de exemplo aparece só onde ela destrava a tela, quando uma pessoa nova ainda não mandou nada.
