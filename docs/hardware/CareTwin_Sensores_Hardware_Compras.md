# CareTwin — Sensores, hardware mínimo e lista de compras

Data: 23/09/2026 · Base: CareTwin MVP v1, Auditoria de produto, Arquitetura completa (pacote vitrine + sensores) · Câmbio usado: US$ 1 = R$ 5,13 (dólar comercial, 23/09/2026)

Marcas: **[E]** evidência ou dado de fabricante/loja consultado · **[D]** declarado na pesquisa · **[H]** estimativa ou hipótese a confirmar na bancada

## Resumo

- O MVP precisa de **um único sensor obrigatório**: um acelerômetro com contador de passos. Ele responde ao problema central (atividade vs. o próprio normal), indica se a pulseira foi usada e, à noite, alimenta o sono estimado.
- A plataforma recomendada, **LilyGO T-Watch S3**, já traz esse sensor (BMA423), bateria, carregamento, tela e relógio interno. Comprar 3 unidades agora.
- **Opcional**, só depois do portão de 20/10: sensor óptico **MAX30102** para a FC de bancada, mais um oxímetro de dedo com registro Anvisa como referência.
- **Descartados** para o MVP: pressão, ECG, temperatura, estresse (GSR), GPS, SpO2 como leitura, microfone e o IMU BMI270 (este volta com a pulseira própria, no futuro).
- **Comprar agora:** cerca de R$ 1.000 a R$ 1.510 (3 relógios + 1 placa de desenvolvimento). **Depois do portão:** cerca de R$ 225 a R$ 250.

## 0. Regras usadas

1. Um sensor só entra se responde a um problema do MVP. Parecer interessante ou impressionar não conta.
2. Um dado derivado do mesmo sensor vale mais que um sensor novo: menos peças, menos consumo, menos risco.
3. Nada é comprado se depender de uma decisão ainda aberta. Itens com entrega rápida no Brasil esperam a decisão; itens importados necessários de qualquer forma são comprados já.

## 1. Do problema ao sensor

| Problema (MVP) | Informação necessária | Variável a medir | Sensor possível | Qualidade do sinal | Custo | Complexidade | Necessidade no MVP |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ver se a atividade dos últimos dias mudou em relação ao próprio normal (F3, F4) | Passos por dia | Aceleração em 3 eixos → contagem de passos | Acelerômetro com contador de passos (BMA423 no T-Watch S3; alternativas BMI270, MPU-6050) | Boa para comparar a pessoa com ela mesma, porque o erro do mesmo sensor tende a se repetir; o erro absoluto no pulso não é publicado [H] | Incluso no relógio | Baixa: contador em hardware | **Obrigatório** |
| Saber se o dia tem dado suficiente (dados ausentes) | Tempo de uso | Minutos com movimento acima de um limiar | O mesmo acelerômetro | Indicador imperfeito: parado com a pulseira parece "sem uso" [H] | Zero | Baixa | **Obrigatório** (derivado, sem sensor novo) |
| Fechar o dia na data certa mesmo offline | Hora | Hora local | Relógio interno do relógio + NTP ao conectar | Boa | Zero | Baixa | **Obrigatório** (plataforma) |
| Avisar "carregue hoje" e medir a autonomia | Nível de bateria | Tensão e estado de carga | Gerenciador de energia AXP2101 do T-Watch S3 | Boa | Zero | Baixa | **Obrigatório** (plataforma) |
| Sono estimado (vitrine, depois do portão de 20/10) | Início, fim e duração estimados | Movimento por minuto à noite | O mesmo acelerômetro | Actigrafia validada: sensibilidade 0,965 para sono e especificidade 0,329 para vigília [E, Marino et al. 2013]; o CareTwin usa um algoritmo mais simples | Zero | Média (algoritmo) | Opcional, **sem compra** |
| FC de bancada (vitrine, depois do portão de 20/10) | BPM em repouso | Pulso óptico (PPG) | MAX30102 | Aceitável em repouso com contato firme; sofre muito com movimento [E, ElectricalFlux] | R$ 32 a 37 por módulo | Média | Opcional, **comprar depois do portão** |
| Mostrar que a FC de bancada foi conferida | BPM de referência | Pulso | Oxímetro de dedo com registro Anvisa | Alta: ±2 bpm entre 30 e 99 bpm, declarado para o modelo G-Tech LED [E] | Cerca de R$ 142 | Baixa | Opcional, junto com a FC |
| Pedidos fora do MVP: pressão, oxigenação, temperatura, estresse, ECG, localização, quedas, glicose | — | — | Ver seção 2 | — | — | — | **Descartados** |

## 2. Fichas dos sensores candidatos

### 2.1 BMA423 (dentro do LilyGO T-Watch S3) · OBRIGATÓRIO

| Atributo | Valor |
| --- | --- |
| Variável medida | Aceleração em 3 eixos; contador de passos em hardware [E, LilyGO] |
| Precisão aproximada | Não encontrei valor publicado para passos no pulso [H]. Meta da equipe: diferença diária de até 20% para os passos do celular em 5 de 7 dias |
| Interface | I2C, já ligada dentro do relógio |
| Consumo | Baixo; o relógio completo tem autonomia de fábrica de cerca de 48 h em espera, com a tela acesa 15 s a cada 2 h [E, Tindie] |
| Facilidade de integração | Alta: exemplos oficiais do fabricante |
| Bibliotecas | TTGO_TWatch_Library, branch t-watch-s3 [E, wiki LilyGO] |
| Disponibilidade no Brasil | Só dentro do relógio; importado (LilyGO, Tindie, AliExpress) ou revenda no Mercado Livre |
| Custo estimado | Incluso no relógio |
| Limitações | Sem giroscópio; contadores de pulso tendem a errar com carrinho de compras, braço parado ou gestos repetitivos [H] |
| Risco | Médio: calibração e prazo de importação |
| Necessidade no MVP | **Obrigatório** |

### 2.2 BMI270 (IMU avulso) · DESCARTADO AGORA, FUTURO

| Atributo | Valor |
| --- | --- |
| Variável medida | Aceleração e giro (6 eixos); contador de passos otimizado para pulso [E, Bosch] |
| Precisão aproximada | Não publicada para passos [H] |
| Interface | I2C ou SPI |
| Consumo | 685 µA na taxa máxima [E, Bosch] |
| Facilidade de integração | Média: exige montar a pulseira inteira |
| Bibliotecas | SparkFun BMI270 Arduino Library; API da Bosch |
| Disponibilidade no Brasil | Não encontrei em lojas nacionais; SparkFun e Melopero vendem no exterior |
| Custo estimado | Importado; preço não verificado |
| Limitações | Só faz sentido com a pulseira própria (placa, bateria, carga, caixa) |
| Risco | Alto para o prazo |
| Necessidade no MVP | **Descartado agora**; volta com a pulseira própria |

### 2.3 MPU-6050 (módulo GY-521) · PLANO B CONDICIONAL

| Atributo | Valor |
| --- | --- |
| Variável medida | Aceleração e giro (6 eixos); sem contador de passos em hardware |
| Precisão aproximada | Depende do algoritmo de passos que a equipe escrever [H] |
| Interface | I2C |
| Consumo | Maior que o dos IMUs de wearable, sobretudo com o giroscópio ligado [H, conferir datasheet] |
| Facilidade de integração | Alta para ler dados; baixa para contar passos bem |
| Bibliotecas | Adafruit MPU6050 |
| Disponibilidade no Brasil | Fácil: Eletrogate R$ 26,90, MakerHero R$ 22,90, em estoque [E] |
| Custo estimado | R$ 23 a 27 |
| Limitações | Projeto antigo; consumo alto para pulso; passos por software |
| Risco | Médio |
| Necessidade no MVP | **Só plano B**: comprar apenas se o relógio não tiver previsão de entrega até 10/10, para não parar o firmware |

### 2.4 MAX30102 (pulso óptico) · OPCIONAL, DEPOIS DO PORTÃO

| Atributo | Valor |
| --- | --- |
| Variável medida | Sinal PPG vermelho e infravermelho → FC; oxigenação só com calibração |
| Precisão aproximada | Sem valor garantido nos módulos vendidos; em repouso com contato firme, esperar poucos bpm de diferença para o oxímetro [H]; com movimento, o sinal fica inutilizável [E, ElectricalFlux] |
| Interface | I2C |
| Consumo | Monitor de FC abaixo de 1 mW; 0,7 µA desligado [E, Analog Devices] |
| Facilidade de integração | Média: filtro e detecção de picos |
| Bibliotecas | SparkFun MAX3010x Sensor Library |
| Disponibilidade no Brasil | Usinainfo R$ 32,21 no Pix, em estoque; Curto Circuito R$ 36,90 e Baú da Eletrônica sem estoque em 23/09/2026 [E] |
| Custo estimado | R$ 32 a 37 por módulo |
| Limitações | Módulos genéricos variam muito; luz ambiente, perfusão e pressão sobre a pele mudam o sinal; não é dispositivo médico [E, Usinainfo] |
| Risco | Médio |
| Necessidade no MVP | **Opcional**, só na bancada e só depois do portão de 20/10 |

### 2.5 Oxímetro de dedo com registro Anvisa (instrumento de referência, não faz parte do sistema)

| Atributo | Valor |
| --- | --- |
| Variável medida | Oxigenação e FC |
| Precisão aproximada | FC ±2 bpm entre 30 e 99 bpm (G-Tech LED, declarado) [E] |
| Interface | Nenhuma: leitura na tela, digitada no painel de demonstração |
| Consumo, bibliotecas | Não se aplica |
| Disponibilidade no Brasil | Farmácias e marketplaces |
| Custo estimado | R$ 142,41 no Pix (G-Tech OLED, Magalu) [E]; zero se alguém da equipe já tiver um com registro Anvisa |
| Limitações | Serve para comparar, não para calibrar o MAX30102 |
| Risco | Baixo |
| Necessidade no MVP | **Opcional**, junto com a FC de bancada |

### 2.6 Descartados

| Sensor | Variável | Por que sai do MVP |
| --- | --- | --- |
| Pressão arterial (sensor sem braçadeira ou manguito DIY com sensor de pressão) | Pressão | Nenhum aparelho sem braçadeira tem precisão adequada para uso clínico, segundo revisão de 2025 na Hypertension Research; o primeiro liberado pela FDA exigiu ensaio clínico e calibração mensal. Manguito DIY envolve bomba, válvula e segurança do usuário |
| AD8232 (ECG de 1 derivação) | Atividade elétrica do coração | Exige eletrodos com gel; interpretação é clínica; nenhum problema do MVP pede ECG |
| MAX30205 (temperatura da pele) | Temperatura | Nenhum problema do MVP; a temperatura da pele varia com o ambiente |
| GSR (condutância da pele) | "Estresse" | Estresse interessa a 20 de 34 [D], mas o sinal é ruidoso e sem interpretação validada para o produto |
| GPS (ex.: NEO-6M) | Localização | Localização está fora do escopo; alto consumo e dado mais sensível |
| Oxigenação (SpO2) como leitura | SpO2 | Mesmo chip da FC, mas exige calibração e soa clínica; nenhuma necessidade no MVP |
| Microfone do T-Watch S3 | Som | Existe no relógio; fica desligado por privacidade |
| Rádio LoRa do T-Watch S3 | — | Vem no relógio; não é usado e fica desligado |
| Glicose sem agulha | Glicemia | Não existe sensor confiável acessível |

## 3. Resultado

**1. Sensores obrigatórios**

- Acelerômetro com contador de passos: BMA423, dentro do LilyGO T-Watch S3.
- Da plataforma, sem ser sensor de saúde: relógio interno (hora offline) e gerenciador de energia AXP2101 (bateria).

**2. Sensores opcionais (só depois do portão de 20/10)**

- MAX30102 na bancada, para FC em repouso durante a demonstração.
- Oxímetro de dedo com registro Anvisa, como referência.
- Sono estimado não precisa de sensor novo: usa o mesmo acelerômetro.

**3. Sensores descartados**

- Pressão, ECG, temperatura, GSR, GPS, SpO2 como leitura, glicose, microfone e LoRa (desligados).
- BMI270: fora agora; volta com a pulseira própria.
- MPU-6050: só como plano B de desenvolvimento.

**4. Justificativa**

- O problema central do MVP é comparar a atividade da pessoa com o normal dela. Isso exige passos por dia, e um único acelerômetro entrega passos, tempo de uso e movimento noturno.
- A FC entra só como demonstração de bancada porque tem pouca demanda (7 de 34) [D] e o sinal óptico no pulso falha com movimento. Por isso fica fora da leitura e de qualquer aviso.
- Os descartados ou não respondem a um problema do MVP, ou não têm precisão defensável num protótipo de 8 semanas, ou aumentam consumo e risco de privacidade.

## 4. Configuração mínima de hardware

### 4.1 Pulseira (3 unidades)

| Item | O que é usado | O que não é usado |
| --- | --- | --- |
| LilyGO T-Watch S3, variante 915 MHz | ESP32-S3 com Wi-Fi; BMA423 (passos, movimento por minuto); AXP2101 (bateria e carga); tela de 1,54" 240×240 com toque; hora interna | LoRa, microfone, alto-falante |
| Bateria | Integrada: 470 mAh segundo o wiki da LilyGO, 400 mAh segundo o anúncio no Tindie. Conferir na unidade recebida | — |
| Carregamento | Cabo Micro-USB que acompanha o relógio, ligado a qualquer carregador USB de 5 V. O fabricante recomenda corrente de carga abaixo de 130 mA | Base magnética e carregamento sem fio (futuro) |
| Autonomia | Meta do MVP: 24 h ou mais com Wi-Fi a cada 3 h [H]; medir na semana 4 | — |

A variante de 915 MHz é a que corresponde à faixa usada no Brasil. Como o LoRa fica desligado, a escolha não muda o funcionamento.

### 4.2 Bancada de FC (1 conjunto, depois do portão)

```text
ESP32-S3-DevKitC-1            MAX30102 (módulo)
   3V3  --------------------  VIN
   GND  --------------------  GND
   GPIO (SDA) --------------  SDA
   GPIO (SCL) --------------  SCL
   USB-C -> notebook (energia e monitor serial)

Sensor preso ao dedo ou ao pulso com faixa elástica + espuma.
Oxímetro de dedo na outra mão, como referência.
```

Conferir no módulo comprado a tensão de alimentação indicada; os módulos variam (ex.: 3,3 a 5 V na Usinainfo).

### 4.3 Desenvolvimento enquanto o relógio não chega

- A mesma ESP32-S3-DevKitC-1 roda o firmware de sincronização, fila offline, HTTPS e NTP, com passos simulados.
- Quando o relógio chega, o código de passos passa a usar o BMA423. A placa depois vira a base da bancada.

## 5. Lista de compras

Preços consultados em 23/09/2026; podem mudar. "Custo estimado" inclui frete e impostos só onde indicado.

### 5.A Comprar agora (não depende de decisão aberta)

| COMPONENTE | MODELO | QUANTIDADE | FUNÇÃO | JUSTIFICATIVA | CUSTO ESTIMADO | ALTERNATIVA | RISCO | LINK/FONTE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pulseira / relógio de desenvolvimento | LilyGO T-Watch S3, variante 915 MHz | 3 | Pulseira do MVP: passos, movimento noturno, tela, bateria, sincronização | Traz o sensor obrigatório, bateria, carga, tela e caixa; economiza 8 a 12 pessoa-dia; MVP pede ao menos 3 unidades | US$ 42,98 (LilyGO) a US$ 45,89 (Tindie) cada, mais frete. Posto no Brasil: cerca de R$ 310 a R$ 470 por unidade (ver 5.E) | Anúncio de T-Watch S3 no Mercado Livre (conferir se é S3, a variante e se o envio é nacional); pulseira própria com XIAO ESP32S3 (futuro) | Prazo de importação; bateria 400 ou 470 mAh; formato de relógio contra a barreira de desconforto (12 de 31) [E] | [LilyGO](https://lilygo.cc/products/t-watch-s3) · [Tindie](https://www.tindie.com/products/lilygo/lilygo-t-watch-s3-programmable-touchable-watch/) · [Mercado Livre](https://www.mercadolivre.com.br/smartwatch-lilygo-twatchs3/up/MLBU3265774415) |
| Placa de desenvolvimento | ESP32-S3-DevKitC-1 N16R8 (USB-C) | 1 | Firmware antes do relógio chegar; depois, base da bancada de FC | Mesmo chip do relógio; estoque nacional; é usada nas duas fases | R$ 67,90 (MakerHero) a R$ 94,30 (Curto Circuito) | Mercado Livre, R$ 85,80 | Clones com pinagem diferente; baixo | [MakerHero](https://www.makerhero.com/produto/placa-esp32-s3-devkitc/) · [Curto Circuito](https://curtocircuito.com.br/placa-devkitc-1-esp32-s3-n16r8.html) · [Mercado Livre](https://www.mercadolivre.com.br/placa-devkitc-1-esp32-s3-n16r8-16mb-flash-8mb-psram-wifi-tipo-c-duplo/p/MLB49198475) |

**Subtotal A:** cerca de R$ 1.000 a R$ 1.510.

### 5.B Comprar só depois do portão de 20/10 (pulseira enviando passos ponta a ponta)

| COMPONENTE | MODELO | QUANTIDADE | FUNÇÃO | JUSTIFICATIVA | CUSTO ESTIMADO | ALTERNATIVA | RISCO | LINK/FONTE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sensor de pulso óptico | Módulo MAX30102 | 2 (1 reserva) | FC de bancada na demonstração | Único sensor do pacote de sensores que exige compra; reserva porque módulos genéricos falham | R$ 32,21 cada no Pix (Usinainfo) → cerca de R$ 65 | Curto Circuito R$ 36,90; Magalu; Baú da Eletrônica (sem estoque em 23/09) | Módulo com defeito; sinal ruim com movimento | [Usinainfo](https://www.usinainfo.com.br/sensores-de-pulso-cardiaco/modulo-sensor-de-frequencia-cardiaca-e-oximetro-de-pulso-max30102-8787.html) · [Curto Circuito](https://curtocircuito.com.br/sensor-de-batimentos-cardiacos-e-oximetro-max30102.html) |
| Oxímetro de referência | G-Tech OLED, com registro Anvisa | 1 | Valor de referência ao lado da FC de bancada | Mostra à banca a diferença entre o protótipo e um aparelho registrado | R$ 142,41 no Pix | Qualquer oxímetro com registro Anvisa que alguém da equipe já tenha (custo zero) | Baixo | [Magalu](https://www.magazineluiza.com.br/oximetro-digital-de-dedo-com-registro-anvisa-e-inmetro-oled-g-tech/p/cdd63d7b33/cp/oxim/) |
| Fixação do sensor | Faixa elástica com velcro + espuma adesiva | 1 | Pressionar o MAX30102 contra a pele | Reduz o artefato de movimento, a principal causa de erro | R$ 10 a 20 [H, não pesquisado] | Elástico e fita que a equipe já tenha | Baixo | [ElectricalFlux](https://electricalflux.com/mcu-peripherals/interfacing-ppg-sensors-esp32-max30102) (recomendação de fixação) |
| Fios | Kit de jumpers fêmea-fêmea, 10 a 20 cm | 1 kit | Ligar o MAX30102 à placa sem solda | Montagem em minutos | R$ 10 a 20 [H, não pesquisado] | Não comprar se a equipe já tiver | Baixo | Qualquer loja de eletrônica |

**Subtotal B:** cerca de R$ 225 a R$ 250 (ou cerca de R$ 75 a R$ 85 se a equipe já tiver oxímetro e jumpers).

### 5.C Compra condicional (plano B)

| COMPONENTE | MODELO | QUANTIDADE | FUNÇÃO | JUSTIFICATIVA | CUSTO ESTIMADO | ALTERNATIVA | RISCO | LINK/FONTE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMU de prototipagem | MPU-6050 (GY-521) | 1 | Contar passos por software na placa de desenvolvimento | Só se até 10/10 o relógio não tiver previsão de entrega | R$ 22,90 (MakerHero) a R$ 26,90 (Eletrogate) | Esperar o relógio | Código de passos descartado quando o relógio chegar | [Eletrogate](https://www.eletrogate.com/acelerometro-e-giroscopio-3-eixos-6-dof-mpu-6050-gy-521) · [MakerHero](https://www.makerhero.com/produto/acelerometro-e-giroscopio-3-eixos-6-dof-mpu-6050/) |

### 5.D Não comprar

| Item | Por quê |
| --- | --- |
| XIAO ESP32S3, BMI270, tela OLED, bateria LiPo, módulo de carga, caixa impressa | Pulseira própria é FUTURO; o T-Watch S3 cobre o MVP |
| Base de carga magnética ou carregador sem fio | Depende da pulseira própria |
| MAX30205, AD8232, GSR, GPS, sensor de pressão | Descartados (seção 2.6) |
| Medidor USB de corrente | A bateria é lida pelo AXP2101; a autonomia se mede pelo tempo até descarregar |
| Pulseiras extras além de 3 | Decisão aberta: só se a equipe decidir que os 5 participantes do teste usam pulseira; os outros 2 podem registrar passos pelo celular |

### 5.E Como estimei o custo do relógio importado

Regra vigente desde 13/05/2026, segundo o Santander: compras de até US$ 50 (produto + frete + seguro) têm imposto de importação federal zero e ICMS estadual de 17% a 20%; de US$ 50,01 a US$ 3.000, imposto de 60% com dedução de US$ 20, mais ICMS. Conferir no momento da compra; isto não é orientação tributária.

| Cenário | Conta (US$) | Total em R$ | Por unidade |
| --- | --- | --- | --- |
| 3 relógios num único pedido, frete estimado de US$ 15 [H] | 129 + 15 = 144; imposto 0,6 × 144 − 20 = 66,40; ICMS 20% calculado por dentro: 210,40 ÷ 0,8 = 263 | cerca de R$ 1.349 | cerca de R$ 450 |
| 1 relógio por pedido, frete estimado de US$ 5 [H], total até US$ 50 | 43 + 5 = 48; sem imposto federal; ICMS: 48 ÷ 0,8 = 60 | cerca de R$ 308 cada | cerca de R$ 308 |

O frete real define o cenário. Se produto + frete passar de US$ 50 por pedido, vale a primeira linha.

## 6. Decisões abertas e o que elas bloqueiam

| Decisão aberta | Bloqueia | Quando decide |
| --- | --- | --- |
| Portão de 20/10: pulseira enviando passos ponta a ponta | Toda a lista 5.B | 20/10 |
| Relógio com previsão de entrega | Compra 5.C (plano B) | 10/10 |
| Quantos participantes do teste usam pulseira (3 ou 5) | 2 relógios extras | Antes de 13/10 (congelamento do escopo) |
| Pulseira própria menor | Toda a linha de componentes 5.D | Depois do teste de aceitação |

## 7. Testes de bancada (semana 4)

| O que validar | Como | Passa se |
| --- | --- | --- |
| Passos | 5 caminhadas de 500 passos contados à mão; 7 dias de uso pela equipe comparados aos passos do celular | Diferença diária de até 20% em 5 de 7 dias |
| Bateria | Uso normal com sincronização a cada 3 h | 24 h ou mais |
| Fila offline | Wi-Fi desligado por 3 dias, depois religado | Os 3 dias chegam à API, sem duplicar |
| FC de bancada (se passar o portão) | 10 medições em repouso comparadas ao oxímetro | Diferença registrada e mostrada como está, sem ajuste |

## Fontes

- LilyGO T-Watch S3, produto: https://lilygo.cc/products/t-watch-s3
- LilyGO T-Watch S3, wiki: https://wiki.lilygo.cc/products/t-watch-series/t-watch-s3/
- Tindie, T-Watch S3: https://www.tindie.com/products/lilygo/lilygo-t-watch-s3-programmable-touchable-watch/
- Mercado Livre, T-Watch S3: https://www.mercadolivre.com.br/smartwatch-lilygo-twatchs3/up/MLBU3265774415
- Bosch BMI270: https://www.bosch-sensortec.com/en/products/motion-sensors/imus/bmi270
- Analog Devices MAX30102: https://www.analog.com/en/products/max30102.html
- Usinainfo MAX30102: https://www.usinainfo.com.br/sensores-de-pulso-cardiaco/modulo-sensor-de-frequencia-cardiaca-e-oximetro-de-pulso-max30102-8787.html
- Curto Circuito MAX30102: https://curtocircuito.com.br/sensor-de-batimentos-cardiacos-e-oximetro-max30102.html
- Curto Circuito ESP32-S3 DevKitC-1 N16R8: https://curtocircuito.com.br/placa-devkitc-1-esp32-s3-n16r8.html
- MakerHero ESP32-S3 DevKitC: https://www.makerhero.com/produto/placa-esp32-s3-devkitc/
- Eletrogate MPU-6050: https://www.eletrogate.com/acelerometro-e-giroscopio-3-eixos-6-dof-mpu-6050-gy-521
- MakerHero MPU-6050: https://www.makerhero.com/produto/acelerometro-e-giroscopio-3-eixos-6-dof-mpu-6050/
- Magalu, oxímetro G-Tech OLED: https://www.magazineluiza.com.br/oximetro-digital-de-dedo-com-registro-anvisa-e-inmetro-oled-g-tech/p/cdd63d7b33/cp/oxim/
- Farmácias Nissei, oxímetro G-Tech LED (precisão): https://www.farmaciasnissei.com.br/oximetro-de-dedo-digital-led-g-tech
- ElectricalFlux, PPG no ESP32: https://electricalflux.com/mcu-peripherals/interfacing-ppg-sensors-esp32-max30102
- Marino et al., SLEEP 2013: https://academic.oup.com/sleep/article-abstract/36/11/1747/2558963
- Hypertension Research 2025: https://www.nature.com/articles/s41440-025-02410-w
- Santander, regras de importação 2026: https://www.santander.com.br/blog/taxacao-produtos-importados
- Dólar em 23/09/2026: https://mercadohoje.uai.com.br/2026/09/23/dolar-hoje-23-09-2026-veja-as-informacoes-da-moeda-americana
