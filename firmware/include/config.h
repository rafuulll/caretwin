// Configuracao da pulseira com pecas avulsas. Hardware (ver diagram.json e README.md):
//   ESP32-S3-DevKitC-1 N16R8, MPU-6050, MAX30102, display 1,3" IPS 240x240 (ST7789),
//   TP4056 + LiPo 400 mAh + MT3608 + chave, 2 botoes, divisor 10K+10K para a bateria.
// Na simulacao do Wokwi: display ILI9341 no lugar do ST7789, potenciometro no lugar do MAX30102
// e do divisor da bateria (ver README.md).
#pragma once

#ifndef CT_FW_VERSION
#define CT_FW_VERSION "0.2.0-dev"
#endif

// ---------------- Pinos ----------------
// Barramento I2C unico: MPU-6050 (0x68) e MAX30102 (0x57) no mesmo par de fios.
#define PIN_I2C_SDA 8
#define PIN_I2C_SCL 9
#define IMU_I2C_ADDR 0x68

// Display SPI. SCK = GPIO12 e MOSI = GPIO11 sao os pinos padrao do SPI no ESP32-S3
// (o firmware nao os configura, so documenta). O GPIO13 (MISO) fica livre.
// Se o seu modulo ST7789 nao tem pino CS, ligue CS em GND no modulo e deixe PIN_TFT_CS como esta
// (o GPIO10 simplesmente nao fica ligado a nada).
#define PIN_TFT_CS 10
#define PIN_TFT_DC 7
#define PIN_TFT_RST 16
#define PIN_TFT_BL 15   // luz de fundo (BLK): so acende por alguns segundos

// Botoes (INPUT_PULLUP, ativos em nivel baixo, o outro lado em GND).
#define PIN_BTN_A 4     // toque curto: acende a tela / troca de pagina; toque longo (2 s): modo ao vivo
#define PIN_BTN_B 5     // toque curto: sincronizar agora

// Bateria: no ESP32, ADC1 funciona com o Wi-Fi ligado. Divisor 10K + 10K: o pino le metade da tensao.
#define PIN_BATTERY_ADC 1

// So na simulacao: o Wokwi nao tem MAX30102. Um potenciometro faz o papel da frequencia cardiaca
// (40 a 200 bpm) e um botao faz o papel do dedo no sensor.
#define PIN_SIM_HR 2
#define PIN_SIM_FINGER 6

// ---------------- Rede ----------------
// A senha do Wi-Fi e o token da pulseira ficam em include/segredos.h, que NAO vai para o git
// (esta no .gitignore). Para criar: rode  node ferramentas/cadastrar-pulseira.mjs  dentro de
// firmware, ou copie include/segredos.exemplo.h para include/segredos.h e preencha.
// Na simulacao o segredos.h e ignorado (o Wokwi so conecta no Wokwi-GUEST).
// Sem segredos.h, valem os valores da simulacao abaixo.
#if !CT_SIM
#if __has_include("segredos.h")
#include "segredos.h"
#else
#warning "Sem include/segredos.h: a pulseira vai usar o Wi-Fi e o token da simulacao e a API vai recusar."
#endif
#endif

#ifndef WIFI_SSID
#define WIFI_SSID "Wokwi-GUEST"   // rede virtual do Wokwi, sem senha
#endif
#ifndef WIFI_PASS
#define WIFI_PASS ""
#endif
#ifndef WIFI_CHANNEL
#if CT_SIM
#define WIFI_CHANNEL 6            // canal do Wokwi-GUEST (conecta mais rapido)
#else
#define WIFI_CHANNEL 0            // 0 = procura o canal da rede (ESP32 so enxerga redes de 2,4 GHz)
#endif
#endif
#define NTP_SERVER "pool.ntp.org"

// Simulacao: os envios vao para um servico de eco (httpbin), que devolve o que recebeu.
// Pulseira: a API real na Vercel (rotas /api/v1/device/*).
#ifndef API_BASE_URL
#if CT_SIM
#define API_BASE_URL "https://httpbin.org/anything"
#else
#define API_BASE_URL "https://caretwin-omega.vercel.app/api"
#endif
#endif
#define PATH_DAILY "/v1/device/daily"
#define PATH_NIGHTS "/v1/device/nights"
#define PATH_LIVE "/v1/device/live"

// Token do dispositivo. O de verdade fica so em segredos.h, nunca no codigo.
#ifndef DEVICE_TOKEN
#define DEVICE_TOKEN "sim-token-nao-secreto"
#endif

// Certificados raiz aceitos pela pulseira (cartao 5.7). Na simulacao nao sao usados.
#include "certificados.h"

// ---------------- Tempos ----------------
#if CT_SIM
#define SYNC_INTERVAL_MS (3UL * 60UL * 1000UL)    // simulacao: a cada 3 min, para dar para ver
#else
#define SYNC_INTERVAL_MS (3UL * 3600UL * 1000UL)  // pulseira: a cada 3 h
#endif
#define HTTP_TIMEOUT_MS 8000
#define LONG_PRESS_MS 2000
#define DEMO_DURATION_MS (2UL * 60UL * 1000UL)
#define DEMO_PERIOD_MS 5000
#define IMU_RETRY_MS 5000
#define SCREEN_ON_MS 10000UL     // a tela (e a luz de fundo) apagam sozinhas depois disso
#define HR_FINGER_IR_MIN 50000   // MAX30102: leitura IR acima disso = dedo no sensor
