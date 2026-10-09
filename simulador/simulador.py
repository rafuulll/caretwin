"""Simulador da pulseira CareTwin.

Gera os mesmos dados que a pulseira envia (contrato v1, ver docs/openapi.yaml) e manda para
uma API, sem precisar do ESP32 nem do Wokwi. Serve para o backend (rotas, validacao, banco),
para a IA (testar a linha de base com cenarios conhecidos) e para o front (dados reais na tela).
So usa a biblioteca padrao do Python 3.9+, nao precisa instalar nada.

Exemplos (a partir da raiz do repositorio):

  # 1) subir a API falsa em um terminal
  python simulador/mock_api.py

  # 2) em outro terminal, enviar 14 dias de um usuario normal
  python simulador/simulador.py --url http://localhost:8080

  # 3) testar a regra de baseline: ultimos 3 dias bem abaixo da media
  python simulador/simulador.py --url http://localhost:8080 --cenario queda

  # 4) so gerar os JSONs em uma pasta (para pytest, Postman, curl)
  python simulador/simulador.py --salvar simulador/saida --cenario normal

  # 5) modo ao vivo: 10 envios de /v1/device/live, um a cada 5 s
  python simulador/simulador.py --url http://localhost:8080 --ao-vivo 10

Cenarios: normal, queda, aumento, sedentario, poucos_dias, falhas, invalidos.
"""
import argparse
import datetime as dt
import json
import os
import random
import sys
import time
import urllib.error
import urllib.request

FUSO = dt.timezone(dt.timedelta(hours=-3))  # mesmo fuso do firmware (TZ_OFFSET_S)
MINUTOS_NOITE = 840  # janela das 20:00 as 10:00
MAX_DIAS_POR_ENVIO = 7  # tamanho da fila da pulseira
SEM_DADO = None  # no JSON, minuto sem dado vai como null

CENARIOS = {
    "normal": "usuario estavel, cerca de 7000 passos por dia",
    "queda": "7000 passos por dia e os 3 ultimos dias cerca de 40% abaixo (deve disparar o alerta de baseline)",
    "aumento": "7000 passos por dia e os 3 ultimos dias cerca de 40% acima",
    "sedentario": "cerca de 2500 passos por dia",
    "poucos_dias": "so 3 dias de dados (abaixo do minimo de 5 dias validos da regra de baseline)",
    "falhas": "dias zerados e noites com buracos de dados (sensor soltou ou bateria acabou)",
    "invalidos": "dados normais mais registros que a API deve RECUSAR (passos negativos, data ruim, noite incompleta)",
}


def passos_do_dia(cenario, i, n, rng):
    base, desvio = 7000, 700
    if cenario == "sedentario":
        base, desvio = 2500, 400
    if cenario == "queda" and i >= n - 3:
        base = 4200
    if cenario == "aumento" and i >= n - 3:
        base = 9800
    passos = max(0, int(rng.gauss(base, desvio)))
    if cenario == "falhas" and rng.random() < 0.25:
        passos = 0
    return passos


def minutos_ativos(passos, rng):
    return max(0, min(1440, int(passos / 105 + rng.gauss(0, 4))))


def gerar_noite(cenario, rng):
    """840 contagens de atividade por minuto. Dorme entre o minuto 150 e o 630 (22:30 a 06:30)."""
    counts = []
    for m in range(MINUTOS_NOITE):
        if 150 <= m < 630:
            v = rng.randint(15, 90) if rng.random() < 0.04 else rng.choice([0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3])
        else:
            v = rng.randint(5, 140)
        counts.append(v)
    if cenario == "falhas" and rng.random() < 0.6:
        ini = rng.randint(0, 500)
        for m in range(ini, min(MINUTOS_NOITE, ini + rng.randint(120, 500))):
            counts[m] = SEM_DADO
    return counts


def montar_dados(cenario, dias, data_final, rng):
    """Devolve (lista de dias, lista de noites) em ordem cronologica."""
    n = 3 if cenario == "poucos_dias" else dias
    registros_dia, noites = [], []
    for i in range(n):
        data = data_final - dt.timedelta(days=(n - 1 - i))
        passos = passos_do_dia(cenario, i, n, rng)
        registros_dia.append({"date": data.isoformat(), "steps": passos,
                              "active_minutes": minutos_ativos(passos, rng)})
        noites.append({"night_date": data.isoformat(),
                       "window_start": data.isoformat() + "T20:00:00-03:00",
                       "counts": gerar_noite(cenario, rng)})
    return registros_dia, noites


def lotes_diarios(registros, rng):
    lotes = []
    for k in range(0, len(registros), MAX_DIAS_POR_ENVIO):
        pedaco = registros[k:k + MAX_DIAS_POR_ENVIO]
        lotes.append({"firmware": "0.2.0-sim", "battery_pct": rng.randint(20, 100), "days": pedaco})
    return lotes


def requisicoes_invalidas(data_final):
    """Cada item: (rota, corpo, descricao do que a API deve fazer)."""
    return [
        ("/v1/device/daily",
         {"firmware": "0.2.0-sim", "battery_pct": 50,
          "days": [{"date": data_final.isoformat(), "steps": -5, "active_minutes": 3}]},
         "passos negativos: deve ir para rejected"),
        ("/v1/device/daily",
         {"firmware": "0.2.0-sim", "battery_pct": 50,
          "days": [{"date": data_final.isoformat(), "steps": 999999, "active_minutes": 3}]},
         "passos impossiveis (acima de 60000): deve ir para rejected"),
        ("/v1/device/daily",
         {"firmware": "0.2.0-sim", "battery_pct": 50,
          "days": [{"date": "20-10-2026", "steps": 1000, "active_minutes": 9}]},
         "data fora do formato AAAA-MM-DD: deve ir para rejected"),
        ("/v1/device/nights",
         {"night_date": data_final.isoformat(), "window_start": data_final.isoformat() + "T20:00:00-03:00",
          "counts": [1] * 100},
         "noite com 100 valores em vez de 840: deve ser recusada"),
        ("/v1/device/live", {"steps_today": -1, "ts": None},
         "passos negativos no ao vivo: deve ser recusado (400 ou 422)"),
    ]


def salvar(pasta, nome, corpo):
    os.makedirs(pasta, exist_ok=True)
    caminho = os.path.join(pasta, nome)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(corpo, f, ensure_ascii=False)
    return caminho


def enviar(url_base, token, rota, corpo):
    dados = json.dumps(corpo).encode("utf-8")
    req = urllib.request.Request(url_base.rstrip("/") + rota, data=dados, method="POST", headers={
        "Content-Type": "application/json",
        "Authorization": "Device " + token,
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except (urllib.error.URLError, OSError) as e:
        return None, "sem conexao com a API: {}".format(e)


def main():
    p = argparse.ArgumentParser(description="Simulador da pulseira CareTwin (contrato v1)",
                                formatter_class=argparse.RawDescriptionHelpFormatter,
                                epilog="Cenarios:\n" + "\n".join("  {:12} {}".format(k, v) for k, v in CENARIOS.items()))
    p.add_argument("--url", help="URL base da API, ex.: http://localhost:8080 (sem isso, so mostra um resumo)")
    p.add_argument("--token", default="sim-token-nao-secreto", help="token de dispositivo (cabecalho Authorization: Device <token>)")
    p.add_argument("--cenario", default="normal", choices=sorted(CENARIOS))
    p.add_argument("--dias", type=int, default=14, help="quantos dias gerar (padrao 14)")
    p.add_argument("--data-final", help="ultimo dia, AAAA-MM-DD (padrao: hoje)")
    p.add_argument("--semente", type=int, default=42, help="semente aleatoria; mesma semente gera os mesmos dados")
    p.add_argument("--salvar", metavar="PASTA", help="grava os JSONs na pasta em vez de (ou alem de) enviar")
    p.add_argument("--ao-vivo", type=int, metavar="N", help="envia N vezes /v1/device/live e sai")
    p.add_argument("--intervalo", type=float, default=5.0, help="segundos entre envios ao vivo (padrao 5)")
    a = p.parse_args()

    rng = random.Random(a.semente)
    data_final = dt.date.fromisoformat(a.data_final) if a.data_final else dt.datetime.now(FUSO).date()

    if a.ao_vivo:
        if not a.url:
            sys.exit("--ao-vivo precisa de --url")
        passos = 0
        for k in range(a.ao_vivo):
            passos += rng.randint(5, 12)
            corpo = {"steps_today": passos, "ts": dt.datetime.now(FUSO).isoformat(timespec="seconds")}
            status, resp = enviar(a.url, a.token, "/v1/device/live", corpo)
            print("live", corpo, "->", status, resp)
            if k < a.ao_vivo - 1:
                time.sleep(a.intervalo)
        return

    registros, noites = montar_dados(a.cenario, a.dias, data_final, rng)
    lotes = lotes_diarios(registros, rng)
    extras = requisicoes_invalidas(data_final) if a.cenario == "invalidos" else []

    print("cenario: {} ({})".format(a.cenario, CENARIOS[a.cenario]))
    print("{} dias de {} a {}, {} lote(s) diario(s), {} noite(s)".format(
        len(registros), registros[0]["date"], registros[-1]["date"], len(lotes), len(noites)))
    print("passos por dia:", [r["steps"] for r in registros])

    if a.salvar:
        for k, lote in enumerate(lotes, 1):
            salvar(a.salvar, "daily_{:02d}.json".format(k), lote)
        for noite in noites:
            salvar(a.salvar, "night_{}.json".format(noite["night_date"]), noite)
        salvar(a.salvar, "live.json", {"steps_today": registros[-1]["steps"], "ts": data_final.isoformat() + "T15:00:00-03:00"})
        for k, (rota, corpo, desc) in enumerate(extras, 1):
            salvar(a.salvar, "invalido_{:02d}_{}.json".format(k, rota.rsplit("/", 1)[1]), corpo)
        print("JSONs gravados em", a.salvar)

    if not a.url:
        if not a.salvar:
            print("(nada enviado: use --url para enviar ou --salvar para gravar os JSONs)")
        return

    falhas = 0
    for lote in lotes:
        status, resp = enviar(a.url, a.token, "/v1/device/daily", lote)
        print("daily  ({} dias) -> {} {}".format(len(lote["days"]), status, resp))
        falhas += 0 if status == 200 else 1
    for noite in noites:
        status, resp = enviar(a.url, a.token, "/v1/device/nights", noite)
        print("night  {} -> {} {}".format(noite["night_date"], status, resp))
        falhas += 0 if status == 200 else 1
    for rota, corpo, desc in extras:
        status, resp = enviar(a.url, a.token, rota, corpo)
        print("INVALIDO {} ({}) -> {} {}".format(rota, desc, status, resp))
    if falhas:
        print("{} envio(s) validos nao retornaram 200".format(falhas))
        sys.exit(1)


if __name__ == "__main__":
    main()
