// Parâmetros da aquisição e da validação.
// Os valores marcados [H] são estimativas e devem ser calibrados na bancada (semana 4).
#pragma once
#include <stdint.h>

namespace ct {
namespace params {

// Amostragem do acelerômetro
constexpr uint32_t SAMPLE_PERIOD_MS = 20;          // 50 Hz
constexpr uint16_t SAMPLES_PER_MINUTE = 60000 / SAMPLE_PERIOD_MS;  // 3000

// Validação de amostra (módulo da aceleração, em g). Faixa configurada no sensor: ±4 g.
constexpr float MAG_MIN_G = 0.05f;   // abaixo disso: leitura travada ou queda livre impossível no pulso
constexpr float MAG_MAX_G = 4.0f;    // acima disso: saturação

// Detector de passos (usado só no simulador; no T-Watch S3 o BMA423 conta em hardware)
constexpr float STEP_HIGH_G = 1.25f;              // [H] limiar de pico
constexpr float STEP_LOW_G = 1.05f;               // [H] limiar para rearmar
constexpr uint32_t STEP_MIN_INTERVAL_MS = 300;    // no máximo ~3,3 passos por segundo
constexpr uint32_t STEP_MAX_INTERVAL_MS = 2000;   // acima disso a caminhada é considerada interrompida
constexpr uint8_t STEP_CONFIRM = 4;               // passos seguidos antes de começar a contar (evita gestos)

// Minuto com movimento e minuto com dado
constexpr float MOVE_THRESHOLD_G = 0.10f;         // |módulo - 1 g| acima disso = amostra com movimento [H]
constexpr uint16_t ACTIVE_MINUTE_MIN_COUNT = 60;  // >= 1,2 s de movimento no minuto = minuto ativo [H]
constexpr uint16_t MINUTE_MIN_VALID = 2400;       // >= 80% das amostras válidas = minuto com dado

// Tempo
constexpr int64_t MIN_VALID_EPOCH = 1735689600;   // 2025-01-01T00:00:00Z; antes disso a hora é inválida
constexpr int32_t TZ_OFFSET_S = -3 * 3600;        // America/Sao_Paulo (sem horário de verão desde 2019)
constexpr int NIGHT_START_HOUR = 20;              // janela da noite: 20h
constexpr int NIGHT_END_HOUR = 10;                // até 10h do dia seguinte

// Limites de dado diário (iguais aos da API)
constexpr uint32_t MAX_DAILY_STEPS = 60000;

}  // namespace params
}  // namespace ct
