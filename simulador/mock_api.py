"""API falsa do CareTwin, para testar a pulseira e o simulador sem o backend real.

Implementa o contrato v1 (docs/openapi.yaml) com validacao simples e guarda tudo na memoria.
Serve de referencia do comportamento esperado: quando a API real (apps/api) estiver pronta,
ela deve responder igual a esta.

Uso (a partir da raiz do repositorio):
  python simulador/mock_api.py              # porta 8080
  python simulador/mock_api.py --porta 9000

Rotas:
  GET  /health                 200 {"status": "ok"}
  GET  /v1/debug/recebidos     tudo que chegou (so nesta API falsa)
  POST /v1/device/daily        200 {"accepted": [datas], "rejected": [datas]}
  POST /v1/device/nights       200 {"accepted": [night_date], "rejected": [night_date]}
  POST /v1/device/live         200 {"accepted": [], "rejected": []}  (422 se o corpo for invalido)
  Sem cabecalho "Authorization: Device <token>" a resposta e 401.

Usando com a pulseira:
- Placa real na mesma rede Wi-Fi: API_BASE_URL = "http://<ip-do-computador>:8080" (firmware/include/config.h).
- Wokwi: so com o gateway privado (plano pago), API_BASE_URL = "http://host.wokwi.internal:8080".
  Com o gateway gratuito o Wokwi nao alcanca o seu computador; use o simulador deste diretorio.
"""
import argparse
import datetime as dt
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

RECEBIDOS = {"daily": [], "nights": [], "live": []}


def data_valida(texto):
    try:
        dt.date.fromisoformat(texto)
        return isinstance(texto, str) and len(texto) == 10
    except (TypeError, ValueError):
        return False


def inteiro(v):
    return isinstance(v, int) and not isinstance(v, bool)


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body):
        data = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            return self._send(200, {"status": "ok"})
        if self.path == "/v1/debug/recebidos":
            return self._send(200, {k: len(v) for k, v in RECEBIDOS.items()} | {"dados": RECEBIDOS})
        return self._send(404, {"title": "rota desconhecida"})

    def do_POST(self):
        if not self.headers.get("Authorization", "").startswith("Device "):
            return self._send(401, {"title": "sem token de dispositivo"})
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            return self._send(400, {"title": "JSON invalido"})

        if self.path == "/v1/device/daily":
            accepted, rejected = [], []
            for day in body.get("days", []):
                ok = (data_valida(day.get("date")) and inteiro(day.get("steps"))
                      and 0 <= day["steps"] <= 60000
                      and inteiro(day.get("active_minutes")) and 0 <= day["active_minutes"] <= 1440)
                (accepted if ok else rejected).append(day.get("date"))
                if ok:
                    RECEBIDOS["daily"].append(day)
            print("daily: aceitos={} recusados={}".format(accepted, rejected))
            return self._send(200, {"accepted": accepted, "rejected": rejected})

        if self.path == "/v1/device/nights":
            counts = body.get("counts", [])
            ok = (data_valida(body.get("night_date")) and isinstance(counts, list)
                  and len(counts) == 840
                  and all(c is None or (inteiro(c) and c >= 0) for c in counts))
            noite = body.get("night_date")
            print("night:", noite, "minutos com dado:", sum(1 for c in counts if c is not None),
                  "-> aceita" if ok else "-> recusada")
            if ok:
                RECEBIDOS["nights"].append(body)
            return self._send(200, {"accepted": [noite] if ok else [], "rejected": [] if ok else [noite]})

        if self.path == "/v1/device/live":
            if not (inteiro(body.get("steps_today")) and body["steps_today"] >= 0):
                return self._send(422, {"title": "steps_today invalido"})
            print("live:", json.dumps(body))
            RECEBIDOS["live"].append(body)
            return self._send(200, {"accepted": [], "rejected": []})

        return self._send(404, {"title": "rota desconhecida"})

    def log_message(self, fmt, *args):  # silencia o log padrao, ja imprimimos o essencial
        pass


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="API falsa do CareTwin (contrato v1)")
    ap.add_argument("--porta", type=int, default=8080)
    porta = ap.parse_args().porta
    print("API falsa em http://0.0.0.0:{} (Ctrl+C para parar)".format(porta))
    HTTPServer(("0.0.0.0", porta), Handler).serve_forever()
