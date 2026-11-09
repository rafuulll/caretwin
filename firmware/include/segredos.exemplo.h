// Modelo do include/segredos.h. O segredos.h de verdade NAO vai para o git (esta no .gitignore).
//
// Jeito facil: dentro da pasta firmware, rode
//   node ferramentas/cadastrar-pulseira.mjs
// Ele gera o token, cria o segredos.h a partir deste modelo e mostra o SQL para cadastrar a
// pulseira no Supabase. Depois e so trocar o nome e a senha do Wi-Fi abaixo.
//
// Jeito manual: copie este arquivo para segredos.h, na mesma pasta, e preencha.
#pragma once

// Rede Wi-Fi de 2,4 GHz (o ESP32 nao enxerga redes de 5 GHz).
#define WIFI_SSID "nome-da-sua-rede"
#define WIFI_PASS "senha-da-sua-rede"

// Token secreto da pulseira. O banco guarda so o sha256 dele (pulseiras.token_hash).
#define DEVICE_TOKEN "troque-pelo-token-gerado"
