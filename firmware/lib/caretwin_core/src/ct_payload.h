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

// Lê {"accepted":["2026-10-20",...]} da resposta.
// Devolve quantas datas foram lidas; -1 se a resposta não seguir o contrato.
int parseAccepted(const char* json, char (*dates)[11], size_t max_dates);

}  // namespace ct
