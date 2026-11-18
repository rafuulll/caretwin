-- =============================================================================
-- CARETWIN: DADOS BRUTOS EM TEMPO REAL (PÁGINA /ao-vivo)
-- =============================================================================
--
-- Como rodar: no SQL Editor do Supabase, cole o arquivo inteiro e execute UMA
-- vez, depois da 0007. Não precisa de extensão nenhuma.
--
-- O que é: o modo ao vivo da pulseira (segurar o botão A por 2 segundos) manda,
-- a cada segundo, um lote com as leituras brutas do MPU-6050 (acelerômetro e
-- giroscópio, 50 por segundo), os batimentos e o sinal infravermelho do
-- MAX30102. A página /ao-vivo lê esses lotes e desenha os gráficos.
--
-- Estes dados NÃO são o histórico da pessoa (esse mora em `dias`). São uma
-- janela curta, só para ver o aparelho funcionando: cada pulseira guarda os
-- últimos 10 minutos, e o servidor apaga o resto a cada lote novo que recebe.
-- Um lote é uma linha só (até 100 leituras dentro de um jsonb) em vez de uma
-- linha por leitura: 50 leituras por segundo viram 1 escrita por segundo.
--
-- Unidades, iguais às do contrato (docs/openapi.yaml, /v1/device/raw):
--   imu: [[ax, ay, az, gx, gy, gz], ...]
--        ax, ay, az em milésimos de g (1000 = 1 g, a gravidade parada)
--        gx, gy, gz em décimos de grau por segundo (100 = 10 graus/s)
--   ir:  um valor do sensor infravermelho (0 a 262143) por leitura do imu
--
-- Quem vê: só a rota pública GET /api/publico/ao-vivo, e só das pulseiras
-- listadas em PULSEIRAS_PUBLICAS (as de demonstração). O RLS fica ligado sem
-- nenhuma regra, como nas outras tabelas: o app lê pela conexão do servidor.
-- =============================================================================

create table ao_vivo_lotes (
  id          bigint generated always as identity primary key,
  pulseira_id uuid not null references pulseiras (id) on delete cascade,
  recebido_em timestamptz not null default now(),
  -- A hora da primeira leitura do lote, pelo relógio da pulseira. Vazia quando
  -- o relógio dela ainda não acertou pela rede.
  ts          timestamptz,
  taxa_hz     smallint not null check (taxa_hz between 1 and 200),
  passos_hoje integer check (passos_hoje between 0 and 60000),
  -- Vazio quando não há dedo no sensor.
  bpm         smallint check (bpm between 30 and 220),
  imu         jsonb not null check (jsonb_typeof(imu) = 'array' and jsonb_array_length(imu) between 1 and 100),
  ir          jsonb check (ir is null or (jsonb_typeof(ir) = 'array' and jsonb_array_length(ir) between 1 and 100))
);

-- A página pede "o que chegou depois do lote N" a cada segundo.
create index ao_vivo_por_pulseira on ao_vivo_lotes (pulseira_id, id);
-- A limpeza dos lotes velhos de uma pulseira.
create index ao_vivo_por_hora on ao_vivo_lotes (pulseira_id, recebido_em);

alter table ao_vivo_lotes enable row level security;
