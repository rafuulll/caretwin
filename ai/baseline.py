DIAS_BASE = 7
DIAS_RECENTES = 3
VARIACAO = 0.20
DIAS_PARA_ALERTA = 2
MINIMO_DIAS_VALIDOS = 5

def normal(base):
    validos = [valor for valor in base if valor is not None]
    if len(validos) < MINIMO_DIAS_VALIDOS:
        return None
    return sum(validos) / len(validos)