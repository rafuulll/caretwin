// Aquisição e validação: amostra -> validação -> passos -> resumo por minuto.
#pragma once
#include <stdint.h>

#include "ct_types.h"

namespace ct {

// Valida uma amostra bruta. Em caso de sucesso, devolve o módulo da aceleração (g) em mag_out.
SampleStatus validateSample(const ImuSample& s, float* mag_out);

// Detector de passos por pico do módulo da aceleração.
// Usado só no simulador (MPU-6050); no T-Watch S3 o BMA423 conta passos em hardware.
class StepDetector {
 public:
  // Devolve quantos passos foram confirmados por esta amostra (0 na maioria das vezes).
  uint16_t update(uint32_t t_ms, float mag_g);
  void reset();

 private:
  float window_[3] = {1.0f, 1.0f, 1.0f};
  uint8_t filled_ = 0;
  uint8_t idx_ = 0;
  bool armed_ = true;
  bool has_last_ = false;
  uint32_t last_step_ms_ = 0;
  uint8_t pending_ = 0;   // passos aguardando confirmação
  bool walking_ = false;  // caminhada confirmada: cada novo passo conta na hora
};

// Agrega amostras em minutos de relógio. Fecha o minuto quando a hora do sistema muda de minuto.
class MinuteAggregator {
 public:
  // epoch_s: hora do sistema (UTC) no momento da amostra.
  // Devolve true e preenche *out quando um minuto foi fechado por esta chamada.
  bool add(int64_t epoch_s, bool clock_valid, bool sample_valid, float mag_g, uint16_t steps,
           MinuteSummary* out);

 private:
  void startMinute(int64_t minute_start, bool clock_valid);
  bool started_ = false;
  MinuteSummary cur_{};
};

}  // namespace ct
