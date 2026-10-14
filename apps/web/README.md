# apps/web: site e app do CareTwin

O CareTwin acompanha o dia de uma pessoa pela pulseira e avisa, em palavras simples, quando os passos, o sono ou os batimentos fogem do normal **dela**. Esta pasta tem o site de apresentação e o app (PWA) que a família ou a própria pessoa usa.

Dono: Rafael (produto, UX e frontend). Cartões no Trello: lista 7.x.

## Como rodar

Precisa do Node.js 20 ou mais novo.

```bash
cd apps/web
npm install
npm run dev
```

Abra http://localhost:3000. Para testar como vai ficar no ar (com o modo offline ligado):

```bash
npm run build
npm start
```

Outros comandos: `npm run lint` e `npm run typecheck`.

Nesta versão não precisa de API, banco nem conta: o app abre com duas pessoas de exemplo (Dona Cida e Seu Jorge) e 21 dias de dados que se renovam a cada dia. Para entrar, qualquer e-mail ou nome e qualquer senha servem. A senha não é guardada em lugar nenhum.

## O que tem pronto

Site (público)
- `/` página de apresentação, com o tour da primeira visita
- `/entrar` entrada com e-mail ou nome e o botão do Google (abre o passo a passo de como ligar)
- `/como-usar` guia curto para quem vai usar e para quem vai ligar as partes

App (depois de entrar)
- `/app/hoje` resumo do dia: passos comparados com o normal até este horário, a noite, os batimentos, o estado da pulseira e o resumo escrito
- `/app/sono` noite estimada a partir do movimento (actigrafia), com 14 noites e o horário de costume
- `/app/batimentos` medição guiada de 12 segundos e o histórico com a faixa de costume
- `/app/alertas` avisos do que fugiu do normal, agrupados por dia, com marcar como lido
- `/app/ajustes` pessoas e pulseiras, tema claro ou escuro, texto grande, perfil e dados de exemplo
- `/app/primeiro-uso` assistente de 3 passos para cadastrar uma pessoa e a pulseira dela

Também: funciona offline depois da primeira visita (service worker), pode ser instalado como app no celular, tem tema escuro e modo de texto grande, e passou na auditoria automática de acessibilidade (axe, WCAG 2.2 AA) em todas as rotas, no claro, no escuro e no celular.

## Como o "normal de cada um" é calculado

Fica em `src/lib/normal.ts`, com os números em `src/lib/modelo.ts` (`REGRAS_NORMAL`):

1. Pega os 14 dias anteriores da pessoa (precisa de pelo menos 5).
2. A faixa normal vai do percentil 20 ao percentil 80 desses dias, com 10% de margem para cada lado.
3. Um dia vira alerta quando passa da faixa por mais de 10%.
4. Os passos de hoje são comparados com o "normal até este horário", usando uma curva de quanto se anda em cada hora do dia.

O sono é estimado em `src/lib/sono.ts` a partir das contagens de movimento por minuto, das 20:00 às 10:00 (840 minutos).

Essa lógica é a referência para o Lucas no módulo `ai/` (linha de base). Quando a API estiver pronta, o cálculo passa a vir de lá e esta versão continua como reserva e para os testes.

## Estrutura

```
src/
  app/                rotas (App Router do Next.js)
  components/
    ui/               botões, campos, diálogos, selos, alternador, anúncios para leitor de tela
    graficos/         gráficos em SVG, cada um com tabela acessível e leitura por teclado
    app/              casca do app (menus, barra superior) e as telas em app/telas
    marketing/        seções do site
    auth/             entrada e o passo a passo do Google
    onboarding/       tour da primeira visita (driver.js)
    pwa/              registro do service worker
  content/            todos os textos do produto (site.ts, app.ts, ia.ts, tour.ts)
  lib/                tipos, regras do normal, sono, dados de exemplo, armazenamento, formatação
public/sw.js          service worker (modo offline)
design-system/        o sistema de design gerado pela skill ui-ux-pro-max
```

Regra da casa: texto que aparece na tela fica em `src/content`, nunca dentro do componente. Cor sai sempre dos tokens em `src/app/globals.css`, nunca hex direto.

## Onde os dados ficam agora

Tudo fica no `localStorage` do navegador (`src/lib/store.ts`), em três chaves: `caretwin:dados:v1`, `caretwin:sessao:v1` e `caretwin:preferencias:v1`. Em Ajustes dá para restaurar os exemplos ou apagar tudo.

## Como ligar as partes de verdade depois

API (Fabrício)
1. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_API_URL`.
2. Gere os tipos do contrato: `npx openapi-typescript ../../docs/openapi.yaml -o src/lib/api.d.ts`.
3. Troque as funções de `src/lib/store.ts` (as telas só chamam essas funções e os hooks `useDados`, `useSessao` e `usePreferencias`, então nenhuma tela precisa mudar). `sincronizarAgora` faz hoje o papel do `POST /v1/device/live`.

Login com Google (Supabase Auth)
O passo a passo completo está dentro do app, no botão "Entrar com Google" da tela de entrada. Depois de criar o projeto no Supabase, preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` e troque a função `entrar` do `store.ts`.

Resumos escritos pela IA (Lucas)
Os resumos de hoje usam modelos de texto com os números reais do dia (`src/content/ia.ts`). Quando a API chamar a IA local (Ollama), o texto vem dela e esses modelos ficam como reserva. O passo a passo está no botão "Como ligar" do cartão de resumo.

## Deploy

Na Vercel, com Root Directory `apps/web`. Nada foi publicado ainda.

## Mais detalhes

- `DECISOES.md`: por que cada escolha foi feita e o que mudou em relação ao plano inicial
- `design-system/caretwin/MASTER.md`: o sistema de design gerado pela skill, com as adaptações anotadas no DECISOES.md
- `AGENTS.md`: regras para quem for editar com ajuda de IA
