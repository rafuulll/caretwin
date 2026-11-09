// Teste de bancada: MPU-6050 (passos) e MAX30102 (batimento) no barramento I2C.
// Nao faz parte do firmware da pulseira. Compile e grave com:
//   pio run -e teste_sensores -t upload
//   pio device monitor        (115200)
// Usa os pinos do include/config.h (SDA = GPIO8, SCL = GPIO9). Nao precisa de biblioteca extra.
//
// O que voce deve ver no monitor:
//  1) "achei 0x68" (MPU-6050) e/ou "achei 0x57" (MAX30102). Se nao achar, e fio ou contato.
//  2) MPU: ax, ay, az em g. Parado em cima da mesa, o modulo (total) fica perto de 1.00.
//     Incline ou balance o modulo e os numeros mudam.
//  3) MAX30102: valores de IR e RED. Sem dedo ficam baixos (centenas ou poucos milhares).
//     Com o dedo em cima do sensor, o IR sobe para dezenas de milhares e aparece "DEDO".
#include <Arduino.h>
#include <Wire.h>
#include "config.h"

static const uint8_t MPU_ADDR = IMU_I2C_ADDR;  // 0x68
static const uint8_t MAX_ADDR = 0x57;

static bool presente(uint8_t addr) {
  Wire.beginTransmission(addr);
  return Wire.endTransmission() == 0;
}

static bool escreve(uint8_t addr, uint8_t reg, uint8_t val) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.write(val);
  return Wire.endTransmission() == 0;
}

static bool le(uint8_t addr, uint8_t reg, uint8_t *buf, uint8_t n) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom(static_cast<int>(addr), static_cast<int>(n)) != n) return false;
  for (uint8_t i = 0; i < n; i++) buf[i] = Wire.read();
  return true;
}

static bool tem_mpu = false;
static bool tem_max = false;

static void iniciaMax() {
  escreve(MAX_ADDR, 0x09, 0x40);  // reset
  delay(100);
  escreve(MAX_ADDR, 0x04, 0x00);  // zera ponteiros da FIFO
  escreve(MAX_ADDR, 0x05, 0x00);
  escreve(MAX_ADDR, 0x06, 0x00);
  escreve(MAX_ADDR, 0x08, 0x0F);  // FIFO: sem media
  escreve(MAX_ADDR, 0x0A, 0x27);  // SpO2: 100 amostras/s, pulso de 411 us
  escreve(MAX_ADDR, 0x0C, 0x24);  // LED vermelho
  escreve(MAX_ADDR, 0x0D, 0x24);  // LED infravermelho
  escreve(MAX_ADDR, 0x09, 0x03);  // modo SpO2 (vermelho + infravermelho)
}

// Procura os sensores e configura os que achar. Devolve quantos dispositivos respondem.
static int iniciaSensores() {
  int achados = 0;
  for (uint8_t a = 0x08; a < 0x78; a++) {
    if (presente(a)) {
      Serial.printf("[SENSORES] achei 0x%02X\n", a);
      achados++;
    }
  }
  tem_mpu = presente(MPU_ADDR);
  tem_max = presente(MAX_ADDR);

  if (tem_mpu) {
    escreve(MPU_ADDR, 0x6B, 0x00);  // tira o MPU do modo de espera
    uint8_t quem = 0;
    if (le(MPU_ADDR, 0x75, &quem, 1)) Serial.printf("[MPU] WHO_AM_I = 0x%02X (esperado 0x68; clones podem dar 0x70 ou 0x71)\n", quem);
  }
  if (tem_max) {
    uint8_t id = 0;
    if (le(MAX_ADDR, 0xFF, &id, 1)) Serial.printf("[MAX] part ID = 0x%02X (esperado 0x15)\n", id);
    iniciaMax();
  }
  return achados;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("[SENSORES] teste de MPU-6050 e MAX30102");
  Serial.printf("[SENSORES] SDA=GPIO%d SCL=GPIO%d\n", PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.setClock(100000);  // 100 kHz: mais tolerante a contato ruim
  if (iniciaSensores() == 0) {
    Serial.println("[SENSORES] nenhum dispositivo ainda. Vou procurar de novo a cada segundo:");
    Serial.println("[SENSORES] mexa nos fios e aperte os modulos e o ESP32 com o dedo.");
  }
}

void loop() {
  if (!tem_mpu && !tem_max) {
    // Nada achado: mostra o nivel das linhas e tenta de novo. 1 = a linha esta ligada a um modulo
    // com energia (os modulos tem resistor de pull-up). 0 = linha solta, em curto ou sem energia.
    Serial.printf("[SENSORES] procurando... SDA(GPIO%d)=%d SCL(GPIO%d)=%d\n",
                  PIN_I2C_SDA, digitalRead(PIN_I2C_SDA), PIN_I2C_SCL, digitalRead(PIN_I2C_SCL));
    if (iniciaSensores() > 0) Serial.println("[SENSORES] achei! lendo...");
    delay(1000);
    return;
  }
  if (tem_mpu) {
    uint8_t b[6];
    if (le(MPU_ADDR, 0x3B, b, 6)) {
      const float ax = static_cast<int16_t>((b[0] << 8) | b[1]) / 16384.0f;
      const float ay = static_cast<int16_t>((b[2] << 8) | b[3]) / 16384.0f;
      const float az = static_cast<int16_t>((b[4] << 8) | b[5]) / 16384.0f;
      const float total = sqrtf(ax * ax + ay * ay + az * az);
      Serial.printf("[MPU] ax=%.2f ay=%.2f az=%.2f g  total=%.2f\n", ax, ay, az, total);
    } else {
      Serial.println("[MPU] falha de leitura (contato?)");
    }
  }

  if (tem_max) {
    uint8_t wr = 0, rd = 0;
    if (le(MAX_ADDR, 0x04, &wr, 1) && le(MAX_ADDR, 0x06, &rd, 1)) {
      uint8_t n = (wr - rd) & 0x1F;
      uint32_t red = 0, ir = 0;
      bool leu = false;
      for (uint8_t k = 0; k < n; k++) {
        uint8_t d[6];
        if (!le(MAX_ADDR, 0x07, d, 6)) break;
        red = ((static_cast<uint32_t>(d[0]) << 16) | (d[1] << 8) | d[2]) & 0x3FFFF;
        ir = ((static_cast<uint32_t>(d[3]) << 16) | (d[4] << 8) | d[5]) & 0x3FFFF;
        leu = true;
      }
      if (leu) Serial.printf("[MAX] IR=%lu RED=%lu  %s\n", static_cast<unsigned long>(ir), static_cast<unsigned long>(red), ir > 50000 ? "DEDO" : "sem dedo");
    } else {
      Serial.println("[MAX] falha de leitura (contato?)");
    }
  }
  delay(200);
}
