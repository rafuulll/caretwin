#include "ct_payload.h"

#include <ArduinoJson.h>
#include <string.h>

#include "ct_params.h"
#include "ct_time.h"

namespace ct {

size_t buildDailyPayload(const DayStore& store, uint8_t battery_pct, const char* firmware,
                         char* out, size_t cap) {
  JsonDocument doc;
  doc["firmware"] = firmware;
  if (battery_pct <= 100) {
    doc["battery_pct"] = battery_pct;
  } else {
    doc["battery_pct"] = nullptr;
  }
  JsonArray days = doc["days"].to<JsonArray>();
  for (size_t i = 0; i < store.pendingDays(); ++i) {
    const DailyRecord& r = store.pendingDay(i);
    JsonObject o = days.add<JsonObject>();
    o["date"] = r.date;
    o["steps"] = r.steps;
    o["active_minutes"] = r.active_minutes;
  }
  const size_t n = serializeJson(doc, out, cap);
  return n < cap ? n : 0;  // 0 = não coube no buffer
}

size_t buildNightPayload(const NightRecord& night, char* out, size_t cap) {
  JsonDocument doc;
  doc["night_date"] = night.night_date;
  char iso[32];
  formatLocalIso(night.window_start_epoch, params::TZ_OFFSET_S, iso, sizeof(iso));
  doc["window_start"] = iso;
  JsonArray counts = doc["counts"].to<JsonArray>();
  for (int i = 0; i < NIGHT_MINUTES; ++i) {
    if (night.counts[i] == NO_DATA) {
      counts.add(nullptr);
    } else {
      counts.add(night.counts[i]);
    }
  }
  const size_t n = serializeJson(doc, out, cap);
  return n < cap ? n : 0;
}

size_t buildLivePayload(uint32_t steps_today, int64_t epoch_utc, bool clock_valid, char* out,
                        size_t cap) {
  JsonDocument doc;
  doc["steps_today"] = steps_today;
  if (clock_valid) {
    char iso[32];
    formatLocalIso(epoch_utc, params::TZ_OFFSET_S, iso, sizeof(iso));
    doc["ts"] = iso;
  } else {
    doc["ts"] = nullptr;
  }
  const size_t n = serializeJson(doc, out, cap);
  return n < cap ? n : 0;
}

static int16_t clampTo(float v, float limit) {
  if (!(v == v)) return 0;  // NaN
  if (v > limit) v = limit;
  if (v < -limit) v = -limit;
  return static_cast<int16_t>(v >= 0 ? v + 0.5f : v - 0.5f);
}

int16_t toMilliG(float g) { return clampTo(g * 1000.0f, 16000.0f); }
int16_t toDeciDps(float dps) { return clampTo(dps * 10.0f, 20000.0f); }

size_t buildRawPayload(const RawSample* samples, size_t n, uint16_t rate_hz, int bpm,
                       uint32_t steps_today, int64_t first_epoch_utc, bool clock_valid, char* out,
                       size_t cap) {
  if (!samples || n == 0 || n > RAW_BATCH_MAX) return 0;
  JsonDocument doc;
  doc["rate_hz"] = rate_hz;
  if (clock_valid) {
    char iso[32];
    formatLocalIso(first_epoch_utc, params::TZ_OFFSET_S, iso, sizeof(iso));
    doc["ts"] = iso;
  } else {
    doc["ts"] = nullptr;
  }
  doc["steps_today"] = steps_today;
  if (bpm > 0) {
    doc["bpm"] = bpm;
  } else {
    doc["bpm"] = nullptr;
  }
  JsonArray imu = doc["imu"].to<JsonArray>();
  bool has_ir = false;
  for (size_t i = 0; i < n; ++i) {
    JsonArray row = imu.add<JsonArray>();
    row.add(samples[i].ax);
    row.add(samples[i].ay);
    row.add(samples[i].az);
    row.add(samples[i].gx);
    row.add(samples[i].gy);
    row.add(samples[i].gz);
    if (samples[i].ir > 0) has_ir = true;
  }
  if (has_ir) {
    JsonArray ir = doc["ir"].to<JsonArray>();
    for (size_t i = 0; i < n; ++i) ir.add(samples[i].ir > 262143u ? 262143u : samples[i].ir);
  }
  const size_t len = serializeJson(doc, out, cap);
  return len < cap ? len : 0;
}

// Lê uma lista de datas ("2026-10-20", ...) da chave pedida da resposta.
// Devolve quantas datas foram lidas; -1 se não for JSON ou se a chave não for uma lista.
static int parseDateList(const char* json, const char* key, char (*dates)[11], size_t max_dates) {
  JsonDocument doc;
  if (deserializeJson(doc, json)) return -1;
  JsonVariantConst list = doc[key];
  if (!list.is<JsonArrayConst>()) return -1;
  size_t n = 0;
  for (JsonVariantConst v : list.as<JsonArrayConst>()) {
    if (n >= max_dates) break;
    const char* s = v.as<const char*>();
    if (!s || strlen(s) != 10) continue;  // ignora datas mal formadas
    memcpy(dates[n], s, 10);
    dates[n][10] = '\0';
    ++n;
  }
  return static_cast<int>(n);
}

int parseAccepted(const char* json, char (*dates)[11], size_t max_dates) {
  return parseDateList(json, "accepted", dates, max_dates);
}

int parseRejected(const char* json, char (*dates)[11], size_t max_dates) {
  return parseDateList(json, "rejected", dates, max_dates);
}

}  // namespace ct
