# firmware (pulseira)

Projeto PlatformIO unico da pulseira: ESP32-S3, MPU-6050 (passos), MAX30102 (batimentos, teste de bancada), display 1,3" ST7789, bateria LiPo. Roda no simulador Wokwi, entao qualquer pessoa do grupo testa sem a placa.

Quem so precisa dos DADOS da pulseira (backend, IA, site) nao precisa disto: use o simulador Python em ../simulador.

## Estrutura

  platformio.ini            tres ambientes: wokwi (simulacao), real (placa de verdade), native (testes no PC)
  src/main.cpp              programa da pulseira: telas, botoes, Wi-Fi, envio para a API
  include/config.h          pinos, Wi-Fi, URL da API, token do dispositivo, tempos
  lib/caretwin_core/        nucleo testado: validacao, passos, fechamento do dia, fila, JSON do contrato v1
  test/test_core/           15 testes unitarios do nucleo (rodam no computador)
  test/scenarios/           cenarios automaticos do Wokwi (01 a 06)
  diagram.json, wokwi.toml  circuito simulado e configuracao do Wokwi

## Como rodar a simulacao

1. No VS Code, instale as extensoes PlatformIO IDE e Wokwi Simulator.
2. Abra ESTA pasta (File, Open Folder, caretwin_2/firmware). O Wokwi e o PlatformIO procuram o wokwi.toml e o platformio.ini na raiz da pasta aberta.
3. Compile: aba do PlatformIO, ambiente wokwi, General, Build (ou no terminal: pio run -e wokwi). A primeira vez baixa as ferramentas e demora.
4. F1, Wokwi: Start Simulator.

Erro "firmware binary .pio/build/wokwi/firmware.bin not found": faltou o passo 3.
Erro "MissingPackageManifestError" ao compilar: apague a pasta do pacote que o erro cita (em C:\Users\SEUUSUARIO\.platformio\packages) e compile de novo. Foi um download incompleto.

## Testes

  pio test -e native        testes unitarios do nucleo, no computador (nao precisa de placa)
  Cenarios do Wokwi        test/scenarios/*.yaml, para o Wokwi CLI ou para o CI no futuro

## O que e simulado e o que nao e

| Peca real | No Wokwi | Observacao |
| --- | --- | --- |
| ESP32-S3-DevKitC-1 N16R8 | board-esp32-s3-devkitc-1 | igual |
| MPU-6050 | wokwi-mpu6050 | igual; passos pelo detector do nucleo |
| Display ST7789 1,3" 240x240 | wokwi-ili9341 | o Wokwi nao tem ST7789; a interface usa so os 240x240 do topo, troca so o driver |
| MAX30102 | potenciometro pot2 + botao btn3 | pot2 = bpm (40 a 200), tecla F = dedo no sensor |
| Divisor 10K+10K da bateria | potenciometro pot1 no GPIO1 | pot1 = 3,30 V (0%) a 4,20 V (100%) |
| TP4056, MT3608, chave, LiPo | nao simulados | so existem na montagem real |
| Botoes A e B | btn1 (tecla A) e btn2 (tecla B) | igual |

## Controles

- A, toque curto: acende a tela; com a tela acesa, troca de pagina (Resumo, Coracao, Sistema).
- A, toque longo (2 s): modo ao vivo por 2 min (envia os passos de hoje a cada 5 s).
- B, toque curto: sincronizar agora.
- A tela apaga sozinha depois de 10 s.
- Monitor serial (so na simulacao): W liga e desliga uma caminhada simulada, T <epoch> acerta a hora, Q mostra filas e bateria, H mostra o bpm simulado.

## Pinos (iguais na simulacao e na placa real)

| GPIO | Funcao |
| --- | --- |
| 1 | Bateria: juncao do divisor 10K+10K (ADC1) |
| 2 | So simulacao: potenciometro do bpm |
| 4 | Botao A |
| 5 | Botao B |
| 6 | So simulacao: botao dedo no sensor |
| 7 | Display DC |
| 8 | I2C SDA (MPU-6050 e MAX30102) |
| 9 | I2C SCL (MPU-6050 e MAX30102) |
| 10 | Display CS |
| 11 | Display SDA/MOSI |
| 12 | Display SCL/SCK |
| 14 | Display RES |
| 15 | Display BLK (luz de fundo) |

Pinos evitados de proposito: 0, 3, 45 e 46 (inicializacao), 19 e 20 (USB), 26 a 37 (memoria do modulo N16R8), 43 e 44 (serial) e 48 (LED da placa).

## Conversa com a API

A pulseira envia para a URL de include/config.h (API_BASE_URL) com o cabecalho Authorization: Device <DEVICE_TOKEN>, nas rotas /v1/device/daily, /nights e /live do contrato (../docs/openapi.yaml). Por padrao aponta para o eco do httpbin, que nao confirma nada.

O Wokwi gratuito nao alcanca o computador (localhost). Para testar a API de verdade sem a placa, use o simulador Python em ../simulador. Com a placa real na mesma rede Wi-Fi, API_BASE_URL = http://IP-DO-COMPUTADOR:8080 funciona com a API falsa ou com a API real.

## Montagem real

Sensores e display (tudo em 3,3 V):

| Modulo | Ligacoes |
| --- | --- |
| MPU-6050 | VCC para 3V3, GND para GND, SDA para GPIO8, SCL para GPIO9, AD0 sem ligar (endereco 0x68) |
| MAX30102 | VIN para 3V3, GND para GND, SDA para GPIO8, SCL para GPIO9, INT sem ligar (endereco 0x57) |
| Display ST7789 | VCC para 3V3, GND para GND, SCL para GPIO12, SDA para GPIO11, RES para GPIO14, DC para GPIO7, CS para GPIO10, BLK para GPIO15 |
| Botao A / B | um lado em GPIO4 / GPIO5, o outro em GND |

Se o modulo de display nao tiver pino CS, deixe o GPIO10 sem ligar.

Energia (solde a bateria por ultimo, depois de testar tudo pelo USB):

1. Bateria LiPo + e - nas entradas B+ e B- do TP4056.
2. OUT+ do TP4056 para a chave e dela para VIN+ do MT3608. OUT- para VIN-.
3. Antes de ligar ao ESP32, ajuste o MT3608 para 5,0 V na saida, medindo com o multimetro.
4. OUT+ do MT3608 no pino 5V do ESP32-S3 e OUT- no GND.
5. Divisor da bateria, depois da chave: positivo da bateria, 10K, GPIO1, 10K, GND. O firmware multiplica a leitura por 2.
6. Nunca ligue o cabo USB e a bateria ao mesmo tempo.

## Ambiente real

pio run -e real troca o display para ST7789, o bpm simulado pelo MAX30102 e a bateria simulada pela leitura do divisor. Se a imagem do display sair torta ou apagada, troque SPI_MODE2 por SPI_MODE3 em initDisplay() (src/main.cpp).

## Limitacoes conhecidas

- O ambiente real nunca rodou em hardware: MAX30102 e ST7789 reais ainda nao foram testados com este codigo.
- Sem relogio de tempo real: a hora vem do Wi-Fi (NTP). Sem Wi-Fi apos reiniciar, o dia nao fecha.
- Bateria: Wi-Fi sempre ligado e amostragem a 50 Hz sem dormir descarregam uma LiPo de 400 mAh em horas, nao em dias. Para o teste de campo de 5 dias falta economia de energia ou bateria maior.
- Luz de fundo ligada direto no GPIO15: ok para teste; para uso continuo use um transistor.
- Batimentos sao teste de bancada, aparecem so na tela e nao entram nos dados enviados.
- Curva da bateria e limiares de passos sao estimativas a calibrar na bancada.
