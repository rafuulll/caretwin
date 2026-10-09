// Conversões de data sem depender de timegm/localtime (iguais no ESP32 e no PC).
#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ct {

struct LocalTime {
  int year, month, day, hour, minute, second;
};

// Dias desde 1970-01-01 -> data civil (algoritmo de Howard Hinnant).
void civilFromDays(int64_t days, int* y, int* m, int* d);
// Data civil -> dias desde 1970-01-01.
int64_t daysFromCivil(int y, int m, int d);

LocalTime toLocal(int64_t epoch_utc, int32_t tz_offset_s);
// Epoch UTC da meia-noite local da data informada.
int64_t localMidnightEpoch(int y, int m, int d, int32_t tz_offset_s);

// "AAAA-MM-DD" (buffer >= 11).
void formatDate(int y, int m, int d, char* out);
// "AAAA-MM-DDThh:mm:ss-03:00" (buffer >= 26).
void formatLocalIso(int64_t epoch_utc, int32_t tz_offset_s, char* out, size_t cap);

bool isClockValid(int64_t epoch_utc);

}  // namespace ct
