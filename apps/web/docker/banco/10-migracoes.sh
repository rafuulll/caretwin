#!/bin/sh
# Roda, em ordem, todas as migrações de banco/migracoes/ no banco novo.
# A imagem do Postgres executa este arquivo uma vez, só quando o volume de
# dados ainda está vazio (docker-entrypoint-initdb.d).
set -eu

for arquivo in /migracoes/*.sql; do
  echo "migração: $(basename "$arquivo")"
  # `create extension pg_cron` não existe aqui; o 00-supabase-falso.sql já
  # criou o `cron` de mentira. Tirar essa linha é a única diferença do Supabase.
  # O tr tira o fim de linha do Windows (\r), caso o git tenha convertido o arquivo.
  tr -d '\r' < "$arquivo" | sed '/^create extension if not exists pg_cron;/d' |
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -q
done
