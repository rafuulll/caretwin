// Comunicação: montagem dos corpos JSON (contrato da API v1) e leitura da resposta.
#pragma once
#include <stddef.h>
#include <stdint.h>

#include "ct_store.h"
#include "ct_types.h"

namespace ct {

// POST /v1/device/daily
// {"firmware":"0.1.0","battery_pct":62,"days":[{"date":"2026-10-20","steps":6412,"active_minutes":212}]}
size_t buildDailyPayload(const DayStore& store, uint8_t battery_pct, const char* firmware,
                         char* out, size_t cap);

// POST /v1/device/nights
// {"night_date":"2026-10-20","window_start":"2026-10-20T20:00:00-03:00","counts":[12,0,null,...]}
size_t buildNightPayload(const NightRecord& night, char* out, size_t cap);

// POST /v1/device/live (só no modo demo)
// {"steps_today":1234,"ts":"2026-10-20T15:04:05-03:00"}
size_t buildLivePayload(uint32_t steps_today, int64_t epoch_utc, bool clock_valid, char* out,
                        size_t cap);

// Converte uma leitura em unidades físicas para os inteiros do contrato, sem passar do teto
// que a API aceita (16 g e 2000 graus/s): um valor ruim vira o teto, nunca um lote recusado.
int16_t toMilliG(float g);
int16_t toDeciDps(float dps);

// POST /v1/device/raw (só no modo ao vivo): um lote de até RAW_BATCH_MAX leituras.
// {"rate_hz":50,"ts":"2026-10-20T15:04:05-03:00","steps_today":1234,"bpm":72,
//  "imu":[[ax,ay,az,gx,gy,gz],...],"ir":[120000,...]}
// bpm <= 0 vira null (sem dedo). O "ir" só vai se alguma leitura tiver sinal (ir > 0).
// ts é a hora da primeira leitura do lote. Devolve 0 se n for 0, maior que o máximo ou não couber.
size_t buildRawPayload(const RawSample* samples, size_t n, uint16_t rate_hz, int bpm,
                       uint32_t steps_today, int64_t first_epoch_utc, bool clock_valid, char* out,
                       size_t cap);

// Lê {"accepted":["2026-10-20",...]} da resposta.
// Devolve quantas datas foram lidas; -1 se a resposta não seguir o contrato.
int parseAccepted(const char* json, char (*dates)[11], size_t max_dates);

// Lê {"rejected":["2026-10-20",...]} da resposta: itens que a API recusou de propósito (passos
// acima de 60000, data fora dos limites, pulseira de pessoa encerrada). O firmware deve tirá-los da
// fila, porque reenviar nunca vai adiantar. Devolve quantas datas foram lidas; -1 se a chave não existir.
int parseRejected(const char* json, char (*dates)[11], size_t max_dates);

}  // namespace ct
