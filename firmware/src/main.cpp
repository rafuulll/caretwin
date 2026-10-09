// CareTwin - firmware da pulseira com pecas avulsas (simulacao no Wokwi e placa real)
//
// Fluxo: sensores -> aquisicao -> validacao -> estrutura de dados -> comunicacao, mais tela e botoes.
//
//   MPU-6050 (50 Hz) --> validateSample --> StepDetector --> MinuteAggregator --> DayStore --> HTTPS
//   hora do sistema (NTP, sem RTC) --------------------------^
//   divisor da bateria (ADC) --> % da bateria -------------------^
//   MAX30102 (so na tela "Coracao", teste de bancada) --> bpm
//   botoes A/B + display: tela acende por alguns segundos e apaga sozinha
//
// O nucleo (lib/caretwin_core) e o mesmo do projeto original. Este arquivo e uma adaptacao do
// src/main.cpp da pasta de cima: sem DS1307, com display, frequencia cardiaca e dois botoes.

#include <Adafruit_GFX.h>
#include <Adafruit_MPU6050.h>
#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <esp_sntp.h>
#include <sys/time.h>
#include <time.h>

#include "config.h"
#include "ct_core.h"

#if CT_SIM
#include <Adafruit_ILI9341.h>
#else
#include <Adafruit_ST7789.h>
#include <MAX30105.h>
#include <heartRate.h>
#endif

using namespace ct;

// ---------------- Hardware ----------------
static Adafruit_MPU6050 imu;
static bool imu_ok = false;
static uint32_t last_imu_retry_ms = 0;
static bool imu_error_logged = false;

#if CT_SIM
static Adafruit_ILI9341 tft(PIN_TFT_CS, PIN_TFT_DC, PIN_TFT_RST);  // so a area 240x240 do topo e usada
#else
static Adafruit_ST7789 tft(PIN_TFT_CS, PIN_TFT_DC, PIN_TFT_RST);
static MAX30105 hrSensor;
static bool hr_hw_ok = false;
#endif

// ---------------- Nucleo ----------------
static StepDetector stepDet;
static MinuteAggregator minuteAgg;
static DayStore store;
static uint32_t steps_in_minute = 0;  // passos do minuto ainda nao fechado
static uint32_t next_sample_ms = 0;

// ---------------- Comunicacao ----------------
static char tx_buf[8192];
static uint32_t next_sync_ms = 0;
static uint8_t retry_idx = 0;
static const uint32_t RETRY_MS[3] = {60000UL, 300000UL, 900000UL};  // 1, 5 e 15 min
static bool sync_requested = false;
static bool wifi_was_connected = false;
static uint32_t demo_until_ms = 0;
static uint32_t next_demo_ms = 0;

// ---------------- Tempo ----------------
static volatile bool ntp_synced_flag = false;
#if CT_SIM
static bool manual_time_lock = false;  // so simulacao: a hora definida pelo teste nao e sobrescrita
#endif

static int64_t nowEpoch() { return static_cast<int64_t>(time(nullptr)); }
static bool clockValid() { return isClockValid(nowEpoch()); }

static void setSystemTime(int64_t epoch) {
  timeval tv{};
  tv.tv_sec = static_cast<time_t>(epoch);
  settimeofday(&tv, nullptr);
}

static void logClock(const char* source) {
  if (clockValid()) {
    char iso[32];
    formatLocalIso(nowEpoch(), params::TZ_OFFSET_S, iso, sizeof(iso));
    Serial.printf("[CLOCK] valido origem=%s hora_local=%s\n", source, iso);
  } else {
    Serial.printf("[CLOCK] invalido origem=%s (dias nao serao fechados)\n", source);
  }
}

static void onNtpSync(struct timeval*) { ntp_synced_flag = true; }

// ---------------- Bateria ----------------
// Tensao da bateria em mV. Na pulseira: o ADC le a metade da tensao (divisor 10K + 10K).
// Na simulacao: o potenciometro vai de 3,30 V (0%) a 4,20 V (100%).
static uint32_t readBatteryMv() {
#if CT_SIM
  const int raw = analogRead(PIN_BATTERY_ADC);
  if (raw < 0 || raw > 4095) return 0;
  return 3300u + static_cast<uint32_t>(raw) * 900u / 4095u;
#else
  return analogReadMilliVolts(PIN_BATTERY_ADC) * 2u;
#endif
}

// Curva aproximada de uma LiPo 3,7 V em repouso [H]: calibrar na bancada.
static uint8_t readBatteryPct() {
  static const uint16_t MV[9] = {3300, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200};
  static const uint8_t PCT[9] = {0, 5, 10, 25, 40, 60, 80, 90, 100};
  const uint32_t mv = readBatteryMv();
  if (mv == 0) return BATTERY_UNKNOWN;
  if (mv <= MV[0]) return 0;
  if (mv >= MV[8]) return 100;
  for (int i = 1; i < 9; ++i) {
    if (mv <= MV[i]) {
      const int32_t span_mv = MV[i] - MV[i - 1];
      const int32_t span_pct = PCT[i] - PCT[i - 1];
      // interpolacao linear entre os pontos da curva, com arredondamento
      return static_cast<uint8_t>(
          PCT[i - 1] +
          ((static_cast<int32_t>(mv) - MV[i - 1]) * span_pct + span_mv / 2) / span_mv);
    }
  }
  return 100;
}

// ---------------- Frequencia cardiaca (MAX30102) ----------------
// Teste de bancada: so funciona com o dedo no sensor, so mede enquanto a tela "Coracao" esta aberta
// e NAO entra nos dados enviados a API.
static int hr_bpm = 0;
static bool hr_finger = false;

#if !CT_SIM
static uint32_t hr_last_beat_ms = 0;
static uint8_t hr_rates[4];
static uint8_t hr_rate_n = 0;
static uint8_t hr_rate_i = 0;
#endif

static void hrInit() {
#if CT_SIM
  pinMode(PIN_SIM_FINGER, INPUT_PULLUP);
  Serial.println("[HR] simulado: potenciometro = bpm, botao F = dedo no sensor");
#else
  hr_hw_ok = hrSensor.begin(Wire, I2C_SPEED_FAST);
  if (hr_hw_ok) {
    // brilho 0x1F, media de 4, LED vermelho + IR, 400 amostras/s, pulso 411 us, faixa 4096
    hrSensor.setup(0x1F, 4, 2, 400, 411, 4096);
    hrSensor.shutDown();  // desligado ate abrir a tela "Coracao" (economiza bateria)
  }
  Serial.println(hr_hw_ok ? "[HR] MAX30102 ok" : "[HR] MAX30102 nao encontrado");
#endif
}

static void hrWake() {
#if !CT_SIM
  if (hr_hw_ok) hrSensor.wakeUp();
  hr_rate_n = 0;
  hr_rate_i = 0;
#endif
}

static void hrSleep() {
#if !CT_SIM
  if (hr_hw_ok) hrSensor.shutDown();
#endif
  hr_bpm = 0;
  hr_finger = false;
}

static void hrPoll(uint32_t now) {
#if CT_SIM
  (void)now;
  hr_finger = digitalRead(PIN_SIM_FINGER) == LOW;
  if (hr_finger) {
    const int raw = analogRead(PIN_SIM_HR);
    hr_bpm = 40 + static_cast<int>(static_cast<long>(raw) * 160L / 4095L);
  } else {
    hr_bpm = 0;
  }
#else
  if (!hr_hw_ok) return;
  const long ir = hrSensor.getIR();
  hr_finger = ir > HR_FINGER_IR_MIN;
  if (!hr_finger) {
    hr_bpm = 0;
    hr_rate_n = 0;
    return;
  }
  if (checkForBeat(ir)) {
    const uint32_t delta = now - hr_last_beat_ms;
    hr_last_beat_ms = now;
    if (delta > 0) {
      const float bpm = 60000.0f / static_cast<float>(delta);
      if (bpm > 30.0f && bpm < 220.0f) {
        hr_rates[hr_rate_i] = static_cast<uint8_t>(bpm);
        hr_rate_i = (hr_rate_i + 1) % 4;
        if (hr_rate_n < 4) ++hr_rate_n;
        uint16_t sum = 0;
        for (uint8_t k = 0; k < hr_rate_n; ++k) sum += hr_rates[k];
        hr_bpm = sum / hr_rate_n;
      }
    }
  }
#endif
}

// ---------------- Tela ----------------
static const uint16_t C_BLACK = 0x0000;
static const uint16_t C_WHITE = 0xFFFF;
static const uint16_t C_GREEN = 0x07E0;
static const uint16_t C_RED = 0xF800;
static const uint16_t C_YELLOW = 0xFFE0;
static const uint16_t C_CYAN = 0x07FF;
static const uint16_t C_GRAY = 0x8410;

static const uint8_t UI_SLOTS = 8;
static const uint8_t UI_PAGES = 3;  // 0 resumo, 1 coracao, 2 sistema
static bool screen_on = false;
static uint32_t screen_off_at_ms = 0;
static uint32_t next_ui_ms = 0;
static uint8_t ui_page = 0;
static char ui_cache[UI_SLOTS][28];
static uint16_t ui_color[UI_SLOTS];

static void uiClearCache() {
  memset(ui_cache, 0, sizeof(ui_cache));
  memset(ui_color, 0, sizeof(ui_color));
}

// Escreve um campo de texto de largura fixa (completa com espacos) e so mexe na tela se mudou.
static void uiField(uint8_t slot, int16_t x, int16_t y, uint8_t size, uint16_t color,
                    const char* text, uint8_t width) {
  char buf[28];
  if (width > sizeof(buf) - 1) width = sizeof(buf) - 1;
  snprintf(buf, sizeof(buf), "%-*.*s", static_cast<int>(width), static_cast<int>(width), text);
  if (strcmp(ui_cache[slot], buf) == 0 && ui_color[slot] == color) return;
  tft.setTextSize(size);
  tft.setTextColor(color, C_BLACK);
  tft.setCursor(x, y);
  tft.print(buf);
  strcpy(ui_cache[slot], buf);
  ui_color[slot] = color;
}

static void uiDrawPage() {
  char b[32];
  const bool wifi = WiFi.status() == WL_CONNECTED;
  switch (ui_page) {
    case 0: {  // Resumo: hora, bateria, passos
      char hhmm[8] = "--:--";
      if (clockValid()) {
        char iso[32];
        formatLocalIso(nowEpoch(), params::TZ_OFFSET_S, iso, sizeof(iso));
        memcpy(hhmm, iso + 11, 5);  // "AAAA-MM-DDTHH:MM:SS..." -> "HH:MM"
        hhmm[5] = '\0';
      }
      uiField(0, 8, 8, 3, C_WHITE, hhmm, 5);
      const uint8_t pct = readBatteryPct();
      if (pct == BATTERY_UNKNOWN) {
        snprintf(b, sizeof(b), "BAT --");
      } else {
        snprintf(b, sizeof(b), "BAT %u%%", static_cast<unsigned>(pct));
      }
      const uint16_t bat_color =
          (pct == BATTERY_UNKNOWN) ? C_GRAY : (pct <= 15 ? C_RED : (pct <= 30 ? C_YELLOW : C_GREEN));
      uiField(1, 138, 12, 2, bat_color, b, 8);
      uiField(2, 8, 56, 2, C_GRAY, "PASSOS HOJE", 16);
      const DailyRecord& d = store.current();
      snprintf(b, sizeof(b), "%lu", static_cast<unsigned long>(d.steps + steps_in_minute));
      uiField(3, 8, 88, 6, C_GREEN, b, 6);
      snprintf(b, sizeof(b), "ativos %u min", static_cast<unsigned>(d.active_minutes));
      uiField(4, 8, 150, 2, C_WHITE, b, 19);
      snprintf(b, sizeof(b), "%s fila %ud %un", wifi ? "WiFi" : "sem WiFi",
               static_cast<unsigned>(store.pendingDays()),
               static_cast<unsigned>(store.pendingNights()));
      uiField(5, 8, 180, 2, wifi ? C_CYAN : C_YELLOW, b, 19);
      uiField(6, 8, 222, 1, C_GRAY, "A: pagina  B: enviar  A longo: ao vivo", 39);
      break;
    }
    case 1: {  // Coracao (teste de bancada)
      uiField(0, 8, 8, 2, C_CYAN, "FREQ. CARDIACA", 18);
      if (hr_finger && hr_bpm > 0) {
        snprintf(b, sizeof(b), "%3d", hr_bpm);
      } else {
        snprintf(b, sizeof(b), "---");
      }
      uiField(1, 30, 60, 7, (hr_finger && hr_bpm > 0) ? C_RED : C_GRAY, b, 3);
      uiField(2, 170, 96, 3, C_WHITE, "bpm", 3);
      uiField(3, 8, 140, 2, hr_finger ? C_GREEN : C_YELLOW,
              hr_finger ? "Dedo no sensor" : "Coloque o dedo", 19);
      uiField(4, 8, 180, 2, C_GRAY, "Teste de bancada", 19);
#if CT_SIM
      uiField(5, 8, 222, 1, C_GRAY, "SIMULADO: potenciometro = bpm, F = dedo", 39);
#endif
      break;
    }
    default: {  // Sistema
      uiField(0, 8, 8, 2, C_CYAN, "SISTEMA", 18);
      snprintf(b, sizeof(b), "FW %s", CT_FW_VERSION);
      uiField(1, 8, 44, 2, C_WHITE, b, 19);
      uiField(2, 8, 72, 2, wifi ? C_GREEN : C_YELLOW, wifi ? "WiFi: ok" : "WiFi: sem rede", 19);
      const bool ck = clockValid();
      uiField(3, 8, 100, 2, ck ? C_GREEN : C_YELLOW, ck ? "Hora: valida" : "Hora: invalida", 19);
      snprintf(b, sizeof(b), "Fila: %ud %un", static_cast<unsigned>(store.pendingDays()),
               static_cast<unsigned>(store.pendingNights()));
      uiField(4, 8, 128, 2, C_WHITE, b, 19);
      const uint32_t mv = readBatteryMv();
      const uint8_t pct = readBatteryPct();
      if (pct == BATTERY_UNKNOWN) {
        snprintf(b, sizeof(b), "Bat: sem leitura");
      } else {
        snprintf(b, sizeof(b), "Bat %u%% %lu.%02luV", static_cast<unsigned>(pct),
                 static_cast<unsigned long>(mv / 1000), static_cast<unsigned long>((mv % 1000) / 10));
      }
      uiField(5, 8, 156, 2, C_WHITE, b, 19);
      uiField(6, 8, 222, 1, C_GRAY, "A: pagina  B: enviar  A longo: ao vivo", 39);
      break;
    }
  }
}

static void initDisplay() {
  pinMode(PIN_TFT_BL, OUTPUT);
  digitalWrite(PIN_TFT_BL, LOW);
#if CT_SIM
  tft.begin();
#else
  // Se o seu modulo 240x240 mostrar imagem torta ou apagada, troque SPI_MODE2 por SPI_MODE3.
  tft.init(240, 240, SPI_MODE2);
#endif
  tft.setRotation(0);
  tft.fillScreen(C_BLACK);
  Serial.println("[DISPLAY] ok");
}

static void wakeScreen(uint32_t now) {
  if (!screen_on) {
    screen_on = true;
    digitalWrite(PIN_TFT_BL, HIGH);
    tft.fillScreen(C_BLACK);
    uiClearCache();
    if (ui_page == 1) hrWake();
  }
  screen_off_at_ms = now + SCREEN_ON_MS;
  next_ui_ms = now;
}

static void sleepScreen() {
  screen_on = false;
  digitalWrite(PIN_TFT_BL, LOW);
  tft.fillScreen(C_BLACK);
  hrSleep();
}

static void nextPage(uint32_t now) {
  if (ui_page == 1) hrSleep();
  ui_page = (ui_page + 1) % UI_PAGES;
  if (ui_page == 1) hrWake();
  tft.fillScreen(C_BLACK);
  uiClearCache();
  screen_off_at_ms = now + SCREEN_ON_MS;
  next_ui_ms = now;
}

static void uiTick(uint32_t now) {
  if (!screen_on) return;
  if (static_cast<int32_t>(now - screen_off_at_ms) >= 0) {
    sleepScreen();
    return;
  }
  if (ui_page == 1) hrPoll(now);
  if (static_cast<int32_t>(now - next_ui_ms) < 0) return;
  next_ui_ms = now + (ui_page == 1 ? 250 : 1000);
  uiDrawPage();
}

// ---------------- Sensores ----------------
static bool initImu() {
  if (!imu.begin(IMU_I2C_ADDR, &Wire)) return false;
  imu.setAccelerometerRange(MPU6050_RANGE_4_G);
  imu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  return true;
}

#if CT_SIM
static bool sim_walk = false;  // comando W: caminhada falsa, 2 passos por segundo
#endif

static ImuSample readImu() {
  ImuSample s{millis(), 0.f, 0.f, 0.f, false};
#if CT_SIM
  if (sim_walk) {
    // Mesmo padrao do teste manual: 1,5 g por 150 ms e 0,8 g por 350 ms (um passo a cada 500 ms).
    s.az = (s.t_ms % 500 < 150) ? 1.5f : 0.8f;
    s.ok = true;
    return s;
  }
#endif
  if (!imu_ok) return s;
  sensors_event_t a, g, t;
  if (!imu.getEvent(&a, &g, &t)) return s;
  s.ax = a.acceleration.x / SENSORS_GRAVITY_STANDARD;
  s.ay = a.acceleration.y / SENSORS_GRAVITY_STANDARD;
  s.az = a.acceleration.z / SENSORS_GRAVITY_STANDARD;
  s.ok = true;
  return s;
}

static void logMinute(const MinuteSummary& m) {
  char when[32];
  if (m.clock_valid) {
    formatLocalIso(m.minute_epoch, params::TZ_OFFSET_S, when, sizeof(when));
  } else {
    strcpy(when, "hora=invalida");
  }
  Serial.printf("[MIN] %s validas=%u/%u movimento=%u passos=%u com_dado=%d ativo=%d\n", when,
                m.samples_valid, m.samples_total, m.activity_count, m.steps,
                m.samples_valid >= params::MINUTE_MIN_VALID ? 1 : 0,
                (m.samples_valid >= params::MINUTE_MIN_VALID &&
                 m.activity_count >= params::ACTIVE_MINUTE_MIN_COUNT)
                    ? 1
                    : 0);
}

static void sampleOnce() {
  const ImuSample s = readImu();
  float mag = 0.f;
  const SampleStatus st = validateSample(s, &mag);
  const bool valid = (st == SAMPLE_OK);

  if (!valid && !imu_error_logged) {
    Serial.printf("[IMU] amostra invalida codigo=%u (minutos sem amostras validas ficam sem dado)\n",
                  static_cast<unsigned>(st));
    imu_error_logged = true;
  } else if (valid && imu_error_logged) {
    Serial.println("[IMU] leituras validas de novo");
    imu_error_logged = false;
  }

  const uint16_t new_steps = valid ? stepDet.update(s.t_ms, mag) : 0;
  if (new_steps) {
    steps_in_minute += new_steps;
    Serial.printf("[STEP] +%u total_hoje=%lu\n", new_steps,
                  static_cast<unsigned long>(store.current().steps + steps_in_minute));
  }

  MinuteSummary m;
  if (minuteAgg.add(nowEpoch(), clockValid(), valid, mag, new_steps, &m)) {
    // O minuto fechado inclui os passos desta amostra apenas se ela pertencia a ele;
    // a amostra atual ja abriu o minuto novo, entao recontamos a partir dela.
    steps_in_minute = new_steps;
    const uint32_t closed_before = store.closedDaysCount();
    const size_t nights_before = store.pendingNights();
    store.onMinute(m, readBatteryPct());
    logMinute(m);

    if (store.closedDaysCount() != closed_before) {
      const DailyRecord& d = store.pendingDay(store.pendingDays() - 1);
      Serial.printf(
          "[DAY] fechado data=%s passos=%lu minutos_ativos=%u minutos_com_dado=%u bateria=%u fila=%u\n",
          d.date, static_cast<unsigned long>(d.steps), d.active_minutes, d.minutes_with_data,
          d.battery_pct, static_cast<unsigned>(store.pendingDays()));
      sync_requested = true;  // arquitetura: sincroniza logo apos fechar o dia
    }
    if (store.pendingNights() != nights_before) {
      const NightRecord& n = store.pendingNight(store.pendingNights() - 1);
      Serial.printf("[NIGHT] fechada data=%s minutos_com_dado=%u fila=%u\n", n.night_date,
                    n.minutes_with_data, static_cast<unsigned>(store.pendingNights()));
    }
  }
}

// ---------------- Comunicacao ----------------
static int httpPost(const char* path, const char* body, size_t len, String& resp) {
  WiFiClientSecure client;
#if CT_SIM
  client.setInsecure();  // SOMENTE na simulacao. Na pulseira: setCACert(API_ROOT_CA).
#else
  client.setCACert(API_ROOT_CA);
#endif
  HTTPClient http;
  const String url = String(API_BASE_URL) + path;
  if (!http.begin(client, url)) {
    Serial.printf("[TX] erro ao abrir %s\n", url.c_str());
    return -1;
  }
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Device ") + DEVICE_TOKEN);

  Serial.printf("[TX] POST %s bytes=%u corpo=%.160s%s\n", url.c_str(), static_cast<unsigned>(len),
                body, len > 160 ? "..." : "");
  const int code = http.POST(reinterpret_cast<uint8_t*>(const_cast<char*>(body)), len);
  if (code > 0) resp = http.getString();
  Serial.printf("[TX] resposta http=%d\n", code);
  http.end();
  return code;
}

static void scheduleNextWindow() {
  next_sync_ms = millis() + SYNC_INTERVAL_MS;
  retry_idx = 0;
}

static void scheduleRetry() {
  if (retry_idx < 3) {
    const uint32_t base = RETRY_MS[retry_idx++];
    const uint32_t jitter = static_cast<uint32_t>(random(0, base / 5));  // ate 20% aleatorio
    next_sync_ms = millis() + base + jitter;
    Serial.printf("[TX] nova tentativa em %lu s\n", static_cast<unsigned long>((base + jitter) / 1000));
  } else {
    Serial.println("[TX] tentativas esgotadas; proxima janela normal");
    scheduleNextWindow();
  }
}

static bool sendDays() {
  const size_t n = buildDailyPayload(store, readBatteryPct(), CT_FW_VERSION, tx_buf, sizeof(tx_buf));
  if (n == 0) {
    Serial.println("[TX] payload diario nao coube no buffer");
    return false;
  }
  String resp;
  const int code = httpPost(PATH_DAILY, tx_buf, n, resp);
  if (code < 200 || code >= 300) return false;
  char dates[QUEUE_CAPACITY][11];
  const int k = parseAccepted(resp.c_str(), dates, QUEUE_CAPACITY);
  if (k < 0) {
    Serial.println("[TX] resposta sem lista 'accepted' (fora do contrato); nada sai da fila");
    return false;
  }
  const size_t removed = store.ackDays(dates, static_cast<size_t>(k));
  Serial.printf("[TX] dias aceitos=%u restantes=%u\n", static_cast<unsigned>(removed),
                static_cast<unsigned>(store.pendingDays()));
  return true;
}

static bool sendNights() {
  // Uma noite por requisicao (cerca de 4 KB cada).
  size_t i = 0;
  bool all_ok = true;
  while (i < store.pendingNights()) {
    const NightRecord& night = store.pendingNight(i);
    const size_t n = buildNightPayload(night, tx_buf, sizeof(tx_buf));
    String resp;
    const int code = n ? httpPost(PATH_NIGHTS, tx_buf, n, resp) : -1;
    char dates[1][11];
    const int k = (code >= 200 && code < 300) ? parseAccepted(resp.c_str(), dates, 1) : -1;
    if (k == 1 && store.ackNight(dates[0])) {
      Serial.printf("[TX] noite aceita=%s restantes=%u\n", dates[0],
                    static_cast<unsigned>(store.pendingNights()));
      continue;  // a fila andou; o indice i agora aponta para a proxima
    }
    if (k < 0 && code >= 200 && code < 300) {
      Serial.println("[TX] resposta sem lista 'accepted' (fora do contrato); noite fica na fila");
    }
    all_ok = false;
    ++i;
  }
  return all_ok;
}

static void doSync(const char* reason) {
  Serial.printf("[TX] sincronizacao motivo=%s dias=%u noites=%u\n", reason,
                static_cast<unsigned>(store.pendingDays()),
                static_cast<unsigned>(store.pendingNights()));
  if (store.pendingDays() == 0 && store.pendingNights() == 0) {
    Serial.println("[TX] nada pendente");
    scheduleNextWindow();
    return;
  }
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[TX] sem Wi-Fi; dados continuam na fila");
    scheduleRetry();
    return;
  }
  bool ok = true;
  if (store.pendingDays() > 0) ok = sendDays() && ok;
  if (store.pendingNights() > 0) ok = sendNights() && ok;
  if (ok) {
    scheduleNextWindow();
  } else {
    scheduleRetry();
  }
}

static void demoTick() {
  if (demo_until_ms == 0) return;
  const uint32_t now = millis();
  if (static_cast<int32_t>(now - demo_until_ms) >= 0) {
    demo_until_ms = 0;
    Serial.println("[DEMO] modo ao vivo encerrado");
    return;
  }
  if (static_cast<int32_t>(now - next_demo_ms) < 0) return;
  next_demo_ms = now + DEMO_PERIOD_MS;
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[DEMO] sem Wi-Fi; envio ao vivo pulado");
    return;
  }
  const size_t n = buildLivePayload(store.current().steps + steps_in_minute, nowEpoch(), clockValid(),
                                    tx_buf, sizeof(tx_buf));
  String resp;
  httpPost(PATH_LIVE, tx_buf, n, resp);
}

// ---------------- Botoes ----------------
enum BtnEvent : uint8_t { BTN_NONE = 0, BTN_SHORT = 1, BTN_LONG = 2 };

struct Button {
  uint8_t pin;
  bool raw_prev;
  bool stable;
  uint32_t last_change;
  uint32_t pressed_since;
  bool long_fired;
};

static Button btnA = {PIN_BTN_A, false, false, 0, 0, false};
static Button btnB = {PIN_BTN_B, false, false, 0, 0, false};

static BtnEvent pollButton(Button& b, uint32_t now) {
  BtnEvent ev = BTN_NONE;
  const bool raw = digitalRead(b.pin) == LOW;
  if (raw != b.raw_prev) {
    b.raw_prev = raw;
    b.last_change = now;
  }
  if (now - b.last_change < 30) return BTN_NONE;  // antirrepique de 30 ms
  if (raw != b.stable) {
    b.stable = raw;
    if (b.stable) {
      b.pressed_since = now;
      b.long_fired = false;
    } else if (!b.long_fired) {
      ev = BTN_SHORT;
    }
  }
  if (b.stable && !b.long_fired && now - b.pressed_since >= LONG_PRESS_MS) {
    b.long_fired = true;
    ev = BTN_LONG;
  }
  return ev;
}

static void handleButtons(uint32_t now) {
  const BtnEvent ea = pollButton(btnA, now);
  if (ea == BTN_SHORT) {
    if (!screen_on) {
      Serial.println("[BTN] A toque curto: acender a tela");
      wakeScreen(now);
    } else {
      Serial.println("[BTN] A toque curto: proxima pagina");
      nextPage(now);
    }
  } else if (ea == BTN_LONG) {
    wakeScreen(now);
    demo_until_ms = now + DEMO_DURATION_MS;
    next_demo_ms = now;
    Serial.println("[DEMO] modo ao vivo por 2 min");
  }
  const BtnEvent eb = pollButton(btnB, now);
  if (eb == BTN_SHORT) {
    Serial.println("[BTN] B toque curto: sincronizar agora");
    sync_requested = true;
  }
}

// ---------------- Comandos de teste (so simulacao) ----------------
#if CT_SIM
static void printStatus() {
  const DailyRecord& d = store.current();
  Serial.printf(
      "[QUEUE] hoje data=%s passos_hoje=%lu minutos_ativos=%u minutos_com_dado=%u bateria_agora=%u "
      "dias_pendentes=%u noites_pendentes=%u descartados=%lu wifi=%d hora_valida=%d\n",
      store.currentHasDate() ? d.date : "pendente",
      static_cast<unsigned long>(d.steps + steps_in_minute), d.active_minutes, d.minutes_with_data,
      readBatteryPct(), static_cast<unsigned>(store.pendingDays()),
      static_cast<unsigned>(store.pendingNights()),
      static_cast<unsigned long>(store.droppedDays() + store.droppedNights()),
      WiFi.status() == WL_CONNECTED ? 1 : 0, clockValid() ? 1 : 0);
}

static void pollSerialCommands() {
  static char line[32];
  static size_t len = 0;
  while (Serial.available()) {
    const char c = static_cast<char>(Serial.read());
    if (c == '\r') continue;
    if (c != '\n') {
      if (len < sizeof(line) - 1) line[len++] = c;
      continue;
    }
    line[len] = '\0';
    len = 0;
    if (line[0] == 'T' && line[1] == ' ') {  // T <epoch UTC>: acerta a hora
      const long long epoch = atoll(line + 2);
      setSystemTime(epoch);
      manual_time_lock = true;
      logClock("manual");
    } else if (line[0] == 'Q') {  // Q: mostra o estado das filas
      printStatus();
    } else if (line[0] == 'W') {  // W: liga/desliga uma caminhada simulada (passos sem mexer no MPU)
      sim_walk = !sim_walk;
      Serial.println(sim_walk ? "[SIM] caminhada simulada ligada" : "[SIM] caminhada simulada desligada");
    } else if (line[0] == 'H') {  // H: le a frequencia cardiaca simulada agora
      hrPoll(millis());
      Serial.printf("[HR] dedo=%d bpm=%d\n", hr_finger ? 1 : 0, hr_bpm);
    }
  }
}
#endif

// ---------------- Setup e loop ----------------
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.printf("[BOOT] CareTwin firmware=%s\n", CT_FW_VERSION);

  pinMode(PIN_BTN_A, INPUT_PULLUP);
  pinMode(PIN_BTN_B, INPUT_PULLUP);
  analogReadResolution(12);

  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.setClock(400000);

  imu_ok = initImu();
  Serial.println(imu_ok ? "[IMU] MPU6050 ok (faixa 4 g, 50 Hz)" : "[IMU] MPU6050 nao encontrado");

  initDisplay();
  hrInit();

  // Sem RTC: a hora vem do NTP pelo Wi-Fi. Sem hora valida, o dia nao fecha (e a tela mostra --:--).
  logClock("boot");

  sntp_set_time_sync_notification_cb(onNtpSync);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS, WIFI_CHANNEL);
  Serial.printf("[WIFI] conectando a %s\n", WIFI_SSID);

  scheduleNextWindow();
  next_sample_ms = millis();
  wakeScreen(millis());  // mostra a tela por alguns segundos ao ligar
  Serial.println("[READY] aquisicao iniciada");
}

void loop() {
  const uint32_t now = millis();

  // 1. Aquisicao a 50 Hz. Se o loop atrasar muito (ex.: durante um envio HTTP), as amostras
  //    perdidas simplesmente nao entram no minuto, que pode ficar "sem dado".
  if (static_cast<int32_t>(now - next_sample_ms) >= 0) {
    if (now - next_sample_ms > 200) next_sample_ms = now;
    next_sample_ms += params::SAMPLE_PERIOD_MS;
    sampleOnce();
  }

  // 2. Sensor que sumiu: tenta reiniciar a cada 5 s.
  if (!imu_ok && now - last_imu_retry_ms >= IMU_RETRY_MS) {
    last_imu_retry_ms = now;
    imu_ok = initImu();
    if (imu_ok) Serial.println("[IMU] MPU6050 reconectado");
  }

  // 3. Hora: NTP ao conectar.
  const bool connected = WiFi.status() == WL_CONNECTED;
  if (connected && !wifi_was_connected) {
    Serial.printf("[WIFI] conectado ip=%s\n", WiFi.localIP().toString().c_str());
#if CT_SIM
    if (!manual_time_lock) configTime(0, 0, NTP_SERVER);
#else
    configTime(0, 0, NTP_SERVER);
#endif
  } else if (!connected && wifi_was_connected) {
    Serial.println("[WIFI] desconectado; aquisicao continua offline");
  }
  wifi_was_connected = connected;

  if (ntp_synced_flag) {
    ntp_synced_flag = false;
#if CT_SIM
    if (!manual_time_lock) logClock("ntp");
#else
    logClock("ntp");
#endif
  }

  // 4. Botoes, tela e comunicacao.
  handleButtons(now);
  uiTick(now);
  if (sync_requested) {
    sync_requested = false;
    doSync("pedido");
  } else if (static_cast<int32_t>(now - next_sync_ms) >= 0) {
    doSync("janela");
  }
  demoTick();

#if CT_SIM
  pollSerialCommands();
#endif
}
