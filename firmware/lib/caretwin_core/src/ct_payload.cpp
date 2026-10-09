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

int parseAccepted(const char* json, char (*dates)[11], size_t max_dates) {
  JsonDocument doc;
  if (deserializeJson(doc, json)) return -1;
  JsonVariantConst acc = doc["accepted"];
  if (!acc.is<JsonArrayConst>()) return -1;
  size_t n = 0;
  for (JsonVariantConst v : acc.as<JsonArrayConst>()) {
    if (n >= max_dates) break;
    const char* s = v.as<const char*>();
    if (!s || strlen(s) != 10) continue;  // ignora datas mal formadas
    memcpy(dates[n], s, 10);
    dates[n][10] = '\0';
    ++n;
  }
  return static_cast<int>(n);
}

}  // namespace ct
