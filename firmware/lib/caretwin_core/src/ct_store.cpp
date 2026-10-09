#include "ct_store.h"

#include <string.h>

#include "ct_params.h"
#include "ct_time.h"

namespace ct {

DayStore::DayStore() { resetDay(""); }

void DayStore::resetDay(const char* date) {
  cur_ = DailyRecord{};
  strncpy(cur_.date, date, sizeof(cur_.date) - 1);
  cur_.battery_pct = BATTERY_UNKNOWN;
}

void DayStore::pushDay(const DailyRecord& r) {
  if (n_days_ == QUEUE_CAPACITY) {  // fila cheia: descarta o mais antigo e registra a perda
    memmove(&days_[0], &days_[1], sizeof(DailyRecord) * (QUEUE_CAPACITY - 1));
    --n_days_;
    ++dropped_days_;
  }
  days_[n_days_++] = r;
}

void DayStore::pushNight(const NightRecord& r) {
  if (n_nights_ == QUEUE_CAPACITY) {
    memmove(&nights_[0], &nights_[1], sizeof(NightRecord) * (QUEUE_CAPACITY - 1));
    --n_nights_;
    ++dropped_nights_;
  }
  nights_[n_nights_++] = r;
}

void DayStore::closeDay() {
  // Dia sem nenhum minuto com dado não vira linha: ausência não é zero.
  if (cur_has_date_ && cur_.minutes_with_data > 0) {
    pushDay(cur_);
    ++closed_days_;
  }
}

void DayStore::startNight(const char* night_date, int64_t window_start) {
  memset(&cur_night_, 0, sizeof(cur_night_));
  strncpy(cur_night_.night_date, night_date, sizeof(cur_night_.night_date) - 1);
  cur_night_.window_start_epoch = window_start;
  for (int i = 0; i < NIGHT_MINUTES; ++i) cur_night_.counts[i] = NO_DATA;
  in_night_ = true;
}

void DayStore::closeNight() {
  if (in_night_ && cur_night_.minutes_with_data > 0) pushNight(cur_night_);
  in_night_ = false;
}

void DayStore::onMinute(const MinuteSummary& m, uint8_t battery_pct) {
  const bool has_data = m.samples_valid >= params::MINUTE_MIN_VALID;

  if (m.clock_valid) {
    const LocalTime lt = toLocal(m.minute_epoch, params::TZ_OFFSET_S);
    char today[11];
    formatDate(lt.year, lt.month, lt.day, today);

    if (!cur_has_date_) {
      // A hora ficou válida: o que foi acumulado sem data pertence a hoje.
      strncpy(cur_.date, today, sizeof(cur_.date) - 1);
      cur_has_date_ = true;
    } else if (strcmp(cur_.date, today) != 0) {
      closeDay();
      resetDay(today);
      cur_has_date_ = true;
    }

    // Janela da noite: 20h até 10h. A noite leva a data do dia em que começou.
    const bool night = lt.hour >= params::NIGHT_START_HOUR || lt.hour < params::NIGHT_END_HOUR;
    if (night) {
      int y = lt.year, mo = lt.month, d = lt.day;
      if (lt.hour < params::NIGHT_END_HOUR) {
        civilFromDays(daysFromCivil(y, mo, d) - 1, &y, &mo, &d);
      }
      char night_date[11];
      formatDate(y, mo, d, night_date);
      if (!in_night_ || strcmp(cur_night_.night_date, night_date) != 0) {
        closeNight();
        const int64_t start = localMidnightEpoch(y, mo, d, params::TZ_OFFSET_S) +
                              static_cast<int64_t>(params::NIGHT_START_HOUR) * 3600;
        startNight(night_date, start);
      }
      const int64_t idx = (m.minute_epoch - cur_night_.window_start_epoch) / 60;
      if (idx >= 0 && idx < NIGHT_MINUTES && has_data) {
        if (cur_night_.counts[idx] == NO_DATA) ++cur_night_.minutes_with_data;
        cur_night_.counts[idx] = m.activity_count;
      }
    } else if (in_night_) {
      closeNight();
    }
  }
  // Com a hora inválida, os passos continuam contando, mas nenhum dia ou noite é fechado.

  uint32_t steps = cur_.steps + m.steps;
  if (steps > params::MAX_DAILY_STEPS) steps = params::MAX_DAILY_STEPS;
  cur_.steps = steps;
  if (has_data) {
    ++cur_.minutes_with_data;
    if (m.activity_count >= params::ACTIVE_MINUTE_MIN_COUNT) ++cur_.active_minutes;
  }
  cur_.invalid_samples += static_cast<uint32_t>(m.samples_total - m.samples_valid);
  if (battery_pct <= 100) cur_.battery_pct = battery_pct;
}

size_t DayStore::ackDays(const char (*dates)[11], size_t n) {
  size_t removed = 0;
  size_t w = 0;
  for (size_t r = 0; r < n_days_; ++r) {
    bool acked = false;
    for (size_t k = 0; k < n; ++k) {
      if (strcmp(days_[r].date, dates[k]) == 0) {
        acked = true;
        break;
      }
    }
    if (acked) {
      ++removed;
    } else {
      if (w != r) days_[w] = days_[r];
      ++w;
    }
  }
  n_days_ = w;
  return removed;
}

bool DayStore::ackNight(const char* night_date) {
  for (size_t i = 0; i < n_nights_; ++i) {
    if (strcmp(nights_[i].night_date, night_date) == 0) {
      memmove(&nights_[i], &nights_[i + 1], sizeof(NightRecord) * (n_nights_ - i - 1));
      --n_nights_;
      return true;
    }
  }
  return false;
}

}  // namespace ct
