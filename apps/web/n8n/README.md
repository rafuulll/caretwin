# n8n: automações (opcional)

> **Leia isto primeiro:** o CareTwin funciona 100% sem o n8n. Esta pasta é um
> extra, para quando o grupo quiser que os avisos para quem acompanha
> aconteçam sozinhos.

---

## O que é o n8n

É um app onde você monta automações arrastando caixinhas e ligando com fios.
Cada caixinha é um passo. Você liga uma na outra e desenha o caminho.

Em vez de escrever código, você monta um desenho tipo:

> **quando** aparecer um alerta novo → **então** avise quem acompanha no WhatsApp

A primeira caixinha é o gatilho (o que faz a automação começar). As outras são
as ações. É bem parecido com um fluxo de usuário no Figma, só que ele roda.

O n8n é gratuito, roda na sua própria máquina e se conecta com centenas de
serviços prontos: Gmail, Google Sheets, WhatsApp, Slack, Notion, Telegram.

---

## Como subir

### O que você precisa antes

O [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e
aberto. Docker é um programa que roda outros programas dentro de uma caixinha
isolada, sem bagunçar sua máquina. Baixe, instale, abra e espere o ícone da
baleia ficar verde.

### Os comandos

Abra o Terminal, entre nesta pasta (`n8n`) e rode:

```bash
docker compose up -d
```

Espere um minuto na primeira vez, porque ele está baixando o n8n. Depois abra:

**<http://localhost:5678>**

Na primeira visita ele pede para você criar um usuário. Esse usuário fica só na
sua máquina; não é uma conta na internet.

### Para desligar

```bash
docker compose down
```

Seus fluxos **não** se perdem. Eles ficam guardados num volume do Docker
(`n8n_dados`), configurado no `docker-compose.yml`. Da próxima vez que você
subir, está tudo lá.

Se quiser apagar tudo de propósito, aí sim:

```bash
docker compose down -v
```

### Se der erro de porta ocupada

Alguma outra coisa já está usando a porta 5678. Abra o `docker-compose.yml` e
troque o número da **esquerda**:

```yaml
ports:
  - "5679:5678"
```

Depois acesse <http://localhost:5679>.

---

## Exemplo 1: avisar quem acompanha no WhatsApp quando aparece um alerta novo

**A dor:** quem cuida só descobre que o dia mudou quando lembra de abrir o app.

**A automação:**

```text
[Webhook]  →  [Filtro]  →  [Enviar WhatsApp]
   ↑              ↑                ↑
a API avisa    só passa se       a mensagem chega
que nasceu     o alerta ainda    no celular de
um alerta      não foi lido      quem acompanha
```

**Como montar:**

1. No n8n, clique em **Create Workflow**
2. Adicione o nó **Webhook**. Ele te dá uma URL, tipo
   `http://localhost:5678/webhook/alerta-novo`. Essa URL é o "telefone" da sua
   automação: quem ligar nele dispara o fluxo
3. Copie a URL e cole no `.env.local` do projeto, na variável `N8N_WEBHOOK_URL`
4. Adicione o nó **Filter** e configure: só continuar se `lido` for `false`.
   Sem isso, marcar um alerta como novo de novo mandaria outra mensagem
5. Adicione o nó de **WhatsApp** e escreva uma mensagem curta e calma, por
   exemplo: *"O CareTwin percebeu uma mudança no dia de {{ $json.nome }}. O
   resumo está no app."* Nada de número de saúde na mensagem: ela pode ser lida
   na tela bloqueada do celular
6. Clique em **Test workflow**, depois em **Active** no canto superior direito

**Falta a última peça:** quem chama esse webhook é a API do CareTwin, quando um
alerta nasce. O lugar dessa chamada está descrito no
[`PROXIMOS-PASSOS.md`](../PROXIMOS-PASSOS.md).

---

## Exemplo 2: o resumo do dia por e-mail, no fim da tarde

**A dor:** quem acompanha quer ler o dia com calma, sem precisar lembrar de abrir
o app todo dia.

**A automação:**

```text
[Agendar às 19h]  →  [Pedir o resumo à API]  →  [Enviar e-mail]
       ↑                      ↑                        ↑
 todo dia, no fim     a API devolve o texto      chega na caixa de
 da tarde             do resumo de cada pessoa   quem acompanha
```

**Como montar:**

1. Nó **Schedule Trigger**: todo dia, às 19h (o fuso de São Paulo já está
   configurado no `docker-compose.yml`)
2. Nó **HTTP Request**: pede à API do CareTwin o resumo do dia de cada pessoa
3. Nó **Send Email**: escreve o resumo para quem acompanha cada pessoa

O e-mail não substitui o app: ele lembra que o resumo está lá. Mudança de
verdade continua sendo vista com calma, na tela de alertas.

---

## Dicas para não se perder

- **Comece com dois nós.** Webhook + uma ação. Funcionou? Aí adicione o
  terceiro. Fluxo grande montado de uma vez é impossível de depurar.
- **Use o botão "Test workflow" o tempo todo.** Cada nó mostra exatamente o que
  entrou e o que saiu dele. É o melhor jeito de entender o que está acontecendo.
- **Fluxo só roda quando está "Active".** No modo de teste ele espera uma
  execução manual e depois desliga.
- **Credencial fica no n8n, não no código.** Ao conectar Gmail ou WhatsApp, o
  n8n guarda o acesso dele mesmo. Não copie chave nenhuma para arquivo do
  projeto.
- **Nunca coloque senha de verdade no `docker-compose.yml`.** Esse arquivo vai
  para o GitHub. Valor sensível mora no `.env.local`, que não vai.

---

## Para aprender mais

- Documentação oficial: <https://docs.n8n.io>
- Fluxos prontos para copiar: <https://n8n.io/workflows>
- Como funciona o nó Webhook: <https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/>
