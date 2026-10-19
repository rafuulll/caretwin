# Como trabalhamos

## Branches

1. A branch `main` e a versao oficial: tudo que entra nela vai para producao na Vercel. Ninguem faz push direto nela; tudo entra por pull request.
2. Antes de comecar, atualize a main e crie uma branch curta a partir dela:

   ```bash
   git switch main
   git pull
   git switch -c web/nome-curto-da-mudanca
   ```

3. O nome da branch comeca pela area:

   | Prefixo | Area | Exemplo |
   | --- | --- | --- |
   | `web/` | Telas do site e do app | `web/ligar-pulseira` |
   | `api/` | Rotas em `apps/web/src/app/api` e regras em `src/lib` | `api/vinculos` |
   | `banco/` | Migracoes em `apps/web/banco/migracoes` | `banco/tentativas-de-codigo` |
   | `ai/` | Linha de base e textos | `ai/baseline-sono` |
   | `fw/` | Firmware da pulseira | `fw/display-st7789` |
   | `docs/` | Documentacao e contrato | `docs/contrato-v02` |

## Commits

Mensagem curta, em portugues, sem acento, no formato `area: o que mudou (cartao X.Y)`. Exemplos reais do historico:

```
banco: encerramento com 30 dias e tarefa diaria que apaga de vez
api: vinculos, pedidos e encerramento nas rotas /api/v1 (cartao 5.9)
web: login com e-mail e senha pelo Supabase Auth (cadastro, entrar e nova senha)
docs: contrato da API v0.2 (login por e-mail e vinculos por pedido)
```

Prefira commits pequenos, um assunto por commit. Uma migracao nova e o codigo que depende dela podem ir no mesmo PR, em commits separados.

## Pull requests

1. Antes de abrir, rode dentro de `apps/web`:

   ```bash
   npx tsc --noEmit -p .   # confere os tipos
   npm run lint            # confere o padrao do codigo
   npm run build           # confere que compila como na Vercel
   ```

2. Abra o PR para a `main`. O titulo segue o mesmo formato do commit. O corpo usa o modelo de [.github/pull_request_template.md](.github/pull_request_template.md) e traz o link do cartao do Trello.
3. A Vercel cria um link de preview so daquele PR. Teste por ele antes do merge.
4. Peca a revisao de outra pessoa do grupo (front revisa API, API revisa IA e assim por diante).
5. Depois do merge, a Vercel publica sozinha. Mova o cartao no Trello e apague a branch.

## Banco de dados (migracoes)

O banco e criado pelos arquivos de `apps/web/banco/migracoes`, rodados em ordem no SQL Editor do Supabase.

- Cada arquivo roda uma vez. Um arquivo que ja rodou nunca e editado: mudanca nova vira o proximo numero (0006, 0007...).
- Teste a migracao num projeto de teste do Supabase antes de rodar na producao.
- Pense na ordem com o deploy. Migracao que acrescenta coisas roda antes do merge; migracao que tira algo que o codigo antigo usa roda depois do deploy novo estar no ar (foi o caso da 0005).
- `apps/web/banco/dev/pulseiras-de-teste.sql` cria pulseiras com tokens conhecidos. Nunca rode no banco de producao com gente de verdade.

## Segredos

- Nunca coloque chaves, senhas ou URLs privadas no codigo. Use variaveis de ambiente.
- Cada app tem um `.env.example` com os NOMES das variaveis. Os valores ficam no `.env.local` (ignorado pelo Git) e no painel da Vercel.
- A Secret key do Supabase nunca entra no projeto. O app usa so a Publishable key e a `DATABASE_URL`.
- Se um segredo vazar, troque na hora no painel do servico e avise o grupo. Trocar o `AUTH_SECRET` derruba todas as sessoes, o que e o esperado.

## Contrato primeiro (contract first)

O arquivo [docs/openapi.yaml](docs/openapi.yaml) descreve a API e e escrito a mao (versao 0.2). Quem muda uma rota muda o contrato no mesmo PR.

- A pulseira usa os caminhos `/v1/device/*`. Mudanca incompativel vira `v2`; a `v1` nao muda.
- Respostas de erro sempre no formato `{ "erro", "codigo", "quando" }`. A tela escolhe a frase pelo `codigo`, nunca mostra o texto do servidor.

## Testar

- Sem a pulseira: o simulador em `simulador/` gera os dados que ela mandaria. Ao mudar o contrato da pulseira, atualize tambem `simulador/mock_api.py` e `simulador/simulador.py`.
- Familia com varias contas: use um navegador diferente para cada conta (Chrome, Edge, Firefox). O login fica num cookie de cada navegador.
- Contas de teste: crie no Supabase em Authentication, Users, "Add user", marcando a confirmacao automatica do e-mail.

## Ambientes

| Ambiente | Site | Banco |
| --- | --- | --- |
| Local | `npm run dev` em http://localhost:3000 | Nenhum (modo prototipo) ou um projeto de teste do Supabase |
| Preview | Link da Vercel de cada PR | O mesmo da producao, se as variaveis estiverem em Preview |
| Producao | https://caretwin-omega.vercel.app, com Deployment Protection | Projeto `caretwin` no Supabase |

## Regras do codigo do site

As regras de `apps/web` estao em [apps/web/AGENTS.md](apps/web/AGENTS.md). As principais: todo texto visivel mora em `src/content/site.ts`, nenhuma cor e escrita na mao, e nenhuma tela le ou grava dados por fora de `src/lib/store.ts`.

## Regra para a IA

A linha de base (estatistica) faz a analise de verdade. O modelo de linguagem so escreve o texto em portugues a partir dos numeros, sem diagnostico e sem alarme. Veja [ai/README.md](ai/README.md).

## Integracao semanal

Uma vez por semana (sugestao: sabado) o grupo junta tudo, roda de ponta a ponta (pulseira simulada, API, site) e anota o que quebrou no Trello.
