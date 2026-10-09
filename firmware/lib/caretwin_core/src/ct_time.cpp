#include "ct_time.h"

#include <stdio.h>

#include "ct_params.h"

namespace ct {

void civilFromDays(int64_t z, int* y, int* m, int* d) {
  z += 719468;
  const int64_t era = (z >= 0 ? z : z - 146096) / 146097;
  const unsigned doe = static_cast<unsigned>(z - era * 146097);
  const unsigned yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
  const int64_t yy = static_cast<int64_t>(yoe) + era * 400;
  const unsigned doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
  const unsigned mp = (5 * doy + 2) / 153;
  const unsigned dd = doy - (153 * mp + 2) / 5 + 1;
  const unsigned mm = mp < 10 ? mp + 3 : mp - 9;
  *y = static_cast<int>(yy + (mm <= 2));
  *m = static_cast<int>(mm);
  *d = static_cast<int>(dd);
}

int64_t daysFromCivil(int y, int m, int d) {
  y -= m <= 2;
  const int64_t era = (y >= 0 ? y : y - 399) / 400;
  const unsigned yoe = static_cast<unsigned>(y - era * 400);
  const unsigned doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
  const unsigned doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
  return era * 146097 + static_cast<int64_t>(doe) - 719468;
}

static int64_t floorDiv(int64_t a, int64_t b) {
  int64_t q = a / b;
  if ((a % b != 0) && ((a < 0) != (b < 0))) --q;
  return q;
}

LocalTime toLocal(int64_t epoch_utc, int32_t tz_offset_s) {
  const int64_t local = epoch_utc + tz_offset_s;
  const int64_t days = floorDiv(local, 86400);
  const int64_t secs = local - days * 86400;
  LocalTime t{};
  civilFromDays(days, &t.year, &t.month, &t.day);
  t.hour = static_cast<int>(secs / 3600);
  t.minute = static_cast<int>((secs % 3600) / 60);
  t.second = static_cast<int>(secs % 60);
  return t;
}

int64_t localMidnightEpoch(int y, int m, int d, int32_t tz_offset_s) {
  return daysFromCivil(y, m, d) * 86400 - tz_offset_s;
}

void formatDate(int y, int m, int d, char* out) {
  snprintf(out, 11, "%04d-%02d-%02d", y, m, d);
}

void formatLocalIso(int64_t epoch_utc, int32_t tz_offset_s, char* out, size_t cap) {
  const LocalTime t = toLocal(epoch_utc, tz_offset_s);
  const int32_t off_min = tz_offset_s / 60;
  const char sign = off_min < 0 ? '-' : '+';
  const int32_t a = off_min < 0 ? -off_min : off_min;
  snprintf(out, cap, "%04d-%02d-%02dT%02d:%02d:%02d%c%02d:%02d", t.year, t.month, t.day, t.hour,
           t.minute, t.second, sign, static_cast<int>(a / 60), static_cast<int>(a % 60));
}

bool isClockValid(int64_t epoch_utc) { return epoch_utc >= params::MIN_VALID_EPOCH; }

}  // namespace ct
