// Teste de bancada: display ST7789 + botao A (e B, se estiver ligado).
// Nao faz parte do firmware da pulseira. Compile e grave com:
//   pio run -e teste_hw -t upload
//   pio device monitor        (115200)
// Usa os pinos do include/config.h.
//
// O que voce deve ver:
//  1) A tela passa por vermelho, verde, azul, branco e preto (testa cor e fios).
//  2) Depois aparece a tela de teste. Aperte o botao A: a linha "Botao A" vira APERTADO,
//     o contador sobe e o quadrado de baixo troca de cor.
//  3) O tempo ligado sobe de 1 em 1 segundo (mostra que o programa nao travou).
#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>
#include "config.h"

// Se a imagem sair torta, deslocada ou apagada, troque por SPI_MODE3 (ou use o ambiente teste_hw_modo3).
#ifndef TEST_SPI_MODE
#define TEST_SPI_MODE SPI_MODE2
#endif

static Adafruit_ST7789 tft(PIN_TFT_CS, PIN_TFT_DC, PIN_TFT_RST);

static const uint16_t CORES[] = {ST77XX_RED, ST77XX_GREEN, ST77XX_BLUE, ST77XX_YELLOW, ST77XX_MAGENTA, ST77XX_CYAN};
static const uint8_t N_CORES = sizeof(CORES) / sizeof(CORES[0]);

struct Botao {
  uint8_t pino;
  bool estavel;        // true = apertado
  bool lido;
  uint32_t desde_ms;
  uint16_t toques;
};

static Botao btnA = {PIN_BTN_A, false, false, 0, 0};
static Botao btnB = {PIN_BTN_B, false, false, 0, 0};

// Atualiza o botao com filtro de 30 ms. Devolve true no instante em que ele muda.
static bool atualizaBotao(Botao &b, uint32_t agora) {
  const bool leitura = (digitalRead(b.pino) == LOW);  // INPUT_PULLUP: apertado = LOW
  if (leitura != b.lido) {
    b.lido = leitura;
    b.desde_ms = agora;
  }
  if (leitura != b.estavel && (agora - b.desde_ms) >= 30) {
    b.estavel = leitura;
    if (leitura) b.toques++;
    return true;
  }
  return false;
}

static void linha(int y, const char *texto, uint16_t cor) {
  tft.fillRect(0, y, 240, 24, ST77XX_BLACK);
  tft.setTextColor(cor);
  tft.setTextSize(2);
  tft.setCursor(8, y + 4);
  tft.print(texto);
}

static void desenhaBotao(int y, const char *nome, const Botao &b) {
  char buf[32];
  snprintf(buf, sizeof(buf), "%s %s  (%u)", nome, b.estavel ? "APERTADO" : "solto", b.toques);
  linha(y, buf, b.estavel ? ST77XX_GREEN : ST77XX_WHITE);
}

static void desenhaTempo(uint32_t agora) {
  char buf[32];
  snprintf(buf, sizeof(buf), "Ligado ha %lu s", static_cast<unsigned long>(agora / 1000));
  linha(150, buf, ST77XX_CYAN);
}

static void telaFixa() {
  tft.fillScreen(ST77XX_BLACK);
  linha(8, "CareTwin teste", ST77XX_YELLOW);
  linha(34, "Aperte o botao A", ST77XX_WHITE);
}

void setup() {
  Serial.begin(115200);
  delay(400);
  Serial.println();
  Serial.println("[TESTE] display + botoes");
  Serial.printf("[TESTE] pinos: CS=%d DC=%d RST=%d BLK=%d  BTN_A=%d BTN_B=%d\n",
                PIN_TFT_CS, PIN_TFT_DC, PIN_TFT_RST, PIN_TFT_BL, PIN_BTN_A, PIN_BTN_B);

  pinMode(PIN_BTN_A, INPUT_PULLUP);
  pinMode(PIN_BTN_B, INPUT_PULLUP);
  pinMode(PIN_TFT_BL, OUTPUT);
  digitalWrite(PIN_TFT_BL, HIGH);  // luz de fundo ligada o teste todo

  tft.init(240, 240, TEST_SPI_MODE);
  tft.setRotation(0);
  Serial.println("[TESTE] display iniciado");

  const char *nomes[] = {"VERMELHO", "VERDE", "AZUL", "AMARELO", "ROSA", "CIANO"};
  for (uint8_t i = 0; i < N_CORES; i++) {
    tft.fillScreen(CORES[i]);
    tft.setTextColor(ST77XX_BLACK);
    tft.setTextSize(3);
    tft.setCursor(20, 105);
    tft.print(nomes[i]);
    Serial.printf("[TESTE] tela %s\n", nomes[i]);
    delay(700);
  }
  telaFixa();
  desenhaBotao(70, "Botao A", btnA);
  desenhaBotao(100, "Botao B", btnB);
  desenhaTempo(millis());
  Serial.println("[TESTE] pronto: aperte o botao A");
}

void loop() {
  const uint32_t agora = millis();
  static uint32_t ultimo_s = 0;
  static uint8_t cor_quadrado = 0;

  if (atualizaBotao(btnA, agora)) {
    desenhaBotao(70, "Botao A", btnA);
    if (btnA.estavel) {
      cor_quadrado = (cor_quadrado + 1) % N_CORES;
      tft.fillRect(70, 184, 100, 50, CORES[cor_quadrado]);
      Serial.printf("[TESTE] botao A apertado (%u)\n", btnA.toques);
    } else {
      Serial.println("[TESTE] botao A solto");
    }
  }
  if (atualizaBotao(btnB, agora)) {
    desenhaBotao(100, "Botao B", btnB);
    Serial.println(btnB.estavel ? "[TESTE] botao B apertado" : "[TESTE] botao B solto");
  }
  if (agora - ultimo_s >= 1000) {
    ultimo_s = agora;
    desenhaTempo(agora);
  }
}
