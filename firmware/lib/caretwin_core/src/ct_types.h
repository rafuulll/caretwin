// Estruturas de dados da pulseira. Sem dependência de Arduino: compila no ESP32 e no PC (testes).
#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ct {

constexpr uint16_t NO_DATA = 0xFFFF;   // "sem dado" nunca é zero
constexpr int NIGHT_MINUTES = 840;     // 20h -> 10h
constexpr size_t QUEUE_CAPACITY = 7;   // até 7 dias e 7 noites guardados offline
constexpr uint8_t BATTERY_UNKNOWN = 255;

// Uma leitura bruta do acelerômetro, em g.
struct ImuSample {
  uint32_t t_ms;   // millis() no momento da leitura
  float ax, ay, az;
  bool ok;         // false = falha de leitura no barramento
};

enum SampleStatus : uint8_t {
  SAMPLE_OK = 0,
  SAMPLE_READ_ERROR,
  SAMPLE_NOT_FINITE,
  SAMPLE_OUT_OF_RANGE,
};

// Resumo de um minuto de aquisição.
struct MinuteSummary {
  int64_t minute_epoch;     // início do minuto, UTC, segundos
  bool clock_valid;         // a hora do sistema era válida neste minuto
  uint16_t samples_total;   // amostras tentadas
  uint16_t samples_valid;   // amostras aprovadas na validação
  uint16_t activity_count;  // amostras válidas com movimento
  uint16_t steps;           // passos confirmados no minuto
};

// Total de um dia local (fila de envio para POST /v1/device/daily).
struct DailyRecord {
  char date[11];               // AAAA-MM-DD, hora local
  uint32_t steps;
  uint16_t active_minutes;
  uint16_t minutes_with_data;  // uso interno: dia sem nenhum minuto com dado não é enviado
  uint8_t battery_pct;         // última leitura do dia; BATTERY_UNKNOWN se não houver
  uint32_t invalid_samples;    // uso interno: diagnóstico
};

// Movimento por minuto numa noite (fila de envio para POST /v1/device/nights).
struct NightRecord {
  char night_date[11];              // data local em que a janela começou (20h)
  int64_t window_start_epoch;       // UTC, segundos
  uint16_t counts[NIGHT_MINUTES];   // activity_count por minuto; NO_DATA = sem dado
  uint16_t minutes_with_data;
};

}  // namespace ct
