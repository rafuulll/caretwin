// Testes do núcleo (rodam no PC): pio test -e native
#include <string.h>
#include <unity.h>

#include "ct_core.h"

using namespace ct;

void setUp() {}
void tearDown() {}

// Gera uma "caminhada": pico de 1,5 g por 150 ms e 0,8 g por 350 ms (2 passos por segundo).
static uint16_t walk(StepDetector& det, uint32_t& t, int n_steps) {
  uint16_t total = 0;
  for (int s = 0; s < n_steps; ++s) {
    for (int i = 0; i < 8; ++i, t += 20) total += det.update(t, 1.5f);
    for (int i = 0; i < 17; ++i, t += 20) total += det.update(t, 0.8f);
  }
  return total;
}

static void test_validacao_de_amostra() {
  float mag = 0;
  ImuSample ok{0, 0.f, 0.f, 1.f, true};
  TEST_ASSERT_EQUAL(SAMPLE_OK, validateSample(ok, &mag));
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 1.0f, mag);
  ImuSample fail{0, 0.f, 0.f, 1.f, false};
  TEST_ASSERT_EQUAL(SAMPLE_READ_ERROR, validateSample(fail, &mag));
  ImuSample zero{0, 0.f, 0.f, 0.f, true};
  TEST_ASSERT_EQUAL(SAMPLE_OUT_OF_RANGE, validateSample(zero, &mag));
  ImuSample sat{0, 3.f, 3.f, 3.f, true};
  TEST_ASSERT_EQUAL(SAMPLE_OUT_OF_RANGE, validateSample(sat, &mag));
  ImuSample nanv{0, NAN, 0.f, 1.f, true};
  TEST_ASSERT_EQUAL(SAMPLE_NOT_FINITE, validateSample(nanv, &mag));
}

static void test_20_passos_contam_20() {
  StepDetector det;
  uint32_t t = 0;
  TEST_ASSERT_EQUAL_UINT16(20, walk(det, t, 20));
}

static void test_gesto_de_3_picos_nao_conta() {
  StepDetector det;
  uint32_t t = 0;
  TEST_ASSERT_EQUAL_UINT16(0, walk(det, t, 3));
  t += 3000;  // pausa: a sequência recomeça
  TEST_ASSERT_EQUAL_UINT16(0, walk(det, t, 3));
}

static void test_parado_nao_conta() {
  StepDetector det;
  uint16_t total = 0;
  for (uint32_t t = 0; t < 60000; t += 20) total += det.update(t, 1.0f);
  TEST_ASSERT_EQUAL_UINT16(0, total);
}

static void test_minuto_fecha_na_virada() {
  MinuteAggregator agg;
  MinuteSummary m{};
  const int64_t base = 1792497600;  // 2026-10-20 09:00 local
  int closed = 0;
  for (int i = 0; i < 3000; ++i) {
    closed += agg.add(base + i / 50, true, true, (i % 10 == 0) ? 1.3f : 1.0f, 0, &m);
  }
  TEST_ASSERT_EQUAL(0, closed);
  TEST_ASSERT_TRUE(agg.add(base + 60, true, true, 1.0f, 0, &m));
  TEST_ASSERT_EQUAL_INT64(base, m.minute_epoch);
  TEST_ASSERT_EQUAL_UINT16(3000, m.samples_valid);
  TEST_ASSERT_EQUAL_UINT16(300, m.activity_count);
}

static MinuteSummary fullMinute(int64_t epoch, uint16_t steps, uint16_t activity) {
  MinuteSummary m{};
  m.minute_epoch = epoch;
  m.clock_valid = true;
  m.samples_total = 3000;
  m.samples_valid = 3000;
  m.activity_count = activity;
  m.steps = steps;
  return m;
}

static void test_dia_fecha_na_meia_noite_local() {
  DayStore s;
  const int64_t t2358 = 1792551480;  // 2026-10-20 23:58 local
  s.onMinute(fullMinute(t2358, 10, 100), 80);
  s.onMinute(fullMinute(t2358 + 60, 5, 0), 79);
  TEST_ASSERT_EQUAL_size_t(0, s.pendingDays());
  s.onMinute(fullMinute(t2358 + 120, 3, 0), 79);  // 00:00 do dia 21
  TEST_ASSERT_EQUAL_size_t(1, s.pendingDays());
  TEST_ASSERT_EQUAL_STRING("2026-10-20", s.pendingDay(0).date);
  TEST_ASSERT_EQUAL_UINT32(15, s.pendingDay(0).steps);
  TEST_ASSERT_EQUAL_UINT16(1, s.pendingDay(0).active_minutes);
  TEST_ASSERT_EQUAL_UINT8(79, s.pendingDay(0).battery_pct);
  TEST_ASSERT_EQUAL_STRING("2026-10-21", s.current().date);
  TEST_ASSERT_EQUAL_UINT32(3, s.current().steps);
}

static void test_hora_invalida_nao_fecha_dia() {
  DayStore s;
  MinuteSummary m = fullMinute(1000, 7, 0);  // 1970: hora inválida
  m.clock_valid = false;
  s.onMinute(m, 50);
  m.minute_epoch = 1000 + 86400 * 2;
  s.onMinute(m, 50);
  TEST_ASSERT_FALSE(s.currentHasDate());
  TEST_ASSERT_EQUAL_size_t(0, s.pendingDays());
  TEST_ASSERT_EQUAL_UINT32(14, s.current().steps);  // passos continuam contando
  s.onMinute(fullMinute(1792497600, 1, 0), 50);     // hora ficou válida
  TEST_ASSERT_TRUE(s.currentHasDate());
  TEST_ASSERT_EQUAL_STRING("2026-10-20", s.current().date);
  TEST_ASSERT_EQUAL_UINT32(15, s.current().steps);
}

static void test_dia_sem_dado_nao_vira_linha() {
  DayStore s;
  MinuteSummary m = fullMinute(1792551480, 0, 0);
  m.samples_valid = 100;  // sensor falhando: minuto sem dado
  s.onMinute(m, 50);
  s.onMinute(fullMinute(1792551480 + 180, 0, 0), 50);  // já é o dia 21
  TEST_ASSERT_EQUAL_size_t(0, s.pendingDays());
}

static void test_fila_guarda_7_e_descarta_o_mais_antigo() {
  DayStore s;
  int64_t t = 1792497600;  // 2026-10-20 09:00 local
  for (int d = 0; d < 9; ++d) {
    s.onMinute(fullMinute(t + d * 86400LL, 100, 0), 50);
  }
  // 9 dias abertos -> 8 fechados -> fila com 7, 1 descartado
  TEST_ASSERT_EQUAL_size_t(7, s.pendingDays());
  TEST_ASSERT_EQUAL_UINT32(1, s.droppedDays());
  TEST_ASSERT_EQUAL_STRING("2026-10-21", s.pendingDay(0).date);
}

static void test_ack_remove_so_o_confirmado() {
  DayStore s;
  int64_t t = 1792497600;
  for (int d = 0; d < 3; ++d) s.onMinute(fullMinute(t + d * 86400LL, 100, 0), 50);
  TEST_ASSERT_EQUAL_size_t(2, s.pendingDays());
  char acc[1][11] = {"2026-10-20"};
  TEST_ASSERT_EQUAL_size_t(1, s.ackDays(acc, 1));
  TEST_ASSERT_EQUAL_size_t(1, s.pendingDays());
  TEST_ASSERT_EQUAL_STRING("2026-10-21", s.pendingDay(0).date);
}

static void test_janela_da_noite() {
  DayStore s;
  const int64_t t2000 = 1792537200;  // 2026-10-20 20:00 local
  s.onMinute(fullMinute(t2000, 0, 5), 50);
  s.onMinute(fullMinute(t2000 + 60, 0, 0), 50);
  TEST_ASSERT_TRUE(s.inNight());
  TEST_ASSERT_EQUAL_STRING("2026-10-20", s.currentNight().night_date);
  TEST_ASSERT_EQUAL_UINT16(5, s.currentNight().counts[0]);
  TEST_ASSERT_EQUAL_UINT16(0, s.currentNight().counts[1]);
  TEST_ASSERT_EQUAL_UINT16(NO_DATA, s.currentNight().counts[2]);
  // 03:00 do dia 21 ainda pertence à noite do dia 20
  s.onMinute(fullMinute(t2000 + 7 * 3600, 0, 9), 50);
  TEST_ASSERT_EQUAL_STRING("2026-10-20", s.currentNight().night_date);
  TEST_ASSERT_EQUAL_UINT16(9, s.currentNight().counts[420]);
  // 10:00 do dia 21 fecha a noite
  s.onMinute(fullMinute(t2000 + 14 * 3600, 0, 0), 50);
  TEST_ASSERT_FALSE(s.inNight());
  TEST_ASSERT_EQUAL_size_t(1, s.pendingNights());
  TEST_ASSERT_EQUAL_UINT16(3, s.pendingNight(0).minutes_with_data);
}

static void test_payload_diario_segue_o_contrato() {
  DayStore s;
  s.onMinute(fullMinute(1792551480, 42, 100), 62);
  s.onMinute(fullMinute(1792551480 + 180, 0, 0), 61);
  char buf[512];
  TEST_ASSERT_TRUE(buildDailyPayload(s, 61, "0.1.0-test", buf, sizeof(buf)) > 0);
  TEST_ASSERT_EQUAL_STRING(
      "{\"firmware\":\"0.1.0-test\",\"battery_pct\":61,\"days\":[{\"date\":\"2026-10-20\","
      "\"steps\":42,\"active_minutes\":1}]}",
      buf);
}

static void test_payload_noite_usa_null_para_sem_dado() {
  DayStore s;
  const int64_t t2000 = 1792537200;
  s.onMinute(fullMinute(t2000, 0, 5), 50);
  s.onMinute(fullMinute(t2000 + 14 * 3600, 0, 0), 50);
  static char buf[8192];
  TEST_ASSERT_TRUE(buildNightPayload(s.pendingNight(0), buf, sizeof(buf)) > 0);
  TEST_ASSERT_NOT_NULL(strstr(buf, "\"night_date\":\"2026-10-20\""));
  TEST_ASSERT_NOT_NULL(strstr(buf, "\"window_start\":\"2026-10-20T20:00:00-03:00\""));
  TEST_ASSERT_NOT_NULL(strstr(buf, "\"counts\":[5,null,null"));
}

static void test_resposta_da_api() {
  char dates[7][11];
  TEST_ASSERT_EQUAL_INT(2, parseAccepted("{\"accepted\":[\"2026-10-20\",\"2026-10-21\"],\"rejected\":[]}", dates, 7));
  TEST_ASSERT_EQUAL_STRING("2026-10-21", dates[1]);
  TEST_ASSERT_EQUAL_INT(-1, parseAccepted("{\"json\":{}}", dates, 7));  // eco sem contrato
  TEST_ASSERT_EQUAL_INT(-1, parseAccepted("nao e json", dates, 7));
}

static void test_conversao_de_data() {
  char iso[32];
  formatLocalIso(1792551480, -3 * 3600, iso, sizeof(iso));
  TEST_ASSERT_EQUAL_STRING("2026-10-20T23:58:00-03:00", iso);
  TEST_ASSERT_FALSE(isClockValid(946684800));  // 2000-01-01
  TEST_ASSERT_TRUE(isClockValid(1792551480));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_validacao_de_amostra);
  RUN_TEST(test_20_passos_contam_20);
  RUN_TEST(test_gesto_de_3_picos_nao_conta);
  RUN_TEST(test_parado_nao_conta);
  RUN_TEST(test_minuto_fecha_na_virada);
  RUN_TEST(test_dia_fecha_na_meia_noite_local);
  RUN_TEST(test_hora_invalida_nao_fecha_dia);
  RUN_TEST(test_dia_sem_dado_nao_vira_linha);
  RUN_TEST(test_fila_guarda_7_e_descarta_o_mais_antigo);
  RUN_TEST(test_ack_remove_so_o_confirmado);
  RUN_TEST(test_janela_da_noite);
  RUN_TEST(test_payload_diario_segue_o_contrato);
  RUN_TEST(test_payload_noite_usa_null_para_sem_dado);
  RUN_TEST(test_resposta_da_api);
  RUN_TEST(test_conversao_de_data);
  return UNITY_END();
}
