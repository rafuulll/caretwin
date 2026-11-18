-- =============================================================================
-- SÓ PARA O DOCKER: A PESSOA DE DEMONSTRAÇÃO
-- =============================================================================
--
-- Cria a pulseira CT-DM01 da "Dona Helena", com 30 dias de passos e noites
-- inventados, e um alerta. É o que faz a página /demo abrir com gráfico no
-- primeiro `docker compose up`. Os dados são sorteados (sempre os mesmos, a
-- semente é fixa) e não pertencem a ninguém.
--
-- O token da pulseira, `token-de-demonstracao`, é público de propósito: o
-- simulador do compose usa ele para mandar dados ao vivo. Isto só existe no
-- Docker local; nunca rode este arquivo num banco de verdade.
-- =============================================================================

do $$
declare
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  pessoa uuid;
  pulseira uuid;
  d date;
  i int;
  passos int;
  inicio int;
  fim int;
  contagens jsonb;
begin
  perform setseed(0.42);

  insert into pessoas (nome) values ('Dona Helena') returning id into pessoa;
  insert into pulseiras (codigo, token_hash, pessoa_id, bateria, ultima_sincronizacao)
  values ('CT-DM01', encode(sha256('token-de-demonstracao'::bytea), 'hex'), pessoa, 78, now() - interval '12 minutes')
  returning id into pulseira;

  for i in 1..30 loop
    d := hoje - i;
    passos := case i
      when 1 then 3900
      when 2 then 4100
      else 6800 + floor((random() - 0.5) * 1400)::int
    end;
    inicio := 120 + floor(random() * 30)::int;  -- dorme entre 22h00 e 22h30
    fim := 620 + floor(random() * 40)::int;     -- acorda entre 6h20 e 7h00
    select jsonb_agg(
      case
        when m >= inicio and m < fim then
          case
            when random() < 0.008 then 15 + floor(random() * 45)::int
            when random() < 0.75 then 0
            else 1 + floor(random() * 3)::int
          end
        else 5 + floor(random() * 135)::int
      end
      order by m
    )
    into contagens
    from generate_series(0, 839) as m;

    insert into dias (pulseira_id, pessoa_id, data, passos, minutos_ativos, noite)
    values (
      pulseira, pessoa, d, passos, passos / 105,
      jsonb_build_object('inicio', to_char(d - 1, 'YYYY-MM-DD') || 'T20:00:00-03:00', 'contagens', contagens)
    );
  end loop;

  insert into alertas (pessoa_id, data, metrica, direcao, desvio, texto)
  values (
    pessoa, hoje - 1, 'passos', 'abaixo', 40,
    'Dona Helena andou menos nos últimos dias: foram 3.900 passos no dia mais recente, e o normal dela fica perto de 6.800. Vale observar os próximos dias com calma.'
  );
end $$;
