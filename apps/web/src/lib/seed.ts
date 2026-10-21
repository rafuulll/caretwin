import { NOITE } from "./modelo"
import { paraISO, somarDias, deISO } from "./formato"
import { fracaoDoDia, procurarMudancas } from "./normal"
import { indiceFixo, textosDoAlerta } from "./respostas-ia"
import type { Alerta, Dados, DataISO, DiaRegistrado, MedicaoBatimentos, Pessoa, Pulseira } from "./types"

/**
 * Os dados de exemplo do CareTwin.
 *
 * Existe por um motivo de uso: um app de acompanhamento vazio na primeira
 * abertura parece quebrado, e o normal só existe depois de alguns dias de
 * pulseira. Então o app abre com duas pessoas inventadas e 21 dias registrados.
 *
 * Os dias são gerados a partir da data de HOJE, com sorteio de semente fixa:
 * o app sempre abre com o "hoje" de verdade, e os mesmos exemplos voltam toda
 * vez que forem restaurados.
 *
 * O cenário conta uma história curta, de propósito, pra cada tela ter o que
 * mostrar:
 *   DONA CIDA anda perto de 4 mil passos por dia e, nos últimos dois dias,
 *   andou bem menos. Três noites atrás ela acordou várias vezes.
 *   SEU JORGE está no ritmo de sempre durante o dia, mas dormiu pouco nas duas
 *   últimas noites, e a pulseira dele está com a bateria baixa e sem
 *   sincronizar faz umas três horas.
 *
 * Os nomes são inventados. Nenhum dado aqui é de pessoa de verdade.
 */

/** Sorteio pequeno e repetível (mulberry32): a mesma semente devolve sempre a mesma sequência. */
function sorteio(semente: number) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function semente(texto: string) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Um valor em torno da média, com a variação de um dia comum. */
function emTornoDe(sortear: () => number, media: number, variacao: number) {
  const u = Math.max(sortear(), 1e-9)
  const v = sortear()
  return media + variacao * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

type Perfil = {
  pessoa: Omit<Pessoa, "criadoEm">
  pulseira: Omit<Pulseira, "ultimaSincronizacao"> & { minutosSemSincronizar: number }
  passos: (diasAtras: number, sortear: () => number) => number
  /** Minutos desde as 20h em que deitou e em que levantou. */
  deitou: (diasAtras: number, sortear: () => number) => number
  levantou: (diasAtras: number, sortear: () => number) => number
  despertares: (diasAtras: number, sortear: () => number) => number
  batimentos: number
  medicoesPorDia: number
}

const PERFIS: Perfil[] = [
  {
    pessoa: { id: "pessoa-cida", nome: "Dona Cida", quemAcompanha: "Marina, filha" },
    pulseira: { id: "pulseira-cida", codigo: "CT-4F2A", pessoaId: "pessoa-cida", bateria: 64, minutosSemSincronizar: 18 },
    passos: (d, s) => (d <= 2 ? emTornoDe(s, 2350, 180) : emTornoDe(s, 4200, 380)),
    // 170 minutos depois das 20h é 22h50; 610 é 6h10.
    deitou: (_d, s) => emTornoDe(s, 170, 14),
    levantou: (_d, s) => emTornoDe(s, 610, 12),
    despertares: (d, s) => (d === 3 ? 5 : Math.round(s() * 2)),
    batimentos: 72,
    medicoesPorDia: 2,
  },
  {
    pessoa: { id: "pessoa-jorge", nome: "Seu Jorge", quemAcompanha: "Marina, nora" },
    pulseira: { id: "pulseira-jorge", codigo: "CT-9B71", pessoaId: "pessoa-jorge", bateria: 17, minutosSemSincronizar: 205 },
    passos: (_d, s) => emTornoDe(s, 6300, 520),
    // Nas duas últimas noites ele foi deitar depois da meia-noite e levantou cedo.
    deitou: (d, s) => (d === 0 ? 280 : d === 1 ? 270 : emTornoDe(s, 150, 15)),
    levantou: (d, s) => (d === 0 ? 600 : d === 1 ? 595 : emTornoDe(s, 620, 14)),
    despertares: (_d, s) => Math.round(s() * 2),
    batimentos: 66,
    medicoesPorDia: 1,
  },
]

const DIAS_DE_EXEMPLO = 21

/** Uma noite de 840 minutos: movimento acordado, sono quieto e alguns despertares no meio. */
function gerarNoite(sortear: () => number, deitou: number, levantou: number, despertares: number, comFalha: boolean) {
  const contagens: (number | null)[] = []
  const despertaresEm = Array.from(
    { length: despertares },
    () => deitou + 40 + sortear() * Math.max(60, levantou - deitou - 80)
  )
  for (let m = 0; m < NOITE.minutos; m++) {
    let valor: number
    if (m < deitou || m > levantou) {
      valor = 6 + sortear() * 30 + (sortear() < 0.2 ? sortear() * 30 : 0)
    } else {
      valor = sortear() < 0.85 ? Math.floor(sortear() * 2) : Math.floor(sortear() * 4)
      for (const inicio of despertaresEm) {
        if (m >= inicio && m < inicio + 9) valor = 6 + sortear() * 14
      }
    }
    contagens.push(Math.round(valor))
  }
  if (comFalha) {
    // Meia hora sem dado logo depois de acordar, como quando a pulseira fica na pia.
    const inicio = Math.floor(levantou + 20)
    for (let m = inicio; m < Math.min(NOITE.minutos, inicio + 35); m++) contagens[m] = null
  }
  return contagens
}

function gerarMedicoes(sortear: () => number, data: DataISO, quantas: number, media: number, ate: Date | null) {
  const horarios = [9 * 60 + 20, 17 * 60 + 40]
  const medicoes: MedicaoBatimentos[] = []
  for (let i = 0; i < quantas; i++) {
    const minutos = horarios[i] + Math.floor(sortear() * 40)
    const instante = deISO(data)
    instante.setHours(Math.floor(minutos / 60), minutos % 60, 0, 0)
    if (ate && instante > ate) continue
    medicoes.push({ em: instante.toISOString(), bpm: Math.round(emTornoDe(sortear, media, 3.5)) })
  }
  return medicoes
}

/**
 * Quantos passos o dia de hoje vai ter quando terminar. É o que a sincronização
 * de exemplo usa pra fazer os passos chegarem conforme o dia anda.
 */
export function passosPrevistosParaHoje(pessoaId: string, hoje: DataISO) {
  const perfil = PERFIS.find((p) => p.pessoa.id === pessoaId)
  const sortear = sorteio(semente(`${pessoaId}:${hoje}:passos`))
  // Pessoa cadastrada agora: enquanto a pulseira de verdade não chega, um dia comum.
  if (!perfil) return Math.max(0, Math.round(emTornoDe(sortear, 5000, 600)))
  return Math.max(0, Math.round(perfil.passos(0, sortear)))
}

export function gerarExemplos(agora: Date = new Date()): Dados {
  const hoje = paraISO(agora)
  const pessoas: Pessoa[] = []
  const pulseiras: Pulseira[] = []
  const dias: DiaRegistrado[] = []

  for (const perfil of PERFIS) {
    pessoas.push({ ...perfil.pessoa, criadoEm: deISO(somarDias(hoje, -DIAS_DE_EXEMPLO)).toISOString() })

    const { minutosSemSincronizar, ...pulseira } = perfil.pulseira
    pulseiras.push({
      ...pulseira,
      ultimaSincronizacao: new Date(agora.getTime() - minutosSemSincronizar * 60000).toISOString(),
    })

    for (let diasAtras = DIAS_DE_EXEMPLO - 1; diasAtras >= 0; diasAtras--) {
      const data = somarDias(hoje, -diasAtras)
      const sortear = sorteio(semente(`${perfil.pessoa.id}:${data}`))
      const sortearPassos = sorteio(semente(`${perfil.pessoa.id}:${data}:passos`))
      const doDia = Math.max(0, Math.round(perfil.passos(diasAtras, sortearPassos)))
      // Hoje ainda está acontecendo: só a parte do dia que já passou.
      const passos = diasAtras === 0 ? Math.round(doDia * fracaoDoDia(agora)) : doDia

      const inicio = deISO(somarDias(data, -1))
      inicio.setHours(NOITE.inicioHora, 0, 0, 0)
      const contagens = gerarNoite(
        sortear,
        Math.round(perfil.deitou(diasAtras, sortear)),
        Math.round(perfil.levantou(diasAtras, sortear)),
        perfil.despertares(diasAtras, sortear),
        diasAtras === 6
      )
      if (diasAtras === 0) {
        // A noite de hoje só tem dado até o minuto de agora.
        const passados = Math.floor((agora.getTime() - inicio.getTime()) / 60000)
        for (let m = Math.max(0, passados); m < contagens.length; m++) contagens[m] = null
      }

      dias.push({
        id: `dia-${perfil.pessoa.id}-${data}`,
        pessoaId: perfil.pessoa.id,
        data,
        passos,
        noite: { inicio: inicio.toISOString(), contagens },
        batimentos: gerarMedicoes(sortear, data, perfil.medicoesPorDia, perfil.batimentos, diasAtras === 0 ? agora : null),
      })
    }
  }

  const base: Dados = { pessoas, pulseiras, dias, alertas: [] }
  const alertas = recalcularAlertas(base, agora).map((alerta) => ({
    ...alerta,
    // Os alertas de antes de ontem já foram vistos; os de ontem e de hoje chegam como novos.
    lido: alerta.data < somarDias(hoje, -1),
  }))
  return { ...base, alertas }
}

/**
 * Refaz os alertas a partir dos dias registrados, guardando o que já foi lido
 * e o texto que já tinha sido escrito. Roda depois de toda sincronização.
 */
export function recalcularAlertas(dados: Dados, agora: Date = new Date()): Alerta[] {
  const existentes = new Map(dados.alertas.map((a) => [a.id, a]))
  const alertas = procurarMudancas(dados, paraISO(agora)).map((mudanca): Alerta => {
    const antigo = existentes.get(mudanca.id)
    if (antigo) return antigo
    const pessoa = dados.pessoas.find((p) => p.id === mudanca.pessoaId)
    const textos = textosDoAlerta(mudanca.metrica, mudanca.direcao)
    const escrever = textos[indiceFixo(mudanca.id, textos.length)]
    return {
      id: mudanca.id,
      pessoaId: mudanca.pessoaId,
      data: mudanca.data,
      metrica: mudanca.metrica,
      direcao: mudanca.direcao,
      desvio: mudanca.desvio,
      texto: escrever({
        nome: pessoa?.nome ?? "",
        metrica: mudanca.metrica,
        direcao: mudanca.direcao,
        valor: mudanca.valor,
        normal: mudanca.faixa.normal,
        desvio: mudanca.desvio,
      }),
      lido: false,
      criadoEm: agora.toISOString(),
    }
  })
  return alertas.sort((a, b) => b.data.localeCompare(a.data) || a.metrica.localeCompare(b.metrica))
}
