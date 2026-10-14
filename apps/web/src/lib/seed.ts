/*
  Dados de exemplo do CareTwin.

  Duas pessoas inventadas, acompanhadas pela mesma cuidadora, com 21 dias registrados
  gerados de forma determinística a partir da data de hoje. Assim o app sempre abre com
  "hoje" de verdade, e os mesmos exemplos aparecem toda vez que forem restaurados.

  O cenário conta uma história curta, de propósito:
  - Dona Cida vinha andando cerca de 4 mil passos por dia e, nos últimos dois dias,
    andou bem menos. Três noites atrás ela acordou várias vezes.
  - Seu Jorge está no ritmo de sempre, mas dormiu pouco na última noite e a bateria
    da pulseira dele está baixa.
*/

import type { Alerta, Dados, DiaRegistrado, MedicaoBatimentos, Pessoa, Pulseira } from "./types";
import { NOITE } from "./modelo";
import { chaveDia, dataDaChave, somarDias } from "./formato";
import { fracaoDoDia, procurarDesvios, mesclarAlertas } from "./normal";
import { TEXTOS_DE_ALERTA, indiceEstavel } from "@/content/ia";

/** Gerador pseudoaleatório pequeno e determinístico (mulberry32). */
function gerador(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function semente(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function normalAleatorio(rand: () => number, media: number, desvio: number): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return media + desvio * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type Perfil = {
  pessoa: Pessoa;
  pulseira: Omit<Pulseira, "ultimaSincronizacao"> & { minutosDesdeSincronizacao: number };
  passos: (diasAtras: number, rand: () => number) => number;
  deitar: (diasAtras: number, rand: () => number) => number;
  levantar: (diasAtras: number, rand: () => number) => number;
  despertares: (diasAtras: number, rand: () => number) => number;
  bpmMedio: number;
  medicoesPorDia: number;
};

const PERFIS: Perfil[] = [
  {
    pessoa: {
      id: "pessoa-cida",
      nome: "Aparecida Moreira",
      comoChamar: "Dona Cida",
      idadeAproximada: 78,
      quemAcompanha: "Marina, filha",
      criadoEm: "",
    },
    pulseira: { id: "pulseira-cida", pessoaId: "pessoa-cida", codigo: "CT-4F2A", bateria: 64, versao: "0.4.2", minutosDesdeSincronizacao: 18 },
    passos: (d, r) => (d <= 2 ? normalAleatorio(r, 2350, 180) : normalAleatorio(r, 4200, 380)),
    // Minutos desde as 20:00: 170 é 22:50, 610 é 06:10.
    deitar: (_d, r) => normalAleatorio(r, 170, 14),
    levantar: (_d, r) => normalAleatorio(r, 610, 12),
    despertares: (d, r) => (d === 3 ? 5 : Math.round(r() * 2)),
    bpmMedio: 72,
    medicoesPorDia: 2,
  },
  {
    pessoa: {
      id: "pessoa-jorge",
      nome: "Jorge Takahashi",
      comoChamar: "Seu Jorge",
      idadeAproximada: 81,
      quemAcompanha: "Marina, nora",
      criadoEm: "",
    },
    pulseira: { id: "pulseira-jorge", pessoaId: "pessoa-jorge", codigo: "CT-9B71", bateria: 17, versao: "0.4.2", minutosDesdeSincronizacao: 205 },
    passos: (_d, r) => normalAleatorio(r, 6300, 520),
    // Na última noite ele foi deitar 00:40 (280) e levantou às 06:00 (600).
    deitar: (d, r) => (d === 0 ? 280 : normalAleatorio(r, 150, 15)),
    levantar: (d, r) => (d === 0 ? 600 : normalAleatorio(r, 620, 14)),
    despertares: (_d, r) => Math.round(r() * 2),
    bpmMedio: 66,
    medicoesPorDia: 1,
  },
];

const DIAS_DE_EXEMPLO = 21;

/** Uma noite de 840 minutos com movimento acordado, sono quieto e alguns despertares. */
function gerarNoite(rand: () => number, deitar: number, levantar: number, despertares: number, comFalha: boolean): (number | null)[] {
  const contagens: (number | null)[] = [];
  const despertaresEm = Array.from({ length: despertares }, () => deitar + 40 + rand() * Math.max(60, levantar - deitar - 80));
  for (let m = 0; m < NOITE.minutos; m++) {
    let valor: number;
    if (m < deitar || m > levantar) {
      // Acordada: movimento variado, mais intenso de manhã.
      valor = 6 + rand() * 30 + (rand() < 0.2 ? rand() * 30 : 0);
    } else {
      valor = rand() < 0.85 ? Math.floor(rand() * 2) : Math.floor(rand() * 4);
      for (const inicio of despertaresEm) {
        if (m >= inicio && m < inicio + 9) valor = 6 + rand() * 14;
      }
    }
    contagens.push(Math.round(valor));
  }
  if (comFalha) {
    // Um trecho curto sem dado, como acontece quando a pulseira sai do pulso.
    const inicio = Math.floor(levantar + 20);
    for (let m = inicio; m < Math.min(NOITE.minutos, inicio + 35); m++) contagens[m] = null;
  }
  return contagens;
}

function gerarMedicoes(rand: () => number, data: string, quantas: number, media: number, ateAgora: Date | null): MedicaoBatimentos[] {
  const horarios = [9 * 60 + 20, 17 * 60 + 40];
  const medicoes: MedicaoBatimentos[] = [];
  for (let i = 0; i < quantas; i++) {
    const minutos = horarios[i] + Math.floor(rand() * 40);
    const instante = dataDaChave(data);
    instante.setHours(Math.floor(minutos / 60), minutos % 60, 0, 0);
    if (ateAgora && instante > ateAgora) continue;
    medicoes.push({ em: instante.toISOString(), bpm: Math.round(normalAleatorio(rand, media, 3.5)) });
  }
  return medicoes;
}

/** O total que o dia de hoje vai ter quando terminar. Usado pela sincronização simulada. */
export function totalPrevistoHoje(pessoaId: string, hoje: string): number {
  const perfil = PERFIS.find((p) => p.pessoa.id === pessoaId);
  const rand = gerador(semente(`${pessoaId}:${hoje}:passos`));
  // Pulseira recém-conectada: enquanto não há pulseira de verdade, simula um dia comum.
  if (!perfil) return Math.max(0, Math.round(normalAleatorio(rand, 5000, 600)));
  return Math.max(0, Math.round(perfil.passos(0, rand)));
}

export function gerarDadosDeExemplo(agora: Date = new Date()): Dados {
  const hoje = chaveDia(agora);
  const pessoas: Pessoa[] = [];
  const pulseiras: Pulseira[] = [];
  const dias: DiaRegistrado[] = [];

  for (const perfil of PERFIS) {
    const criadoEm = dataDaChave(somarDias(hoje, -DIAS_DE_EXEMPLO));
    pessoas.push({ ...perfil.pessoa, criadoEm: criadoEm.toISOString() });

    const { minutosDesdeSincronizacao, ...pulseira } = perfil.pulseira;
    pulseiras.push({ ...pulseira, ultimaSincronizacao: new Date(agora.getTime() - minutosDesdeSincronizacao * 60000).toISOString() });

    for (let diasAtras = DIAS_DE_EXEMPLO - 1; diasAtras >= 0; diasAtras--) {
      const data = somarDias(hoje, -diasAtras);
      const rand = gerador(semente(`${perfil.pessoa.id}:${data}`));
      const randPassos = gerador(semente(`${perfil.pessoa.id}:${data}:passos`));
      const totalDia = Math.max(0, Math.round(perfil.passos(diasAtras, randPassos)));
      const passos = diasAtras === 0 ? Math.round(totalDia * fracaoDoDia(agora)) : totalDia;
      const minutosAtivos = Math.max(0, Math.round(passos / 95 + normalAleatorio(rand, 0, 4)));

      const deitar = Math.round(perfil.deitar(diasAtras, rand));
      const levantar = Math.round(perfil.levantar(diasAtras, rand));
      const despertares = perfil.despertares(diasAtras, rand);
      const inicio = dataDaChave(somarDias(data, -1));
      inicio.setHours(NOITE.inicioHora, 0, 0, 0);
      const contagens = gerarNoite(rand, deitar, levantar, despertares, diasAtras === 6);
      if (diasAtras === 0) {
        // A noite de hoje só tem dado até o minuto atual.
        const decorridos = Math.floor((agora.getTime() - inicio.getTime()) / 60000);
        for (let m = Math.max(0, decorridos); m < contagens.length; m++) contagens[m] = null;
      }

      dias.push({
        id: `dia:${perfil.pessoa.id}:${data}`,
        pessoaId: perfil.pessoa.id,
        data,
        passos,
        minutosAtivos,
        noite: { inicio: inicio.toISOString(), contagens },
        batimentos: gerarMedicoes(rand, data, perfil.medicoesPorDia, perfil.bpmMedio, diasAtras === 0 ? agora : null),
      });
    }
  }

  const base: Dados = { versao: 1, origem: "exemplos", geradoEm: hoje, pessoas, pulseiras, dias, alertas: [] };
  const alertas = recalcularAlertas(base, hoje, agora).map((alerta) => ({
    ...alerta,
    // Os avisos antigos já foram vistos; os de ontem e de hoje continuam novos.
    lido: alerta.data < somarDias(hoje, -1),
  }));
  return { ...base, alertas };
}

/** Recalcula os alertas a partir dos dias, mantendo o que já foi marcado como lido. */
export function recalcularAlertas(dados: Dados, hoje: string, agora: Date = new Date()): Alerta[] {
  const novos: Alerta[] = procurarDesvios(dados, hoje).map((c) => {
    const pessoa = dados.pessoas.find((p) => p.id === c.pessoaId);
    const texto = TEXTOS_DE_ALERTA[indiceEstavel(c.id, TEXTOS_DE_ALERTA.length)]({
      comoChamar: pessoa?.comoChamar ?? "A pessoa",
      metrica: c.metrica,
      direcao: c.direcao,
      valor: c.valor,
      baixo: c.faixa.baixo,
      alto: c.faixa.alto,
      desvio: c.desvio,
    });
    return {
      id: c.id,
      pessoaId: c.pessoaId,
      data: c.data,
      metrica: c.metrica,
      direcao: c.direcao,
      desvio: Math.round(c.desvio),
      texto,
      lido: false,
      criadoEm: agora.toISOString(),
    };
  });
  return mesclarAlertas(dados.alertas, novos);
}
