-- =============================================================================
-- CARETWIN: AS TABELAS DO BANCO (SUPABASE)
-- =============================================================================
--
-- Como rodar: no painel do Supabase, abra o SQL Editor, cole o arquivo inteiro
-- e execute UMA vez. Migração nova vira um arquivo novo nesta pasta
-- (0002_..., 0003_...), nunca uma edição neste.
--
-- Seis tabelas. O e-mail e a senha de quem entra NÃO ficam aqui: ficam no
-- Supabase Auth (auth.users), que guarda a senha com segurança, confirma o
-- e-mail e cuida do "esqueci minha senha". Quando o login com Google entrar,
-- ele cai na mesma auth.users e nada daqui muda.
--
-- Todo acesso aos dados passa pelo backend do Next.js. O navegador nunca fala
-- direto com o banco.
-- =============================================================================


-- Quem entra no app. Uma linha por conta do Supabase Auth.
create table usuarios (
  id        uuid primary key references auth.users (id) on delete cascade,
  nome      text not null,
  criado_em timestamptz not null default now()
);

-- Quem usa a pulseira. Nasce quando a família digita o código da pulseira.
-- cadastrada_por é quem fez isso: ele e a própria pessoa administram a
-- família, ou seja, aprovam quem pede para entrar e removem cuidadores.
create table pessoas (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  cadastrada_por uuid references usuarios (id) on delete set null,
  criado_em      timestamptz not null default now()
);

-- O aparelho. Cadastrado por nós antes da entrega, com o código impresso atrás
-- e o hash do token que o firmware usa para se identificar. pessoa_id fica
-- vazio até a família digitar o código. Uma pulseira por pessoa.
create table pulseiras (
  id                   uuid primary key default gen_random_uuid(),
  codigo               text not null unique check (codigo ~ '^CT-[A-Z0-9]{4}$'),
  token_hash           text not null unique,
  pessoa_id            uuid unique references pessoas (id) on delete set null,
  bateria              integer check (bateria between 0 and 100),
  ultima_sincronizacao timestamptz,
  criado_em            timestamptz not null default now()
);

-- Quem vê qual pessoa. Uma linha por usuário e pessoa.
--   papel:    cuidador (família) ou acompanhada (a própria pessoa)
--   aprovado: falso enquanto o pedido de entrada espera a família aprovar
-- Sair da família apaga a linha. Os dias e alertas ficam, porque pertencem à
-- pessoa, não a quem saiu.
create table vinculos (
  usuario_id uuid not null references usuarios (id) on delete cascade,
  pessoa_id  uuid not null references pessoas (id) on delete cascade,
  papel      text not null check (papel in ('cuidador', 'acompanhada')),
  aprovado   boolean not null default false,
  criado_em  timestamptz not null default now(),
  primary key (usuario_id, pessoa_id)
);

-- Só uma conta aprovada como "a própria pessoa". Pedidos pendentes podem ser
-- vários: a família aprova o certo e recusa o resto.
create unique index uma_acompanhada_por_pessoa
  on vinculos (pessoa_id)
  where papel = 'acompanhada' and aprovado;

-- O que a pulseira contou num dia. O dia pertence à pulseira primeiro (ela
-- manda dados antes de a pessoa existir) e ganha a pessoa quando a família
-- liga o código. noite guarda {"inicio": ..., "contagens": [840 valores]},
-- o mesmo formato que o site já usa.
create table dias (
  id             uuid primary key default gen_random_uuid(),
  pulseira_id    uuid not null references pulseiras (id) on delete cascade,
  pessoa_id      uuid references pessoas (id) on delete cascade,
  data           date not null,
  passos         integer check (passos between 0 and 60000),
  minutos_ativos integer check (minutos_ativos >= 0),
  noite          jsonb check (noite is null or jsonb_array_length(noite -> 'contagens') = 840),
  unique (pulseira_id, data)
);

create index dias_por_pessoa on dias (pessoa_id, data);

-- Os avisos de mudança, criados pelo backend. Um por pessoa, dia e métrica,
-- para o recálculo nunca repetir o mesmo aviso. "lido" vale para a família toda.
create table alertas (
  id        uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references pessoas (id) on delete cascade,
  data      date not null,
  metrica   text not null check (metrica in ('passos', 'sono', 'batimentos')),
  direcao   text not null check (direcao in ('abaixo', 'acima')),
  desvio    integer not null,
  texto     text not null,
  lido      boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (pessoa_id, data, metrica)
);

-- O Supabase publica toda tabela do schema public numa API automática. Ligar a
-- RLS sem nenhuma regra fecha essa porta para quem vem de fora. O backend se
-- conecta como dono das tabelas e continua lendo e gravando normalmente.
alter table usuarios  enable row level security;
alter table pessoas   enable row level security;
alter table pulseiras enable row level security;
alter table vinculos  enable row level security;
alter table dias      enable row level security;
alter table alertas   enable row level security;
