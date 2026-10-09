// Estrutura de dados: minuto -> dia local e noite -> filas de envio (até 7 de cada).
#pragma once
#include <stddef.h>
#include <stdint.h>

#include "ct_types.h"

namespace ct {

class DayStore {
 public:
  DayStore();

  // Recebe cada minuto fechado. Fecha o dia na virada da data local e a noite às 10h.
  void onMinute(const MinuteSummary& m, uint8_t battery_pct);

  // Dia em andamento.
  const DailyRecord& current() const { return cur_; }
  bool currentHasDate() const { return cur_has_date_; }

  // Filas de envio.
  size_t pendingDays() const { return n_days_; }
  const DailyRecord& pendingDay(size_t i) const { return days_[i]; }
  size_t pendingNights() const { return n_nights_; }
  const NightRecord& pendingNight(size_t i) const { return nights_[i]; }

  // Remove da fila só o que a API confirmou.
  size_t ackDays(const char (*dates)[11], size_t n);
  bool ackNight(const char* night_date);

  uint32_t droppedDays() const { return dropped_days_; }
  uint32_t droppedNights() const { return dropped_nights_; }
  bool inNight() const { return in_night_; }
  const NightRecord& currentNight() const { return cur_night_; }

  // Contador de dias fechados (para disparar sincronização).
  uint32_t closedDaysCount() const { return closed_days_; }

 private:
  void resetDay(const char* date);
  void closeDay();
  void startNight(const char* night_date, int64_t window_start);
  void closeNight();
  void pushDay(const DailyRecord& r);
  void pushNight(const NightRecord& r);

  DailyRecord cur_{};
  bool cur_has_date_ = false;
  DailyRecord days_[QUEUE_CAPACITY];
  size_t n_days_ = 0;
  NightRecord cur_night_;
  bool in_night_ = false;
  NightRecord nights_[QUEUE_CAPACITY];
  size_t n_nights_ = 0;
  uint32_t dropped_days_ = 0;
  uint32_t dropped_nights_ = 0;
  uint32_t closed_days_ = 0;
};

}  // namespace ct
