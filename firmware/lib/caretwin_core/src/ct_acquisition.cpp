#include "ct_acquisition.h"

#include <math.h>

#include "ct_params.h"

namespace ct {

SampleStatus validateSample(const ImuSample& s, float* mag_out) {
  if (!s.ok) return SAMPLE_READ_ERROR;
  if (!isfinite(s.ax) || !isfinite(s.ay) || !isfinite(s.az)) return SAMPLE_NOT_FINITE;
  const float mag = sqrtf(s.ax * s.ax + s.ay * s.ay + s.az * s.az);
  if (mag < params::MAG_MIN_G || mag > params::MAG_MAX_G) return SAMPLE_OUT_OF_RANGE;
  if (mag_out) *mag_out = mag;
  return SAMPLE_OK;
}

void StepDetector::reset() { *this = StepDetector(); }

uint16_t StepDetector::update(uint32_t t_ms, float mag_g) {
  // Média móvel de 3 amostras para suavizar ruído.
  window_[idx_] = mag_g;
  idx_ = static_cast<uint8_t>((idx_ + 1) % 3);
  if (filled_ < 3) ++filled_;
  float sum = 0;
  for (uint8_t i = 0; i < filled_; ++i) sum += window_[i];
  const float smooth = sum / filled_;

  if (!armed_) {
    if (smooth < params::STEP_LOW_G) armed_ = true;  // voltou para perto de 1 g: pronto para o próximo pico
    return 0;
  }
  if (smooth <= params::STEP_HIGH_G) return 0;

  // Pico detectado.
  armed_ = false;
  uint32_t dt = 0;
  if (has_last_) {
    dt = t_ms - last_step_ms_;
    if (dt < params::STEP_MIN_INTERVAL_MS) return 0;  // rápido demais: tremor, não passo
    if (dt > params::STEP_MAX_INTERVAL_MS) {          // pausa longa: a caminhada recomeça
      walking_ = false;
      pending_ = 0;
      prev_dt_ = 0;
      irregular_ = 0;
      dt = 0;
    }
  }
  has_last_ = true;
  last_step_ms_ = t_ms;

  if (walking_) {
    // Caminhada confirmada: o ritmo precisa continuar parecido com o recente. Sacudidas e gestos
    // têm ritmo irregular; um passo fora do ritmo não conta, e vários seguidos encerram a caminhada.
    const float lo = avg_dt_ * (1.0f - params::STEP_WALK_TOLERANCE);
    const float hi = avg_dt_ * (1.0f + params::STEP_WALK_TOLERANCE);
    if (dt >= lo && dt <= hi) {
      irregular_ = 0;
      avg_dt_ = 0.8f * avg_dt_ + 0.2f * static_cast<float>(dt);
      return 1;
    }
    if (++irregular_ >= params::STEP_MAX_IRREGULAR) {
      walking_ = false;
      pending_ = 1;
      prev_dt_ = 0;
      irregular_ = 0;
    }
    return 0;
  }

  // Ainda não é caminhada: os intervalos entre os primeiros picos precisam ser regulares.
  if (dt > 0 && prev_dt_ > 0) {
    const float diff = dt > prev_dt_ ? static_cast<float>(dt - prev_dt_) : static_cast<float>(prev_dt_ - dt);
    if (diff > params::STEP_START_REGULARITY * static_cast<float>(prev_dt_)) {
      pending_ = 1;  // ritmo quebrou: este pico começa uma nova sequência
      prev_dt_ = dt;
      return 0;
    }
  }
  if (dt > 0) prev_dt_ = dt;
  ++pending_;
  if (pending_ >= params::STEP_CONFIRM) {
    walking_ = true;
    avg_dt_ = prev_dt_ > 0 ? static_cast<float>(prev_dt_) : static_cast<float>(dt);
    irregular_ = 0;
    const uint16_t confirmed = pending_;
    pending_ = 0;
    return confirmed;
  }
  return 0;
}

void MinuteAggregator::startMinute(int64_t minute_start, bool clock_valid) {
  cur_ = MinuteSummary{};
  cur_.minute_epoch = minute_start;
  cur_.clock_valid = clock_valid;
  started_ = true;
}

static int64_t minuteStart(int64_t epoch_s) {
  int64_t m = epoch_s / 60;
  if (epoch_s < 0 && epoch_s % 60 != 0) --m;
  return m * 60;
}

bool MinuteAggregator::add(int64_t epoch_s, bool clock_valid, bool sample_valid, float mag_g,
                           uint16_t steps, MinuteSummary* out) {
  const int64_t ms = minuteStart(epoch_s);
  bool closed = false;
  if (!started_) {
    startMinute(ms, clock_valid);
  } else if (ms != cur_.minute_epoch) {
    if (out) *out = cur_;
    closed = true;
    startMinute(ms, clock_valid);
  }
  // Uma mudança de validade da hora no meio do minuto marca o minuto inteiro como inválido.
  if (!clock_valid) cur_.clock_valid = false;

  if (cur_.samples_total < 0xFFFF) ++cur_.samples_total;
  if (sample_valid) {
    if (cur_.samples_valid < 0xFFFF) ++cur_.samples_valid;
    if (fabsf(mag_g - 1.0f) > params::MOVE_THRESHOLD_G && cur_.activity_count < 0xFFFE) {
      ++cur_.activity_count;
    }
  }
  if (steps) cur_.steps = static_cast<uint16_t>(cur_.steps + steps);
  return closed;
}

}  // namespace ct
