# CareTwin alcança a big tech sem gastar mais

A melhor notícia desta pesquisa: as ideias que mais impressionam um avaliador de big tech em 2026 cabem quase todas no hardware que o CareTwin já tem. Entre 2025 e 2026, Apple, Samsung, Google e Oura lançaram recursos com o mesmo desenho do CareTwin: observar semanas de dados, comparar com o normal da própria pessoa e avisar com linguagem cuidadosa, sem diagnóstico. A Samsung chegou a lançar em julho de 2026 um recurso chamado "Vitals", que monta uma linha de base noturna e sinaliza mudanças significativas ([TechRepublic](https://www.techrepublic.com/article/news-samsung-galaxy-watch9-ultra2/)). Com o MPU-6050 dá para fazer detecção de queda em três etapas com tela "Estou bem?", contador de repetições de academia, teste da cadeira de 30 segundos e intensidade de caminhada por cadência. Com os dados noturnos que já existem dá para calcular o Índice de Regularidade do Sono, um biomarcador validado em 88.975 pessoas ([eLife](https://elifesciences.org/articles/88359)). Do lado da IA, o achado mais útil vem do Google: um LLM acerta 22% das perguntas numéricas sozinho e 84% quando o número vem de código ([arXiv PHIA](https://arxiv.org/html/2406.06464v4)), o que valida a regra do CareTwin de "estatística decide, IA só escreve". Sensores novos valem menos do que parece: temperatura da pele (MAX30205) é a melhor aposta para simular e depois comprar, e o GSR para estresse impressiona no slide, mas funciona mal no punho. A queda precisa de honestidade: no punho ela funciona bem em laboratório e bem pior na vida real, então o número que convence o avaliador é "alarmes falsos por dia de uso", muito mais do que um "99% de acurácia".

## Como ler este relatório e as quatro categorias

As ideias estão organizadas nas quatro categorias pedidas. Para separar a categoria 1 da 2, usei um critério prático: a **categoria 1** reúne ideias que usam os componentes atuais de um jeito novo e exigem trabalho principalmente no firmware e nos sensores (queda, academia, sinais do coração). A **categoria 2** reúne ideias de software, dados e IA que reforçam a tese central do produto (o normal da própria pessoa, a família, o gêmeo digital) e quase não tocam no hardware. As duas cabem no stack atual. A **categoria 3** pede um sensor novo, que deve ser simulado primeiro no simulador Python. A **categoria 4** fica para o slide de "para onde a indústria está indo".

Cada ideia traz um nome curto de cartão para o Trello, o que é, por que impressiona, como fazer no stack atual (ESP32-S3, MPU-6050, MAX30102, ST7789, LiPo de 400 mAh, Next.js, Supabase, simulador Python, Ollama), o esforço estimado e os limites. As estimativas de esforço consideram uma pessoa trabalhando: **pequeno** é de 1 a 3 dias, **médio** é cerca de 1 semana e **grande** é mais de 1 semana. Os preços marcados como estimativa não foram conferidos em lojas brasileiras.

Um aviso vale para todas as ideias de hardware: a bateria de 400 mAh é a restrição real. Um sistema ESP32-S3 parecido, com display ligado, consumiu de 152 a 159 mA, e desligar a tela economizou cerca de 50 mA ([Schlonsak et al., Univ. Lübeck](https://www.imis.uni-luebeck.de/sites/default/files/2026-06/Schlonsak2025_No_Cloud_No_Problem.pdf)). Por estimativa, isso daria de 2 a 3 horas com tela sempre ligada nos 400 mAh do CareTwin. Tela apagada por padrão, Wi-Fi em lotes e PPG só em janelas curtas ajudam todas as ideias abaixo.

## Categoria 1: o MPU-6050 e o MAX30102 rendem queda, academia e coração

### 1.1 Cartão: "Queda em 3 etapas + tela Estou bem"

**O que é.** Um detector de queda no firmware que passa por três etapas: pico de impacto na aceleração, mudança de orientação do antebraço e imobilidade logo depois. Quando as três acontecem, o ST7789 mostra "Você caiu? Toque se está bem" com contagem regressiva. Sem resposta, o evento vai para o Supabase e a família recebe o aviso no app com horário, frequência cardíaca medida durante a contagem e "última atividade". Um complemento é a "queda longa": se a pessoa continua parada e deitada por vários minutos depois de qualquer impacto, o aviso sobe mesmo que a primeira contagem tenha sido dispensada.

**Por que impressiona.** É exatamente o fluxo da big tech. O Apple Watch espera cerca de 1 minuto de imobilidade e depois faz uma contagem de 30 segundos antes de ligar para emergência ([Apple Support](https://support.apple.com/en-au/guide/watch/apd34c409704)). O Google treinou o detector do Pixel Watch com dublês profissionais em Los Angeles e simulações físicas, e espera cerca de 30 segundos sem movimento antes de perguntar "está tudo bem?" ([Google blog](https://blog.google/products/pixel/google-pixel-watch-fall-detection-ai/)). A Samsung manda SOS para contatos escolhidos depois de 60 segundos sem resposta ([Samsung Support](https://www.samsung.com/ca/support/mobile-devices/galaxy-watch-detect-falls)). O valor humano é forte: entre 125 idosos que caíram, metade dos que ficaram mais de uma hora no chão morreu em até 6 meses ([Sun et al., SENSORCOMM 2019, citando Wild et al.](https://personales.upv.es/thinkmind/dl/conferences/sensorcomm/sensorcomm_2019/sensorcomm_2019_4_20_10062.pdf)).

**Como fazer no stack atual.** Configure o MPU-6050 em ±16 g (em ±2 g um tapa na mesa já satura), amostragem de 50 a 100 Hz e filtro interno em cerca de 20 Hz. Calcule a magnitude do vetor de aceleração (raiz de ax² + ay² + az²). Etapa 1: pico acima de cerca de 2,5 a 3 g no punho, com uma queda livre opcional antes (abaixo de 0,5 g); ajuste os valores com dados próprios. Etapa 2: ângulo do vetor da gravidade antes e depois. Etapa 3: de 10 a 30 segundos de pouco movimento. Um detector publicado em 2025 usa exatamente essa máquina de estados (gatilho em 800 mg, impacto em 1.400 mg, checagem de imobilidade e de inclinação) e reportou 97,9% de sensibilidade em laboratório ([Tseng et al., Sensors 2025](https://www.mdpi.com/1424-8220/25/12/3632)). No backend, uma tabela `fall_events` com status (não confirmado, pessoa ok, falso alarme, atendido) e a janela bruta só do evento, para revisar e reajustar os limiares. A família pode marcar "falso alarme", o que vira dado de avaliação. O alerta vai para a família, nunca para serviço de emergência.

**Esforço:** médio.

**Limites honestos.** O punho é o lugar mais confortável e o mais difícil, porque o braço mexe muito no dia a dia. Em laboratório, um modelo só de punho chegou a 90,57% de recall e 96,91% de especificidade, mas com F1 de só cerca de 70% por causa dos falsos positivos, e generalizou mal entre bases diferentes ([Fula e Moreno, Sensors 2024](https://www.mdpi.com/1424-8220/24/5/1679)). Um app comercial de relógio detectou 77% de 226 quedas de adultos saudáveis, com 92,5% de acerto quando a queda era para o lado do relógio contra 76,3% para o lado oposto ([Brew et al., JMIR Formative Research 2022](https://formative.jmir.org/2022/3/e30121/XML)). Na vida real o quadro piora: 13 algoritmos testados em 29 quedas reais (sensor na cintura) tiveram sensibilidade média de 57% e de 3 a 85 alarmes falsos por dia ([Bagalà et al., PLoS ONE 2012](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0037062)). Quedas lentas, sobre cama ou sofá, costumam passar. A pulseira não tem motor de vibração, então uma pessoa distraída pode não ver a contagem (ver 3.2). Apresente como "protótipo validado em laboratório com etapa de confirmação" e mostre duas métricas: sensibilidade em quedas num colchão e alarmes falsos por dia com a equipe usando a pulseira de 1 a 3 dias, testando os dois punhos.

### 1.2 Cartão: "Classificador de queda TinyML com dataset público"

**O que é.** Um modelo pequeno (árvore de decisão, random forest ou rede densa pequena) que roda só na janela de poucos segundos em volta de um impacto candidato do cartão 1.1, para separar queda de "sentou com força" ou "bateu a mão na mesa".

**Por que impressiona.** Mostra edge AI de verdade num ESP32-S3, com números de memória e latência. Modelos publicados vão de cerca de 5 KB de RAM, 40 KB de flash e 7 ms por inferência ([Malche et al., Future Internet 2026](https://www.mdpi.com/1999-5903/18/4/211)) até uma CNN 1D quantizada com 86 KB de RAM e 54 ms por inferência num ESP32-S3 ([Schlonsak et al.](https://www.imis.uni-luebeck.de/sites/default/files/2026-06/Schlonsak2025_No_Cloud_No_Problem.pdf)). A Espressif tem um exemplo oficial de reconhecimento de atividade com MPU6050 e ESP-DL ([Espressif](https://developer.espressif.com/blog/esp32-s3-edge-ai-human-activity-recognition-using-accelerometer-data-and-esp-dl/)). Trabalhos com regras simples chegaram a resultados parecidos com redes neurais no punho, com custo menor ([Khojasteh et al., Sensors 2018](https://www.mdpi.com/resolver?pii=s18051350)).

**Como fazer no stack atual.** Treine em Python com bases públicas de punho: FallAllD (punho, cintura e pescoço, 238 Hz, inclui barômetro, exige login no IEEE DataPort) e WEDA-Fall (Fitbit no punho, 50 Hz, com participantes acima de 80 anos nas atividades diárias); use UP-Fall e UMAFall para teste cruzado ([IEEE DataPort FallAllD](https://ieee-dataport.org/open-access/fallalld-comprehensive-dataset-human-falls-and-activities-daily-living); [Fula e Moreno 2024](https://www.mdpi.com/1424-8220/24/5/1679)). Reamostre tudo para 50 Hz, extraia features simples (pico máximo, vale mínimo, duração do impacto, mudança de orientação, variância depois do evento) e exporte para C com emlearn ou micromlgen, ou use o Edge Impulse, que faz coleta, features e exportação para Arduino/ESP-IDF sem muito código. Faça ajuste fino com 10 a 20 minutos de gravações próprias.

**Esforço:** médio a grande.

**Limites honestos.** Computação não é o gargalo; dados rotulados de punho são. A taxa de amostragem e a faixa variam entre bases, e um estudo cruzado citado na revisão de 2024 chegou a só 78,51% de acurácia ao trocar de base ([Fula e Moreno 2024](https://www.mdpi.com/1424-8220/24/5/1679)). Reporte resultados com divisão por pessoa (ninguém aparece no treino e no teste ao mesmo tempo), porque a divisão misturada infla os números, como no estudo de 7 ms citado acima. Se o tempo apertar, a máquina de estados do 1.1 sozinha já é uma boa demo.

### 1.3 Cartão: "Modo academia: contador de repetições ao vivo"

**O que é.** A pessoa escolhe o exercício na pulseira (rosca com garrafinha, flexão na parede, elevação de braço, levantar da cadeira, polichinelo) e o ST7789 mostra o número da repetição em tempo real, o número da série e um aviso visual na meta. Para a família aparece "3 séries de 10 hoje".

**Por que impressiona.** A Microsoft Research resolveu esse problema no RecoFit com processamento de sinal clássico: 93% das séries contadas com erro de no máximo 1 repetição de forma totalmente automática, e reconhecimento de 100% com 4 exercícios, caindo para 96% com 13 ([RecoFit, CHI 2014](https://microsoft.com/en-us/research/wp-content/uploads/2016/12/p3225-morris.pdf)). Um projeto do Edge Impulse num relógio Bangle.js 2, com processador mais fraco que o ESP32-S3, classificou flexões, barras e remadas com cerca de 90% em dados de teste ([Edge Impulse](https://edgeimpulse.com/blog/this-smartwatch-doesnt-let-you-skip-leg-day/)). É a ideia de "atividade tipo academia" com o maior efeito visual na demo.

**Como fazer no stack atual.** Use a receita de contagem do RecoFit, que nem usa o giroscópio: filtro passa-banda de cerca de 0,3 a 3 Hz, projeção no eixo de maior variância (PCA) numa janela de 5 segundos, detecção de picos e autocorrelação para estimar o período e descartar picos falsos. Isso roda folgado no ESP32-S3. Comece com o exercício escolhido pela pessoa (mais robusto) e deixe a classificação automática de 3 a 5 exercícios como meta extra. Para treino e teste existem bases abertas: MM-Fit (6.160 repetições com relógio, acelerômetro, giroscópio e vídeo) ([MM-Fit, Univ. Edinburgh](https://www.research.ed.ac.uk/en/datasets/mm-fit-dataset-physical-exercise-workout-sessions-video/)) e StrengthSense (2025), que inclui atividades do dia a dia como levantar da cadeira, subir escada e carregar sacolas ([arXiv 2511.02027](https://arxiv.org/pdf/2511.02027)). No backend, um "dia de força" é qualquer dia com uma série detectada, o que conversa com a recomendação da OMS de fortalecimento muscular em pelo menos 2 dias por semana ([resumo das diretrizes OMS 2020](https://www.sport-sante.lu/en/who-recommandations/)).

**Esforço:** médio.

**Limites honestos.** O RecoFit usava uma braçadeira no antebraço; o punho ficou como trabalho futuro no próprio artigo, e não achei artigo revisado com contagem de repetições num MPU-6050 de punho. Exercícios só de perna (agachamento, afundo) mexem pouco o punho e serão fracos. A acurácia cai quando o número de exercícios cresce, e sem uma classe "outro movimento" a pulseira conta repetições enquanto a pessoa lava louça. Avaliação de qualidade da execução (profundidade do agachamento) fica para a categoria 4: o StrengthSense usou 10 sensores no corpo.

### 1.4 Cartão: "Teste da cadeira de 30 s guiado"

**O que é.** Uma vez por semana, a pulseira guia o teste clássico de geriatria: braços cruzados no peito, levantar e sentar o máximo possível em 30 segundos. A tela mostra contagem regressiva e contagem ao vivo, e o resultado vira uma linha de tendência para a família. Como extensão, um "Timed Up and Go" instrumentado: a pessoa toca para começar, levanta, anda 3 metros, vira, volta e senta; a pulseira mede tempo total e o giro pelo giroscópio.

**Por que impressiona.** Aproxima o CareTwin de uma ferramenta usada por profissionais, sem diagnosticar. Com um único sensor inercial, pessoas saudáveis fizeram 22 ± 7 ciclos, pré-frágeis 15 ± 5 e frágeis 6 ± 1, e o sensor separou pré-frágeis de saudáveis mesmo com contagens iguais, pela velocidade do movimento ([PMC3735415](https://pmc.ncbi.nlm.nih.gov/articles/PMC3735415/)). Um TUG com relógio de consumo foi descrito como comparável ao teste cronometrado à mão ([UJI repositório](https://repositori.uji.es:443/xmlui/handle/10234/201062)). A OMS pede atividade de equilíbrio e força em pelo menos 3 dias por semana para quem tem 65 anos ou mais, justamente para prevenir quedas ([resumo OMS 2020](https://www.sport-sante.lu/en/who-recommandations/)).

**Como fazer no stack atual.** Reaproveite o detector de picos do 1.3, ajustado para 0,3 a 1 Hz. Com os braços cruzados no peito, o punho se move junto com o tronco. O app mostra só a contagem e a comparação com as semanas anteriores da própria pessoa ("12 levantadas, 2 a mais que no mês passado").

**Esforço:** pequeno a médio (pequeno se o 1.3 já existir).

**Limites honestos.** O estudo usou sensor na lombar, e não achei validação com sensor de punho; a equipe precisa comparar com contagem manual e mostrar o erro. O app nunca deve rotular a pessoa como "frágil": a faixa de valores do estudo serve de contexto para a equipe, e não para a tela.

### 1.5 Cartão: "Minutos que contam (intensidade por cadência)"

**O que é.** Transforma "minutos ativos" em minutos de intensidade moderada e vigorosa usando os passos por minuto que a pulseira já conta, e mostra a semana contra a meta da OMS.

**Por que impressiona.** Usa um limiar validado para a faixa etária certa: em 97 adultos de 61 a 85 anos, 105 passos por minuto ou mais marcaram intensidade moderada, e 115 a 120 ou mais marcaram intensidade vigorosa ([CADENCE-Adults, IJBNPA 2023](https://doaj.org/article/61311cd41c1b41f188518583573f42c9)). A OMS recomenda de 150 a 300 minutos por semana de atividade moderada, ou metade disso em vigorosa ([resumo OMS 2020](https://www.sport-sante.lu/en/who-recommandations/)). O Fitbit faz a mesma conta nos "Active Zone Minutes", com minuto vigoroso valendo 2 ([Google Fitbit Help](https://support.google.com/fitbit/answer/14236509)).

**Como fazer no stack atual.** No firmware ou no backend, classifique cada minuto com passos como leve, moderado (105 ou mais) ou vigoroso (115 a 120 ou mais). Some por semana, com minuto vigoroso valendo 2, e aplique a mesma regra de "normal da pessoa" que já existe para passos. Na tela, uma cor de ritmo enquanto a pessoa caminha.

**Esforço:** pequeno.

**Limites honestos.** Exige dados por minuto durante o dia, e hoje o dia vai só como total diário; é uma mudança pequena de payload. Contagem de passos no punho erra mais em caminhada lenta, problema conhecido que não consegui confirmar com fonte nesta pesquisa. Cadência mede ritmo de caminhada; bicicleta e musculação ficam de fora.

### 1.6 Cartão: "Tendência de mobilidade para risco de queda"

**O que é.** Em vez de só detectar quedas, acompanhar ao longo das semanas os sinais que antecedem quedas: passos por dia, número e duração das caminhadas, cadência dentro das caminhadas e regularidade do passo, sempre contra o normal da pessoa.

**Por que impressiona.** É prevenção, a parte mais valiosa do tema. No UK Biobank, 32.619 adultos com 65 anos ou mais usaram acelerômetro de punho por até 7 dias; em cerca de 7 anos, 1.627 tiveram queda que precisou de atendimento. Velocidade de caminhada, total de passos e tempo correndo seguiram como preditores independentes mesmo depois de ajustar por doenças, força de preensão e tempo de reação; em quem já tinha caído antes, a regularidade do passo foi o único fator significativo ([Chan et al., Age and Ageing 2023](https://www.ukbiobank.ac.uk/publications/prediction-of-injurious-falls-in-older-adults-using-digital-gait-biomarkers-extracted-from-large-scale-wrist-sensor-data/)). Com uma pulseira barata (Mi Band) e só dados do aparelho, um modelo separou quem cai com AUC de 0,76 a 0,80, e chegou a 0,894 somando dados clínicos ([Yang et al., JMIR Aging 2019](https://aging.jmir.org/2019/1/e12153/)).

**Como fazer no stack atual.** No firmware, detecte caminhadas (sequências de passos), guarde duração e cadência, e calcule a regularidade do passo pela autocorrelação da aceleração durante a caminhada. No backend, um cartão "Mobilidade" com tendência semanal e um aviso suave de "atividade abaixo do seu normal". Um questionário curto (já caiu antes? tem medo de cair?) pode entrar como contexto, porque dados clínicos somados aos do aparelho melhoram o resultado no estudo acima.

**Esforço:** médio.

**Limites honestos.** O UK Biobank mostra associação em população grande, e não existe AUC publicada para um modelo de punho em idosos da comunidade. O CareTwin deve mostrar "tendência", nunca "risco de queda de X%". Velocidade de marcha de verdade precisa do comprimento do passo, que o punho não mede bem.

### 1.7 Cartão: "Teste de recuperação cardíaca (FC após esforço)"

**O que é.** Um mini teste guiado pela tela: 1 a 2 minutos marchando no lugar ou levantando da cadeira, depois "segure o braço parado na mesa". A pulseira mede a frequência no fim do esforço e 60 segundos depois. A diferença vira uma tendência de condicionamento ao longo das semanas.

**Por que impressiona.** Resolve com inteligência o maior problema do MAX30102: o PPG de punho sofre artefatos "severos" de movimento por causa do contato solto com a pele, e corrigir isso durante o exercício exige algoritmos de pesquisa como o TROIKA, com erro médio de 2,34 batimentos por minuto em corrida ([arXiv 1504.04785](https://arxiv.org/pdf/1504.04785)). Medir só com o braço parado contorna o problema. A ideia também conversa com produtos como o WHOOP, que separa carga cardiovascular e carga muscular ([WHOOP](https://ww2.whoop.com/thelocker/how-does-whoop-strain-work-101/)).

**Como fazer no stack atual.** Reaproveite a leitura de 12 segundos com a pessoa parada que já existe. Use o acelerômetro como porteiro: se a variância passa de um limite, a tela pede "fique parado" e descarta a janela. Guarde no Supabase a FC final, a FC aos 60 segundos e a diferença.

**Esforço:** pequeno a médio.

**Limites honestos.** O estudo clássico que liga recuperação cardíaca a mortalidade (Cole, NEJM 1999) aparece no [PubMed](https://pubmed.ncbi.nlm.nih.gov/10536127/), mas os números não foram conferidos nesta pesquisa; não cite valores. Evite o VO2max pela fórmula de Uth (15,3 × FCmáx/FCrepouso): ela foi validada só em 46 homens bem treinados de 21 a 51 anos ([Uth et al., resumo](https://www.springermedizin.de/estimation-of-vo2max-from-the-ratio-between-hrmax-and-hrrest-the/8478242)). FC contínua confiável durante corrida ou musculação fica na categoria 4.

### 1.8 Cartão: "Noite diferente do normal (FC, HRV e respiração)"

**O que é.** Medidas noturnas em janelas paradas: frequência cardíaca de repouso, variabilidade (ln do RMSSD) e frequência respiratória tirada do próprio PPG. Juntas com passos e sono, elas viram um alerta em dois níveis ("atenção" e "vale ligar para ela") quando várias saem do normal ao mesmo tempo.

**Por que impressiona.** Reproduz um estudo famoso de Stanford com hardware próprio. Em mais de 5.000 participantes com relógio, 26 de 32 pessoas com COVID tiveram alta sustentada da FC de repouso, e a detecção aconteceu antes ou no início dos sintomas em 63% dos casos, até 10 dias antes; as pessoas infectadas andaram em média 1.440 passos a menos por dia ([Stanford Medicine](https://med.stanford.edu/news/all-news/2020/12/smartwatch-can-detect-early-signs-of-illness.html)). A respiração pelo PPG de punho em repouso teve erro de só 0,60 respirações por minuto contra cintas respiratórias durante o sono ([medRxiv, Corsano](https://www.medrxiv.org/content/10.1101/2023.07.25.23293134.full.pdf)). A variabilidade do PPG em repouso concordou bem com o ECG no tempo (r acima de 0,72) ([Sensors 2023](https://www.mdpi.com/1424-8220/23/20/8423)).

**Como fazer no stack atual.** Use o contador de movimento noturno para escolher minutos parados e ligue o MAX30102 só nesses minutos, no canal IR, a 100 Hz ou mais. Detecte os batimentos, descarte intervalos que mudam mais de 20% em relação aos vizinhos e calcule o ln(RMSSD) médio da noite. A respiração sai de três modulações do PPG (linha de base, amplitude e intervalo entre batimentos) em janelas de 32 a 60 segundos, usando a mediana. No simulador Python, gere batimentos com respiração e um episódio de "ficando doente" (FC mais alta, RMSSD mais baixo, +2 a 3 respirações por minuto por algumas noites) para testar o alerta.

**Esforço:** médio.

**Limites honestos.** Não existe validação publicada do MAX30102 no punho para variabilidade; compare com o oxímetro emprestado e mostre o erro. Mesmo o Fitbit perdeu a variabilidade em 38,9% dos minutos acordados por PPG ruidoso ([arXiv 2504.21242](https://arxiv.org/pdf/2504.21242)), e a respiração fora do repouso piorou para erro de 2,43 ([medRxiv](https://www.medrxiv.org/content/10.1101/2023.07.25.23293134.full.pdf)). O alerta de Stanford não distingue COVID de outras infecções; o CareTwin diz "noite diferente do seu normal" e nada além disso. PPG ligado a noite toda gasta bateria; meça em janelas.

### 1.9 Cartão: "Quedas de oxigenação noturna só como tendência"

**O que é.** Contar quantas vezes por noite a SpO2 cai de 3 a 4 pontos em relação à linha de base da própria pessoa, mostrando só quando a qualidade do sinal é boa. Nada de número absoluto com cara de exame.

**Por que impressiona.** Mais pela maturidade do que pelo recurso. Em 134 pacientes com polissonografia, a SpO2 de punho teve erro de 3,2 pontos contra 1,9 no braço, e 30,4% dos dados do punho foram descartados contra 3,1% no braço ([resumo do arXiv 2505.20846](https://pith.science/paper/2505.20846)). Em janeiro de 2025 a FDA propôs exigir 150 participantes com diversidade de tom de pele nos testes de oxímetros médicos, contra 10 antes ([TCTMD](https://www.tctmd.com/news/fda-issues-draft-guidance-improving-skin-tone-disparities-pulse-oximeters); [FDA](https://www.fda.gov/media/184896/download)). Num país miscigenado como o Brasil, isso rende um slide forte de ética.

**Como fazer no stack atual.** Código de SpO2 com ESP32 e MAX30102 existe pronto ([Random Nerd Tutorials](https://randomnerdtutorials.com/esp32-max30102-oximeter-heart-rate-sensor/)). No simulador, gere perdas de dados de cerca de 30% e um parâmetro de viés por tom de pele, para mostrar por que o app só usa tendência.

**Esforço:** médio.

**Limites honestos.** É o sinal mais fraco desta lista. A referência do estudo de punho era outro oxímetro de dedo em faixa quase normal, então o erro real pode ser maior. Se o tempo for curto, use só como slide de limitações.

### 1.10 Cartão: "Pulseira no pulso? Detector de uso"

**O que é.** Um sinal de "pulseira no pulso" enviado a cada minuto ou dia, usando o canal IR do MAX30102 (sem pele, quase nenhum reflexo) e longos períodos de movimento zero.

**Por que impressiona.** É a pergunta que todo avaliador técnico faz: "e se ela esquecer a pulseira na mesa?". Sem esse sinal, um dia sem uso parece um dia de pessoa frágil e dispara alerta falso. O padrão de pesquisa em actigrafia leva isso a sério: um classificador de não uso chegou a F1 de 93% num benchmark de 2021 ([Sundararajan et al., Scientific Reports 2021](https://discovery-pp.ucl.ac.uk/10119274/1/s41598-020-79217-x.pdf)).

**Como fazer no stack atual.** No firmware, uma leitura curta do IR de tempos em tempos e um contador de minutos parados. No backend, dias com pouco uso viram "sem dados suficientes" e saem da linha de base. O app diz "Sem dados desde ontem 18h" em vez de "andou menos".

**Esforço:** pequeno.

**Limites honestos.** O limiar do IR depende do encaixe na caixa impressa e do tom de pele; calibre com a pulseira montada.

## Categoria 2: software e IA transformam dados velhos em biomarcadores novos

### 2.1 Cartão: "Regularidade do sono (SRI) + actograma"

**O que é.** O Índice de Regularidade do Sono mede a chance de a pessoa estar no mesmo estado (dormindo ou acordada) em dois momentos separados por 24 horas, numa escala de 0 a 100. Junto vem o actograma, o gráfico clássico da cronobiologia, com as noites empilhadas.

**Por que impressiona.** No UK Biobank, com 88.975 pessoas e 3.010 mortes em cerca de 7 anos, quem tinha o sono menos regular (SRI 41) teve risco de morte 53% maior que a mediana (SRI cerca de 60) ([Windred et al., eLife](https://elifesciences.org/articles/88359)). Um artigo do mesmo grupo diz no título que regularidade previu mortalidade melhor que duração do sono ([PMC10782501](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10782501/)). A Apple incluiu consistência do horário de dormir no Sleep Score de 2025, desenvolvido com mais de 5 milhões de noites ([TechTarget](https://www.techtarget.com/virtualhealthcare/news/366630518/Apple-Watch-launches-new-hypertension-notification-feature)). Raríssimo em projeto de estudante.

**Como fazer no stack atual.** As 840 contagens por minuto de cada noite (20h às 10h) já existem. Converta cada minuto em dormindo ou acordado (limiar simples ou fórmulas clássicas como Cole-Kripke e Sadeh) e compare o minuto t de uma noite com o mesmo minuto da noite seguinte, ao longo de 7 noites. Faça em TypeScript numa rota do Next.js ou numa função do Postgres e confira com o pacote GGIR ou pyActigraphy rodando sobre o CSV do simulador. Na mesma conta saem horário de dormir e acordar, tempo total de sono, eficiência, tempo acordado depois de dormir e despertares. O actograma é um SVG em React.

**Esforço:** pequeno a médio.

**Limites honestos.** A janela noturna de 14 horas dá um SRI "da janela noturna", que não pode ser comparado com os percentis do UK Biobank; use esse nome na tela. Mesmo os melhores algoritmos de sono por punho acertam pouco: F1 de 73,9% para random forest e de 67,5% a 70,9% para os clássicos ([Sundararajan et al. 2021](https://discovery-pp.ucl.ac.uk/10119274/1/s41598-020-79217-x.pdf)). Cole-Kripke e Sadeh foram calibrados para outros aparelhos, então as contagens do MPU precisam de reescala. É sempre "sono estimado".

### 2.2 Cartão: "Levantadas à noite"

**O que é.** Contar episódios de movimento forte depois de a pessoa adormecer e antes de acordar de vez (por exemplo, 2 minutos seguidos acima de um limite) e avisar só quando o número muda em relação ao normal: "mais idas noturnas que o habitual".

**Por que impressiona.** É informação que a família não tem como saber de outro jeito, e o Android Health Connect já tem um estado de sono chamado `OUT_OF_BED`, sinal de que a indústria modela isso ([Android Developers](https://developer.android.com/health-and-fitness/health-connect/features/sleep-sessions)). A actigrafia já é usada para avaliar noctúria em idosos ([ICS 2025](https://www.ics.org/2025/abstract/419)).

**Como fazer no stack atual.** Uma consulta sobre o mesmo array noturno do 2.1. Com o detector de passos, dá para distinguir "virou na cama" de "levantou e andou".

**Esforço:** pequeno.

**Limites honestos.** A ligação entre levantadas noturnas medidas por pulseira e risco de queda não foi confirmada com fonte nesta pesquisa. Use como contexto de rotina.

### 2.3 Cartão: "Fragmentação da atividade"

**O que é.** A probabilidade de, a cada minuto ativo, a pessoa voltar a ficar parada. Atividade picada em pedacinhos, mesmo com o total de passos igual, é a mudança sutil que a família não percebe.

**Por que impressiona.** Em 548 adultos com 65 anos ou mais, cada 10% a mais de fragmentação se associou a 49% a mais de risco de morte, e o total de atividade perdeu significância depois do ajuste ([Johns Hopkins](https://publichealth.jhu.edu/2019/fragmented-physical-activity-linked-to-greater-mortality-risk); [PubMed 31577355](https://pubmed.ncbi.nlm.nih.gov/31577355/)). É o tipo de métrica que transforma "contador de passos" em "plataforma de biomarcadores digitais".

**Como fazer no stack atual.** Mudança pequena no payload do firmware: mandar flags por minuto (ativo ou parado) durante o dia, ou pelo menos o número de períodos ativos e a duração média. O backend calcula a probabilidade de transição e compara com o normal da pessoa. O mesmo dado alimenta o 1.5 e permite calcular ritmo de 24 horas (estabilidade e variabilidade entre dias), que num estudo com 2.496 homens idosos se associou a declínio cognitivo ([eScholarship, MrOS](https://escholarship.org/uc/item/1gb7w1mp)). Existe também uma coorte brasileira de idosos de Pelotas sobre ritmo de atividade e mortalidade, boa para citar como evidência local ([PMC10871497](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10871497/), só o título foi conferido).

**Esforço:** médio (por causa da mudança de payload e da API).

**Limites honestos.** O estudo usou acelerômetro de pesquisa; os limiares de "ativo" do MPU precisam ser definidos pela equipe. Associação de população grande serve de justificativa; o app mostra só a tendência da pessoa.

### 2.4 Cartão: "Detector de deriva lenta (EWMA + CUSUM)"

**O que é.** Uma evolução da regra atual "2 de 3 dias fora de ±20%". A média móvel exponencial (EWMA) suaviza dias ruidosos, e o CUSUM acumula pequenos desvios para pegar uma queda lenta ao longo de semanas, que a regra atual deixa passar. Um z-score robusto (mediana e desvio absoluto) mostra a posição do dia dentro de "sua faixa normal".

**Por que impressiona.** É a base de pesquisa e mercado em envelhecimento em casa: o projeto TigerPlace, da Universidade do Missouri, observou mais de 2 anos de sensores e viu que mudanças de movimento e sono podem anteceder quedas e internações ([ScienceDaily](https://www.sciencedaily.com/releases/2009/01/090106181735.htm)). A CarePredict monta o painel da manhã justamente em torno de "quem mudou mais" ([CarePredict](https://www.carepredict.com/blog/from-data-to-action-how-carepredicts-daily-standup-dashboard-powers-smarter-senior-living)). São métodos clássicos de controle estatístico, fáceis de explicar.

**Como fazer no stack atual.** Uma função em TypeScript ou SQL que roda a cada envio de /daily ou /nights e guarda o estado numa tabela `baseline_estado` (média, variância, CUSUM por métrica). Inclua regras de ausência de rotina: "nenhum movimento até 10h num dia em que ela costuma levantar às 7h30" e "a pulseira não sincroniza há 12 horas", inspiradas no vaso sanitário inteligente Vovo, que avisa quando não há visita ao banheiro em 12 horas ([LeadingAge, CES 2026](https://leadingage.org/roundup-key-innovations-from-ces-2026/)). Com 3 ou mais semanas de dados, compare segunda com segundas anteriores.

**Esforço:** médio. Combina com o cartão 6.1 de linha de base e alertas.

**Limites honestos.** Não existe estudo comparando a regra de ±20% com EWMA/CUSUM em passos de pulseira, então a equipe precisa medir isso no simulador (ver 2.10).

### 2.5 Cartão: "Por que este alerta?"

**O que é.** Um painel para cada alerta com a regra que disparou, a janela de linha de base, o valor da pessoa, a faixa normal e os dias que contaram ("2 de 3 dias"), com um mini gráfico e uma frase da IA presa a esses números.

**Por que impressiona.** Explicabilidade é o que faz o cuidador confiar, e é o que um avaliador de big tech procura em qualquer sistema com IA. Avisos em níveis (boa notícia, atenção, ação), agrupamento ("dormiu menos e andou menos" vira um aviso só) e resumo matinal no lugar de notificações à noite atacam a fadiga de alarmes, um problema documentado: num hospital infantil, a exposição a alarmes sem ação se associou a respostas mais lentas ([resumo aengram](https://aengram.ai/articles/the-arithmetic-of-a-false-alarm)).

**Como fazer no stack atual.** Guardar no registro do alerta todos os números que o geraram (já ficam disponíveis no 2.4) e renderizar no app. A frase vem do pipeline do 2.6.

**Esforço:** pequeno.

**Limites honestos.** O resumo sobre fadiga de alarmes vem de um site de empresa de detecção de queda, e um estudo de seguimento de 2017 não confirmou o efeito depois de ajustes; trate como alerta de design.

### 2.6 Cartão: "Números do código, palavras da IA + verificador"

**O que é.** O pipeline da IA local em quatro passos: o backend monta um JSON fixo de fatos (média da semana, desvio do normal, dias seguidos, dados faltando); o Ollama escreve o texto preso a um schema JSON; um verificador confere cada número, data e palavra de direção ("mais", "menos") contra o JSON e procura palavras proibidas (diagnóstico, doença, apneia, anormal); se falhar, gera de novo uma vez e depois cai num template fixo. Cada resumo leva o selo "Escrito por IA local, números conferidos por regras".

**Por que impressiona.** Copia a arquitetura do Google com uma justificativa numérica forte. O agente PHIA acertou 84% de mais de 4.000 perguntas objetivas sobre dados de wearable usando código, contra 74% só com geração de código e 22% raciocinando em texto ([arXiv 2406.06464](https://arxiv.org/html/2406.06464v4)). O coach do Fitbit lançado em outubro de 2025 usa um agente de ciência de dados que calcula as estatísticas antes de um agente conversacional explicar ([Google Research](https://research.google/blog/how-we-are-building-the-personal-health-coach/)). O Ollama suporta saída presa a schema JSON desde dezembro de 2024 e recomenda temperatura 0 ([Ollama](https://registry.ollama.ai/blog/structured-outputs)). O selo conversa com o Artigo 50 do AI Act europeu, que exige informar a pessoa de que ela interage com IA desde 2 de agosto de 2026, com marcação de texto gerado a partir de 2 de dezembro de 2026 ([Sahha](https://sahha.ai/blog/eu-ai-act-health-apps/)).

**Como fazer no stack atual.** O Zod já está no projeto para validar a API, e o mesmo schema serve para a saída do Ollama (`{titulo, resumo, destaques[], pontos_de_atencao[], numeros_citados[]}`). Gere dois textos a partir dos mesmos fatos: um para a família ("Sua mãe dormiu...") e outro para quem usa a pulseira ("Você dormiu..."). O template fixo garante que a demo funcione mesmo com o Ollama desligado.

**Esforço:** médio.

**Limites honestos.** Mesmo o PHIA ainda inventou colunas e métricas às vezes. Não achei benchmark de modelos pequenos do Ollama em português; teste dois ou três modelos (a família Gemma, incluindo o MedGemma 4B, que o Google liberou para rodar localmente em julho de 2025 ([Google Research](https://research.google/blog/medgemma-our-most-capable-open-models-for-health-ai-development/?))) com as mesmas entradas.

### 2.7 Cartão: "Pergunte à IA com ferramentas tipadas"

**O que é.** Perguntas livres da família ("como minha mãe dormiu esta semana?") respondidas por um agente que só pode chamar de 6 a 10 ferramentas fixas (`get_sleep_summary`, `compare_to_baseline`, `list_alerts`, `get_data_gaps`). O servidor executa, e o modelo só redige com os valores devolvidos. Perguntas fora do escopo ("ela tem apneia?") recebem resposta pronta, sem diagnóstico, sugerindo conversar com um profissional de saúde.

**Por que impressiona.** É a versão segura do PHIA para um modelo pequeno: em vez de deixar o modelo escrever código livre, ele escolhe ferramentas, e é justamente delegar a conta que eleva a acurácia ([arXiv PHIA](https://arxiv.org/html/2406.06464v4)). Como extra, dá para fazer por voz com Whisper e Piper rodando localmente, bom para idosos e para a demo.

**Como fazer no stack atual.** Tool calling do Ollama via pacote npm `ollama` numa rota do Next.js, com as ferramentas implementadas sobre as consultas já existentes do Supabase. Faça um conjunto de 30 perguntas com resposta conhecida e meça a taxa de acerto, imitando a avaliação do PHIA.

**Esforço:** médio a grande (grande com voz).

**Limites honestos.** A confiabilidade de tool calling em modelos de 3 a 8 bilhões de parâmetros não foi medida em fonte nenhuma; o teste de 30 perguntas é obrigatório antes de mostrar.

### 2.8 Cartão: "Mini avaliação SHARP da IA"

**O que é.** Gerar de 20 a 30 resumos a partir de semanas simuladas e pedir que 3 pessoas deem nota de 1 a 5 em Segurança, Utilidade, Precisão, Relevância e Personalização. Mostrar a tabela na apresentação.

**Por que impressiona.** É o método do Google, em escala de estudante: o coach do Fitbit foi avaliado com o framework SHARP, mais de 1 milhão de anotações humanas e mais de 100 mil horas de avaliação ([Google Research](https://research.google/blog/how-we-are-building-the-personal-health-coach/)). Mostrar a IA medida com notas, além de demonstrada, separa o CareTwin de projetos comuns.

**Como fazer no stack atual.** Script Python que roda o simulador, chama o pipeline do 2.6 e gera uma planilha de avaliação.

**Esforço:** pequeno.

**Limites honestos.** Três avaliadores da própria equipe têm viés; se possível, chame colegas de fora.

### 2.9 Cartão: "O gêmeo prevê amanhã (com placar de acerto e e se?)"

**O que é.** Um "estado do gêmeo" por pessoa (médias, variâncias, perfil por dia da semana, faixa de horário de sono, confiança dos dados) que se atualiza a cada sincronização e prevê a faixa esperada de passos e sono do dia seguinte. No outro dia, o app mostra previsto contra real e um placar ("o gêmeo acertou 8 de 10 dias dentro da faixa"). Um simulador "e se?" com controles deslizantes ("e se ela andar 30% menos?") roda a mesma regra de alerta em dados hipotéticos e mostra se e quando o alerta dispararia. A volta para o mundo físico fecha o ciclo: lembrete de rotina na tela da pulseira, previsão de bateria ("deve descarregar amanhã às 15h") e sugestão de horário de dormir a partir das últimas 3 noites, como faz o Bedtime Guidance da Samsung ([Samsung Newsroom](https://news.samsung.com/global/new-features-on-one-ui-8-watch-help-users-build-healthier-habits)).

**Por que impressiona.** Dá ao nome "CareTwin" uma defesa técnica. Pelas Academias Nacionais dos EUA, um gêmeo digital é atualizado com dados do gêmeo físico, tem capacidade preditiva, informa decisões e tem interação bidirecional, com verificação, validação e quantificação de incerteza contínuas; sem isso ele "não é confiável" ([NASEM, cap. 2](https://www.nationalacademies.org/read/26894/chapter/4)). O placar de acerto é literalmente a parte de validação da definição. Um avatar 3D sozinho não atende à definição; o cartão 8.5 (3D) fica mais forte se a cor ou postura do avatar vier desse estado.

**Como fazer no stack atual.** Previsão com perfil por dia da semana mais EWMA, intervalo de cerca de 80% (±1,28 desvio). Tabela `gemeo_estado` no Supabase. O "e se?" pode rodar no próprio TypeScript ou no simulador Python. Selo de confiança quando há menos de 7 dias válidos.

**Esforço:** médio.

**Limites honestos.** É um gêmeo comportamental mínimo, de rotina. As Academias lembram que um gêmeo médico nunca é totalmente anonimizável, o que reforça manter a IA local e a segurança por família no Supabase. O "e se?" simula rotina e não prevê desfecho de saúde.

### 2.10 Cartão: "Uma semana em 30 segundos + qualidade dos alertas"

**O que é.** Duas coisas para a banca. Primeiro, um replay: o simulador Python manda 7 a 14 dias sintéticos para /daily e /nights em sequência rápida, com um roteiro (semana normal, queda gradual, viagem, boa notícia, falta de dados), e o painel atualiza ao vivo com Supabase Realtime. Segundo, um slide medido: injetar 50 quedas graduais e 50 períodos normais e reportar sensibilidade, alarmes falsos e atraso de detecção em dias da regra de ±20% contra EWMA/CUSUM.

**Por que impressiona.** O avaliador vê o ciclo inteiro (sensor, API, estatística, texto da IA, família, pulso) em cerca de 2 minutos, mesmo sem dados reais suficientes. E "medimos nossos alertas" vale mais do que "temos alertas". O Supabase Realtime assina inserções nas tabelas, e a própria Supabase recomenda o Broadcast para produção, citação boa para mostrar maturidade ([Supabase docs](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)).

**Como fazer no stack atual.** O simulador já existe, e a API de recibos (aceitos e rejeitados) também. Inclua uma demo offline: desligar o Wi-Fi, caminhar, religar e ver a fila esvaziar no painel.

**Esforço:** pequeno a médio.

**Limites honestos.** Resultados em dados simulados medem só a lógica do sistema; diga isso no slide. A interação do Realtime com as regras de segurança por família precisa ser testada.

### 2.11 Cartão: "Família tranquila: Tudo bem hoje + escalonamento"

**O que é.** Um sinal verde de manhã quando a noite e o dia anterior ficaram dentro do normal, os dados chegaram e a bateria está ok ("dormiu dentro do habitual e já sincronizou hoje"). Cada alerta ganha um responsável; se ninguém confirmar em X horas, sobe para o próximo cuidador, e quem usa a pulseira pode responder "estou bem". Um diário de cuidado permite notas (consulta, viagem, remédio novo) que explicam alertas e marcam dias que não devem mexer na linha de base. Como extra, o botão "Mandar um oi" faz a tela da pulseira mostrar uma mensagem da família.

**Por que impressiona.** Segue tendências da CES 2026, a primeira com área dedicada a AgeTech: o JoyCalls liga todo dia para idosos e manda resumo à família, e o robô Avadin envia relatórios diários de atividade aos cuidadores ([Being Patient, CES 2026](https://beingpatient.com/ces-2026-highlights-future-of-agetech-fall-prevention-ai-monitoring/)). Reforça a decisão de produto de vários cuidadores por pessoa.

**Como fazer no stack atual.** Função agendada no Supabase (pg_cron) para o resumo da manhã, tabela `alert_events` para o histórico (criado, visto, confirmado por, resolvido) e polling do /live para mensagens à pulseira.

**Esforço:** pequeno a médio.

**Limites honestos.** Não achei evidência revisada de que painéis assim reduzem a sobrecarga do cuidador; venda como desenho de produto.

### 2.12 Cartão: "Linguagem segura + próximo passo em cada alerta"

**O que é.** Um checklist de texto para alertas e resumos da IA, mais uma ação concreta e de baixo risco em cada alerta ("ligue para saber como ela está", "meça com o oxímetro emprestado por 3 dias").

**Por que impressiona.** Mostra leitura regulatória atual. A revisão da política de bem-estar da FDA de 6 de janeiro de 2026 diz que um produto perde o status de bem-estar se mostra valores que imitam os clínicos sem validação, se diz "grau médico", se usa alarmes que pedem ação clínica ou se cita doenças e limiares; dizer que uma avaliação profissional pode ajudar é permitido ([Covington](https://www.cov.com/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products)). O desenho do próximo passo vem da Apple: o aviso de hipertensão do Series 11 olha 30 dias de dados e recomenda 7 dias de medidas com manguito antes de falar com um médico ([TechTarget](https://www.techtarget.com/virtualhealthcare/news/366630518/Apple-Watch-launches-new-hypertension-notification-feature)).

**Como fazer no stack atual.** A lista de palavras proibidas já entra no verificador do 2.6. Os textos fixos de alerta passam pelo mesmo checklist.

**Esforço:** pequeno.

**Limites honestos.** Regras da FDA e do AI Act são referência de boas práticas. Para o Brasil, a LGPD trata dado de saúde como dado sensível e a ANVISA não foi pesquisada aqui; confira antes de citar artigos de lei.

### 2.13 Cartão: "Exportar FHIR + relatório para o médico"

**O que é.** Um endpoint que devolve passos diários como recurso FHIR R4 Observation e um PDF de uma página com 14 ou 30 dias (actograma, passos com faixa normal, sono, SRI, alertas, notas da família e o aviso "dados de bem-estar").

**Por que impressiona.** Interoperabilidade é o coração da Saúde 4.0, e o padrão existe: o guia de atividade física do HL7 usa o código LOINC 41950-7 para "número de passos em 24 horas" ([HL7 Physical Activity IG](https://hl7.org/fhir/us/physical-activity/Observation-ExampleDailySteps.xml.html)), e França, Finlândia e Áustria publicam exemplos parecidos ([ANS França](https://interop.esante.gouv.fr/ig/fhir/mesures/3.0.0/Observation-ExampleMesObservationStepsByDay001.html)). Existe também o padrão IEEE 1752.1 (Open mHealth) para sono e atividade física ([IEEE Standards](https://standards.ieee.org/ieee/1752.1/6982/)).

**Como fazer no stack atual.** Mapeamento de JSON numa rota `/api/v1/fhir/...`, validação num servidor de teste público (HAPI) e print de "FHIR válido". O PDF sai de `@react-pdf/renderer` ou de uma página com CSS de impressão. Um botão "baixar meus dados" em CSV ajuda na conversa sobre direitos do titular dos dados.

**Esforço:** pequeno a médio.

**Limites honestos.** Os códigos LOINC de sono e frequência cardíaca não foram conferidos nesta pesquisa. A RNDS brasileira usa FHIR e seria um ótimo gancho local, mas não foi pesquisada. Integração com Health Connect ou Apple Health exige app nativo e fica na categoria 4.

### 2.14 Cartão: "Anéis CareTwin (Mover, Força, Levantar)"

**O que é.** Três arcos diários no relógio e no app: Mover (minutos moderados do 1.5, rumo a cerca de 22 por dia, ou 150 por semana), Força (uma série ou teste feito, rumo a 3 dias por semana para quem tem 65 anos ou mais) e Levantar (quebras de períodos sentados de mais de uma hora). Sequências e recordes pessoais, sem ranking entre idosos.

**Por que impressiona.** Junta as metas da OMS, inclusive a de que trocar tempo sentado por qualquer atividade, até leve, já traz benefício ([resumo OMS 2020](https://www.sport-sante.lu/en/who-recommandations/)), com o vocabulário visual que as pessoas conhecem do Fitbit e do Apple Watch.

**Como fazer no stack atual.** Depende de 1.3 e 1.5. O lembrete de levantar pode piscar a tela enquanto não houver motor de vibração.

**Esforço:** pequeno a médio.

**Limites honestos.** Não achei evidência de que gamificação aumenta a adesão de idosos especificamente. As definições dos anéis da Apple não foram conferidas.

## Categoria 3: sensores novos valem menos do que parecem, simule antes de comprar

A regra para esta categoria: todo sensor primeiro vira um canal falso no simulador Python, entra no backend e no app como se existisse e só é comprado se a demo convencer. Dos sensores abaixo, só a temperatura e o motor de vibração mudam a história do produto de forma clara.

### 3.1 Cartão: "Temperatura da pele à noite (MAX30205)"

**O que é.** Um sensor de temperatura encostado na pele que mede o desvio de cada noite contra a mediana das últimas 14 noites, para sinais de febre ou mudança de ciclo.

**Por que impressiona.** É a melhor aposta de sensor novo. No Oura, a febre de 50 pessoas com COVID muitas vezes apareceu antes dos sintomas, dentro de um estudo com mais de 65.000 anéis ([UC San Diego](https://today.ucsd.edu/story/fever_wearables_2020)). O Apple Watch usa a temperatura noturna para estimativas de ovulação e pede pelo menos 4 horas por noite durante 5 noites para ter leituras ([Apple Support](https://support.apple.com/120357)). O Oura usa "regulação de temperatura" como um dos cinco fatores do Cumulative Stress, lançado em outubro de 2025 ([TechCrunch](https://www.techcrunch.com/2025/10/20/oura-launches-redesigned-app-and-cumulative-stress-feature)). Somado ao 1.8, vira um cartão de "três sinais diferentes esta noite".

**Como fazer no stack atual.** O MAX30205 tem precisão de ±0,1 °C entre 37 e 39 °C, conversa por I2C no mesmo barramento do MPU-6050 e do MAX30102 e consome cerca de 600 µA ([datasheet Analog Devices](https://analog.com/MAX30205/datasheet)). Simule primeiro: média pessoal, ruído noturno de 0,1 a 0,2 °C, um episódio de "febre" de +0,8 a 1,5 °C por 2 a 3 noites junto com FC e respiração mais altas. Preço estimado da placa: US$ 3 a 8.

**Esforço:** médio (pequeno só na simulação).

**Limites honestos.** A pele do punho fica em cerca de 31 a 35 °C, fora da faixa de ±0,1 °C, então a precisão absoluta é menor; o CareTwin só precisa do desvio relativo. O sensor tem que encostar na pele e ficar isolado do calor do ESP32 e da bateria, um ponto de projeto para a caixa impressa.

### 3.2 Cartão: "Motor de vibração + botão Estou bem"

**O que é.** Um motor de vibração tipo moeda e, se couber, um botão físico. Servem para a confirmação de queda, os lembretes de levantar e as mensagens da família.

**Por que impressiona.** Todos os fluxos de queda da big tech começam com toque no pulso, e a Pixel Watch usa um padrão de vibração irregular antes de ligar para emergência ([IEEE Spectrum](https://spectrum.ieee.org/heart-attack-smartwatch)). As faixas vibratórias Proprio, para equilíbrio, apareceram na CES 2026 ([LeadingAge](https://leadingage.org/roundup-key-innovations-from-ces-2026/)). Sem vibração, uma pessoa idosa distraída não vê a contagem na tela.

**Como fazer no stack atual.** Um pino GPIO com transistor. Na simulação, a tela pisca. Preço estimado: R$ 5 a 10.

**Esforço:** pequeno.

**Limites honestos.** Consome bateria em cada vibração; use pulsos curtos. O espaço dentro da caixa precisa ser previsto.

### 3.3 Cartão: "Estresse por GSR (simulado)"

**O que é.** Um sensor de condutância da pele (GSR ou EDA) que mede pequenas variações de suor ligadas à excitação do sistema nervoso. A versão honesta para o CareTwin é "minutos de excitação hoje contra o seu normal", somando GSR com FC e variabilidade, sem nunca mostrar um "nível de estresse".

**Por que impressiona.** O Google e a Fitbit treinaram o recurso Body Response com GSR no punho, temperatura e FC ([Google blog](https://blog.google/products-and-platforms/devices/fitbit/how-we-trained-fitbits-body-response-feature-to-detect-stress/)), e o artigo técnico mostra como juntar canais com regressões logísticas simples ([arXiv 2504.21242](https://arxiv.org/pdf/2504.21242)). Fica bonito no slide e mostra o "simular antes de comprar".

**Como fazer no stack atual.** O módulo Grove GSR custa £ 10,50, funciona em 3,3 V e vem com tiras para dois dedos ([The Pi Hut](https://thepihut.com/products/grove-gsr-sensor)); a saída analógica vai a um pino ADC do ESP32-S3, com média de várias leituras porque o ADC é ruidoso. No simulador: nível de base com deriva lenta, picos de resposta em eventos aleatórios que ficam mais frequentes em "episódios de estresse", artefatos ligados a movimento simulado e usuários de pele seca com poucos picos. Descarte minutos com movimento, como faz a Fitbit.

**Esforço:** médio.

**Limites honestos.** É o sensor mais fraco cientificamente no punho. Uma validação do Empatica E4 não achou "correlação relevante para nenhum parâmetro de EDA em nenhuma condição" contra medida nos dedos ([Sensors 2023](https://www.mdpi.com/1424-8220/23/20/8423)). O algoritmo do próprio Google, na vida real, teve acurácia balanceada de 0,69 e sensibilidade de 0,47, contra um acaso de cerca de 0,63 ([arXiv 2504.21242](https://arxiv.org/pdf/2504.21242)). Exercício, água e pulseira frouxa imitam estresse. Recomendação: fazer só a simulação, ou uma demo de mesa com as tiras nos dedos rotulada "experimental".

### 3.4 Cartão: "Barômetro para andares e confirmação de queda"

**O que é.** Um sensor de pressão (BMP280 ou BMP390) que conta andares subidos e ajuda a confirmar que, depois do impacto, a mão ficou mais baixa.

**Por que impressiona.** Separa escada de caminhada, um ponto fraco do IMU sozinho, e ajuda a separar queda de sentar rápido. Num estudo de 2025, juntar altímetro e acelerômetro levou o recall de quedas a 92% a 97% e generalizou melhor entre posições do sensor ([Jurčić e Magjarević, Sensors 2025](https://www.mdpi.com/1424-8220/25/23/7220)).

**Como fazer no stack atual.** I2C no mesmo barramento. A placa BMP390 da Adafruit custa US$ 10,95 e tem precisão relativa de ±3 Pa, cerca de ±25 cm de altura ([Adafruit](https://www.adafruit.com/product/4816)); a BMP280 é mais barata. Simule com os dados de barômetro de punho que já vêm na base FallAllD ([IEEE DataPort](https://ieee-dataport.org/open-access/fallalld-comprehensive-dataset-human-falls-and-activities-daily-living)) antes de comprar.

**Esforço:** pequeno a médio.

**Limites honestos.** O ganho sobre o acelerômetro sozinho foi "pequeno" nas palavras dos próprios autores. No punho, uma queda muda a altura da mão em 0,5 a 1 m, perto do ruído do sensor, e portas e ar-condicionado criam variações de pressão. Para a queda, motor de vibração e IMU melhor rendem mais.

### 3.5 Cartão: "Em qual cômodo ela está? (BLE)"

**O que é.** Duas ou três placas ESP32 baratas, uma por cômodo, escutam o Bluetooth da pulseira e estimam onde a pessoa está: "foi ao banheiro 4 vezes esta noite, o normal dela é 1", "não passou pela cozinha até 10h".

**Por que impressiona.** É a história mais forte de "envelhecer em casa" com quase nenhum custo. Um estudo de 2025 no PLOS Digital Health acertou o cômodo cerca de 96% das vezes em mais de 600 checagens em duas casas do Reino Unido, com cerca de 20 segundos de calibração por cômodo ([BeaconZone, resumo do estudo](https://www.beaconzone.co.uk/blog/using-bluetooth-beacons-for-in-place-ageing/)). Existe firmware aberto pronto, o ESPresense ([Seeed wiki](https://wiki.seeedstudio.com/xiao-esp32c3-espresense/)).

**Como fazer no stack atual.** A pulseira já tem BLE no ESP32-S3; ela anuncia um identificador e as placas mandam a intensidade de sinal ao backend. Simule com uma cadeia de Markov de cômodos por hora do dia e sinal gerado com perda por distância mais ruído. Preço estimado: US$ 3 a 6 por placa.

**Esforço:** médio.

**Limites honestos.** O artigo original não foi lido, só o resumo. Exige instalar placas na casa, o que muda o produto de "só uma pulseira" para "pulseira mais casa". BLE ligado gasta bateria.

### 3.6 Cartão: "IMU moderno que deixa o ESP32 dormir"

**O que é.** Trocar o MPU-6050 por um IMU com contador de passos, detector de queda livre e um núcleo de machine learning no próprio chip, como o ST LSM6DSO32X.

**Por que impressiona.** Resolve a bateria de 400 mAh. O MPU-6050 consome 3,8 mA com o giroscópio ligado, tem FIFO de só 1 KB ([datasheet InvenSense](https://alliance.seas.upenn.edu/~medesign/wiki/uploads/Guides/MPU6050_datasheet.pdf)) e foi descontinuado, sem recomendação para projetos novos ([Rapid Electronics](https://www.rapidonline.com/news/mpu6050-alternatives-equivalents)). O LSM6DSO32X consome 0,55 mA, tem FIFO de 9 KB, faixa de até ±32 g, contador de passos e núcleo de ML ([ST](https://st.com/en/mems-and-sensors/lsm6dso32x.html)). Num detector de queda de 2025, a função de acordar por movimento de um chip da mesma família levou a bateria de cerca de 4,2 para cerca de 16,7 dias ([Tseng et al. 2025](https://www.mdpi.com/1424-8220/25/12/3632)).

**Como fazer no stack atual.** Antes de comprar, use o truque que o próprio MPU-6050 permite: interrupção de movimento para acordar o ESP32, leitura em lotes pelo FIFO e giroscópio desligado fora dos eventos. Preço estimado da placa nova: US$ 5 a 15.

**Esforço:** médio (troca de driver e retestes).

**Limites honestos.** Para uma demo de poucas semanas, é opcional. Muitos módulos MPU-6050 vendidos são clones; teste se as interrupções funcionam no seu.

### 3.7 Outros sensores que valem só uma linha no backlog

Um sensor de luz ambiente ou UV (BH1750, LTR390, estimativa de US$ 1 a 5) daria "exposição à luz do dia" e "luz na hora de dormir" para o sono, com consumo baixo. Um radar mmWave no quarto confirmaria saída da cama e tempo deitado sem câmera, na linha do Pontosense mostrado na CES 2026 ([Being Patient](https://beingpatient.com/ces-2026-highlights-future-of-agetech-fall-prevention-ai-monitoring/)); modelos e preços não foram conferidos. Um microfone I2S para tosse ou ronco pesa demais na bateria e na privacidade: um protocolo suíço de tosse noturna reconheceu "intrusão de privacidade substancial" e apagava trechos de fala ([BMJ Open](https://bmjopen.bmj.com/content/9/1/e026323)). ECG de uma derivação (AD8232 ou MAX30003) é possível, mas gera uma saída com cara de exame que o projeto quer evitar.

## Categoria 4: o que a big tech faz e o CareTwin explica por que não fez

Esta categoria rende um único slide, "para onde a indústria está indo", que mostra repertório e escopo honesto. A tabela resume o que citar.

| Ideia inspiradora | O que existe hoje (com fonte) | Por que fica fora do CareTwin |
|---|---|---|
| Pressão arterial sem manguito | Aviso de hipertensão do Apple Watch Series 11, liberado pela FDA em setembro de 2025, validado em mais de 2.000 participantes ([TechTarget](https://www.techtarget.com/virtualhealthcare/news/366630518/Apple-Watch-launches-new-hypertension-notification-feature); [Bloomberg](https://www.bloomberg.com/news/articles/2025-09-12/apple-watch-hypertension-detection-coming-next-week-after-fda-nod)); Hilo (Aktiia) com primeira liberação de venda livre em julho de 2025, ensaio com 140 pacientes ([MassDevice](https://www.massdevice.com/fda-clears-aktiia-over-the-counter-g0-cuffless-blood-pressure-monitor/)); carta de advertência da FDA à WHOOP em julho de 2025 ([Orrick](https://www.orrick.com/en/Insights/2025/08/Will-FDAs-Warning-Letter-to-WHOOP-Put-a-Chill-on-Wearables)) | Exige ECG mais PPG com precisão de milissegundos e calibração com manguito por pessoa, que deriva; impossível validar em semanas |
| Detecção de perda de pulso com ligação de emergência | Pixel Watch 3, liberado pela FDA em fevereiro de 2025; 1 ligação errada entre 355 usuários, mas detectou só 67% dos eventos em teste de laboratório ([IEEE Spectrum](https://spectrum.ieee.org/heart-attack-smartwatch)) | Mais de 500 features e redes neurais sobre PPG verde e infravermelho; responsabilidade clínica |
| Saúde cerebral por marcha, fala e sono | Samsung Brain Health, mostrado na CES 2026, em ensaios clínicos ([LeadingAge](https://leadingage.org/roundup-key-innovations-from-ces-2026/)) | Exige microfone, dados clínicos e anos de validação |
| Idade de saúde e prontidão com sensores de alta frequência | Apple Watch Series 12 (9 de setembro de 2026) com FC e HRV em frequência maior, score de prontidão e aba "Longevidade" com "Health Age" ([Apple World Today](https://appleworld.today/2026/09/the-apple-watch-series-12-has-new-health-sensors-and-new-apple-silicon/)) | O MAX30102 no punho só faz leituras curtas confiáveis; a versão possível é o 1.8 |
| LLM de saúde ajustado com dados de wearable | PH-LLM do Google (Nature Medicine 2025): 79% contra 76% de especialistas em sono e 88% contra 71% em condicionamento, em 857 estudos de caso ([Google Research](https://research.google/pubs/a-personal-health-large-language-model-for-sleep-and-fitness-coaching/)) | Ajuste fino com Gemini em escala de big tech; o CareTwin usa modelo local só para redigir |
| Detecção de queda antes do impacto | Base KFall, com sensor na lombar e marcação do início da queda, feita para isso ([Frontiers, KFall](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2021.692865/pdf)) | Precisa de sensor no tronco; no punho o braço domina o sinal |
| FC precisa durante corrida e qualidade da execução do exercício | TROIKA e sucessores para PPG em movimento ([arXiv 1504.04785](https://arxiv.org/pdf/1504.04785)); StrengthSense com 10 sensores no corpo ([arXiv 2511.02027](https://arxiv.org/pdf/2511.02027)) | Óptica melhor, pulseira justa e vários sensores |
| Glicose não invasiva e índice de antioxidantes | FDA abriu caminho de bem-estar para glicose só se contraindicada para diabetes ([Covington](https://www.cov.com/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products)); Samsung mede carotenoides com o polegar ([Samsung Newsroom](https://news.samsung.com/global/new-features-on-one-ui-8-watch-help-users-build-healthier-habits)) | Sensores ópticos específicos, nenhum dispositivo acessível |
| Aprendizado federado e sensoriamento por Wi-Fi | FedFall para queda ([QMU](https://eresearch.qmu.ac.uk/items/5bb48a88-d8c2-4c15-bef7-fad704952c0b/full)); sensoriamento por Wi-Fi ainda generaliza mal entre ambientes ([arXiv 2503.08008](https://arxiv.org/pdf/2503.08008)) | Exige muitos usuários ou pesquisa de base; a linha de base pessoal já é um "modelo por pessoa" |
| Validação de queda no mundo real com idosos | Quedas reais são o padrão-ouro e derrubam os números de laboratório ([Bagalà et al. 2012](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0037062)) | Exige comitê de ética e meses de uso |

Um sinal de 2027 que vale citar com cuidado: segundo a Bloomberg, a Apple teria desistido de um coach de saúde com IA unificado e vai lançar as funções aos poucos ([MobileSyrup](https://mobilesyrup.com/2026/02/06/apple-has-reportedly-dumped-its-planned-ai-health-coach/)). É rumor e deve aparecer como rumor. As obrigações de alto risco do AI Act europeu foram adiadas para 2 de dezembro de 2027 ([Sahha](https://sahha.ai/blog/eu-ai-act-health-apps/)).

## Ranking: as melhores apostas para as poucas semanas que restam

O critério foi impacto na banca por hora de trabalho, priorizando o que reaproveita peças já prontas (simulador, rotas da pulseira, contagens noturnas, linha de base) e o que a usuária pediu explicitamente (queda e academia).

| Posição | Cartão | Categoria | Esforço | Por que agora |
|---|---|---|---|---|
| 1 | 2.6 Números do código, palavras da IA + verificador | 2 | Médio | A IA local já está no escopo; isso a torna defensável com o dado do PHIA (22% contra 84%) |
| 2 | 1.1 Queda em 3 etapas + tela Estou bem | 1 | Médio | Pedido direto, demo ao vivo no colchão, fluxo idêntico ao de Apple, Google e Samsung |
| 3 | 1.10 Detector de uso | 1 | Pequeno | Evita o alerta falso mais óbvio e responde a pergunta que todo avaliador faz |
| 4 | 2.1 Regularidade do sono + actograma | 2 | Pequeno a médio | Dados já existem; biomarcador de 88.975 pessoas |
| 5 | 2.10 Semana em 30 segundos + qualidade dos alertas | 2 | Pequeno a médio | Garante a demo mesmo sem dados reais e transforma alertas em números medidos |
| 6 | 1.3 + 1.4 Modo academia e teste da cadeira | 1 | Médio | O mesmo detector de picos entrega os dois; alto efeito visual na tela |
| 7 | 2.9 O gêmeo prevê amanhã | 2 | Médio | Defende o nome CareTwin pela definição das Academias Nacionais e fortalece o cartão 8.5 |
| 8 | 1.5 Minutos que contam | 1 | Pequeno | Limiar validado para 61 a 85 anos, meta da OMS, quase só backend |
| 9 | 2.12 + 2.5 Linguagem segura e "por que este alerta?" | 2 | Pequeno | Baratos, mostram leitura regulatória e explicabilidade |
| 10 | 3.1 Temperatura simulada (e GSR só simulado) | 3 | Pequeno na simulação | Mostra o método "simular antes de comprar" sem gastar o orçamento |

Fora do top 10 e ainda boas se sobrar tempo: 1.8 (noite diferente do normal), 2.3 (fragmentação, pela mudança de payload), 2.8 (avaliação SHARP, pequena e muito convincente), 2.13 (FHIR) e 3.2 (motor de vibração, se a caixa permitir). Os itens 1.2, 2.7 com voz e 3.5 pedem tempo demais para este prazo.

Uma sugestão de ordem: os cartões 1, 3 e 4 se completam em uma semana com divisão de tarefas, porque um mexe na IA, outro no firmware e outro no backend. O 2.10 deve vir antes da apresentação, porque é ele que garante a demo funcionando.

## Frases de impacto para a apresentação

"Entre 2025 e 2026, Apple, Samsung e Oura passaram a comparar cada pessoa com o próprio normal ao longo de semanas. O CareTwin faz isso com R$ 400 de hardware."

"Na nossa IA, os números vêm do código e as palavras vêm do modelo. O Google mostrou que um LLM acerta 22% das contas sozinho e 84% quando usa código, então cada número do texto é conferido antes de chegar à família."

"A queda passa por três etapas e por uma pergunta na tela antes de avisar alguém, o mesmo desenho de Apple, Google e Samsung. E nós medimos alarmes falsos por dia de uso, porque é isso que faz uma família confiar ou desligar o sistema."

"Regularidade do sono se associou à mortalidade em 88 mil pessoas no UK Biobank. Calculamos esse índice com os dados que a pulseira já coleta toda noite."

"Pela definição das Academias Nacionais dos EUA, um gêmeo digital precisa prever e ser validado. O nosso prevê o dia de amanhã e mostra quantas vezes acertou."

"Oxímetros erram mais em pele escura, e a FDA passou a exigir 150 participantes de tons de pele diferentes nos testes. Num país miscigenado como o Brasil, por isso o CareTwin mostra só tendência."

"Pressão sem manguito existe na Apple e na Hilo, com estudos de milhares de pessoas e liberação da FDA. Deixar isso de fora foi uma decisão de engenharia."

"Todo sensor novo nasce primeiro no simulador. Só compramos o que provou valor na demo."

## Conclusão

A lição principal desta pesquisa muda a pergunta do backlog: o limite do CareTwin está menos nos sensores e mais em quantas análises cada sinal já coletado consegue sustentar com honestidade. O MPU-6050 sozinho alimenta queda, academia, teste da cadeira, cadência, mobilidade, sono, regularidade e fragmentação; o MAX30102, usado só com o braço parado, alimenta recuperação cardíaca e sinais noturnos. Comprar sensor antes de esgotar esses dados gastaria orçamento e semanas sem aumentar a impressão na banca, e o caso do GSR mostra que o sensor mais vistoso costuma ser o menos confiável no punho.

A segunda lição é sobre o que impressiona um avaliador de big tech. As próprias empresas, nos materiais citados aqui, gastam mais espaço com confirmação, avaliação e linguagem cuidadosa do que com acurácia: contagem antes da ligação, avaliação SHARP com milhões de anotações, avisos que pedem uma confirmação antes do médico. Um projeto de estudante que mostra alarmes falsos por dia, placar de acerto do gêmeo, nota SHARP da IA e um slide do que decidiu não fazer fala a mesma língua dessas equipes. Esse rigor de medição é o diferencial mais barato que o CareTwin tem à mão nas semanas que restam.

## Fontes

Queda e risco de queda: [Fula e Moreno, Sensors 2024](https://www.mdpi.com/1424-8220/24/5/1679); [Brew et al., JMIR Formative Research 2022](https://formative.jmir.org/2022/3/e30121/XML); [Bagalà et al., PLoS ONE 2012](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0037062); [aengram, aritmética do alarme falso](https://aengram.ai/articles/the-arithmetic-of-a-false-alarm); [Khojasteh et al., Sensors 2018](https://www.mdpi.com/resolver?pii=s18051350); [Tseng, Huang e Kau, Sensors 2025](https://www.mdpi.com/1424-8220/25/12/3632); [IEEE DataPort FallAllD](https://ieee-dataport.org/open-access/fallalld-comprehensive-dataset-human-falls-and-activities-daily-living); [KFall, Frontiers in Aging Neuroscience 2021](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2021.692865/pdf); [Chan et al., Age and Ageing 2023, UK Biobank](https://www.ukbiobank.ac.uk/publications/prediction-of-injurious-falls-in-older-adults-using-digital-gait-biomarkers-extracted-from-large-scale-wrist-sensor-data/); [Yang et al., JMIR Aging 2019](https://aging.jmir.org/2019/1/e12153/); [Sun et al., SENSORCOMM 2019](https://personales.upv.es/thinkmind/dl/conferences/sensorcomm/sensorcomm_2019/sensorcomm_2019_4_20_10062.pdf); [Jurčić e Magjarević, Sensors 2025](https://www.mdpi.com/1424-8220/25/23/7220); [Adafruit BMP390](https://www.adafruit.com/product/4816); [datasheet MPU-6050](https://alliance.seas.upenn.edu/~medesign/wiki/uploads/Guides/MPU6050_datasheet.pdf); [Rapid Electronics, alternativas ao MPU6050](https://www.rapidonline.com/news/mpu6050-alternatives-equivalents); [ST LSM6DSO32X](https://st.com/en/mems-and-sensors/lsm6dso32x.html); [Apple Support, detecção de queda](https://support.apple.com/en-au/guide/watch/apd34c409704); [Google, detecção de queda do Pixel Watch](https://blog.google/products/pixel/google-pixel-watch-fall-detection-ai/); [Samsung Support, detecção de queda](https://www.samsung.com/ca/support/mobile-devices/galaxy-watch-detect-falls).

TinyML e ESP32-S3: [Schlonsak et al., Univ. Lübeck](https://www.imis.uni-luebeck.de/sites/default/files/2026-06/Schlonsak2025_No_Cloud_No_Problem.pdf); [Malche et al., Future Internet 2026](https://www.mdpi.com/1999-5903/18/4/211); [Espressif, HAR com ESP-DL](https://developer.espressif.com/blog/esp32-s3-edge-ai-human-activity-recognition-using-accelerometer-data-and-esp-dl/).

Atividade física e academia: [RecoFit, Microsoft Research](https://microsoft.com/en-us/research/wp-content/uploads/2016/12/p3225-morris.pdf); [Edge Impulse, Bangle.js](https://edgeimpulse.com/blog/this-smartwatch-doesnt-let-you-skip-leg-day/); [MM-Fit](https://www.research.ed.ac.uk/en/datasets/mm-fit-dataset-physical-exercise-workout-sessions-video/); [StrengthSense, arXiv 2511.02027](https://arxiv.org/pdf/2511.02027); [CADENCE-Adults, IJBNPA 2023](https://doaj.org/article/61311cd41c1b41f188518583573f42c9); [resumo das diretrizes OMS 2020](https://www.sport-sante.lu/en/who-recommandations/); [Fitbit Active Zone Minutes](https://support.google.com/fitbit/answer/14236509); [WHOOP Strain](https://ww2.whoop.com/thelocker/how-does-whoop-strain-work-101/); [teste da cadeira com sensor inercial, PMC3735415](https://pmc.ncbi.nlm.nih.gov/articles/PMC3735415/); [TUG instrumentado, UJI](https://repositori.uji.es:443/xmlui/handle/10234/201062); [PPG de punho em exercício, arXiv 1504.04785](https://arxiv.org/pdf/1504.04785); [Uth et al., VO2max](https://www.springermedizin.de/estimation-of-vo2max-from-the-ratio-between-hrmax-and-hrrest-the/8478242); [Cole et al. 1999, PubMed](https://pubmed.ncbi.nlm.nih.gov/10536127/).

Sensores e sinais: [validação do Empatica E4, Sensors 2023](https://www.mdpi.com/1424-8220/23/20/8423); [Fitbit Body Response, arXiv 2504.21242](https://arxiv.org/pdf/2504.21242); [Google, treino do Body Response](https://blog.google/products-and-platforms/devices/fitbit/how-we-trained-fitbits-body-response-feature-to-detect-stress/); [Grove GSR, The Pi Hut](https://thepihut.com/products/grove-gsr-sensor); [SpO2 no punho, arXiv 2505.20846 (resumo)](https://pith.science/paper/2505.20846); [FDA, rascunho de guia de oxímetros 2025](https://www.fda.gov/media/184896/download); [TCTMD sobre o guia da FDA](https://www.tctmd.com/news/fda-issues-draft-guidance-improving-skin-tone-disparities-pulse-oximeters); [Random Nerd Tutorials, ESP32 e MAX30102](https://randomnerdtutorials.com/esp32-max30102-oximeter-heart-rate-sensor/); [respiração por PPG, medRxiv](https://www.medrxiv.org/content/10.1101/2023.07.25.23293134.full.pdf); [datasheet MAX30205](https://analog.com/MAX30205/datasheet); [UC San Diego, febre no Oura](https://today.ucsd.edu/story/fever_wearables_2020); [Apple Support, temperatura do punho](https://support.apple.com/120357); [Stanford Medicine, sinais precoces de doença](https://med.stanford.edu/news/all-news/2020/12/smartwatch-can-detect-early-signs-of-illness.html); [BeaconZone, BLE para envelhecer em casa](https://www.beaconzone.co.uk/blog/using-bluetooth-beacons-for-in-place-ageing/); [ESPresense, Seeed](https://wiki.seeedstudio.com/xiao-esp32c3-espresense/); [BMJ Open, tosse noturna](https://bmjopen.bmj.com/content/9/1/e026323).

Sono, rotina e biomarcadores: [Windred et al., eLife](https://elifesciences.org/articles/88359); [regularidade contra duração, PMC10782501](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10782501/); [Sundararajan et al., Scientific Reports 2021](https://discovery-pp.ucl.ac.uk/10119274/1/s41598-020-79217-x.pdf); [MrOS, eScholarship](https://escholarship.org/uc/item/1gb7w1mp); [coorte Como Vai?, PMC10871497](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10871497/); [ICS 2025, noctúria](https://www.ics.org/2025/abstract/419); [Johns Hopkins, fragmentação](https://publichealth.jhu.edu/2019/fragmented-physical-activity-linked-to-greater-mortality-risk); [PubMed 31577355](https://pubmed.ncbi.nlm.nih.gov/31577355/); [ScienceDaily, TigerPlace](https://www.sciencedaily.com/releases/2009/01/090106181735.htm); [CarePredict](https://www.carepredict.com/blog/from-data-to-action-how-carepredicts-daily-standup-dashboard-powers-smarter-senior-living).

IA, gêmeo digital e interoperabilidade: [PHIA, arXiv 2406.06464](https://arxiv.org/html/2406.06464v4); [PH-LLM, Google Research](https://research.google/pubs/a-personal-health-large-language-model-for-sleep-and-fitness-coaching/); [coach de saúde do Google](https://research.google/blog/how-we-are-building-the-personal-health-coach/); [MedGemma](https://research.google/blog/medgemma-our-most-capable-open-models-for-health-ai-development/?); [Ollama, saídas estruturadas](https://registry.ollama.ai/blog/structured-outputs); [NASEM, gêmeos digitais, cap. 2](https://www.nationalacademies.org/read/26894/chapter/4); [NASEM, comunicado](https://www.nationalacademies.org/news/2023/12/new-report-urges-multiagency-action-to-support-potentially-transformative-digital-twins-research); [HL7 Physical Activity IG](https://hl7.org/fhir/us/physical-activity/Observation-ExampleDailySteps.xml.html); [ANS França, FHIR passos](https://interop.esante.gouv.fr/ig/fhir/mesures/3.0.0/Observation-ExampleMesObservationStepsByDay001.html); [IEEE 1752.1](https://standards.ieee.org/ieee/1752.1/6982/); [Android Health Connect, sono](https://developer.android.com/health-and-fitness/health-connect/features/sleep-sessions); [Supabase Realtime](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes).

Tendências, mercado e regulação: [TechTarget, hipertensão no Apple Watch](https://www.techtarget.com/virtualhealthcare/news/366630518/Apple-Watch-launches-new-hypertension-notification-feature); [Bloomberg, liberação da FDA](https://www.bloomberg.com/news/articles/2025-09-12/apple-watch-hypertension-detection-coming-next-week-after-fda-nod); [Apple World Today, Series 12](https://appleworld.today/2026/09/the-apple-watch-series-12-has-new-health-sensors-and-new-apple-silicon/); [Samsung Newsroom, One UI 8 Watch](https://news.samsung.com/global/new-features-on-one-ui-8-watch-help-users-build-healthier-habits); [TechRepublic, Galaxy Watch9](https://www.techrepublic.com/article/news-samsung-galaxy-watch9-ultra2/); [IEEE Spectrum, perda de pulso](https://spectrum.ieee.org/heart-attack-smartwatch); [TechCrunch, Oura Cumulative Stress](https://www.techcrunch.com/2025/10/20/oura-launches-redesigned-app-and-cumulative-stress-feature); [Orrick, carta da FDA à WHOOP](https://www.orrick.com/en/Insights/2025/08/Will-FDAs-Warning-Letter-to-WHOOP-Put-a-Chill-on-Wearables); [MassDevice, Aktiia G0](https://www.massdevice.com/fda-clears-aktiia-over-the-counter-g0-cuffless-blood-pressure-monitor/); [Covington, política de bem-estar da FDA 2026](https://www.cov.com/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products); [Sahha, AI Act europeu](https://sahha.ai/blog/eu-ai-act-health-apps/); [MobileSyrup, coach de IA da Apple](https://mobilesyrup.com/2026/02/06/apple-has-reportedly-dumped-its-planned-ai-health-coach/); [Being Patient, CES 2026](https://beingpatient.com/ces-2026-highlights-future-of-agetech-fall-prevention-ai-monitoring/); [LeadingAge, CES 2026](https://leadingage.org/roundup-key-innovations-from-ces-2026/); [FedFall, QMU](https://eresearch.qmu.ac.uk/items/5bb48a88-d8c2-4c15-bef7-fad704952c0b/full); [Wi-Fi sensing, arXiv 2503.08008](https://arxiv.org/pdf/2503.08008).
