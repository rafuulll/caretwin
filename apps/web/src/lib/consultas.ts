/*
  Leituras prontas para as telas: juntam os dados guardados com o normal pessoal.
  São funções puras, então dá para testar e reaproveitar quando a API chegar.
*/

import type { Alerta, Dados, DiaRegistrado, MedicaoBatimentos, Pessoa, Preferencias, Pulseira } from "./types";
import { BATERIA_BAIXA, MINUTOS_PARA_DADO_ANTIGO, type Situacao } from "./modelo";
import { diasPorData, faixaAteAgora, faixaNormal, fracaoDoDia, situacao, valorDoDia, type Faixa } from "./normal";
import { estimarSono, type SonoEstimado } from "./sono";
import { chaveDia, somarDias } from "./formato";

export function pessoaAtiva(dados: Dados, prefs: Preferencias): Pessoa | null {
  if (dados.pessoas.length === 0) return null;
  return dados.pessoas.find((p) => p.id === prefs.pessoaAtivaId) ?? dados.pessoas[0];
}

export function pulseiraDe(dados: Dados, pessoaId: string): Pulseira | null {
  return dados.pulseiras.find((p) => p.pessoaId === pessoaId) ?? null;
}

export function alertasDe(dados: Dados, pessoaId: string): Alerta[] {
  return dados.alertas.filter((a) => a.pessoaId === pessoaId);
}

export function alertasNovos(dados: Dados, pessoaId?: string): number {
  return dados.alertas.filter((a) => !a.lido && (!pessoaId || a.pessoaId === pessoaId)).length;
}

export type EstadoPulseira = {
  bateria: number;
  bateriaBaixa: boolean;
  ultimaSincronizacao: string | null;
  dadoAntigo: boolean;
  codigo: string;
};

export function estadoDaPulseira(pulseira: Pulseira | null, agora: Date): EstadoPulseira | null {
  if (!pulseira) return null;
  const minutos = pulseira.ultimaSincronizacao
    ? (agora.getTime() - new Date(pulseira.ultimaSincronizacao).getTime()) / 60000
    : Infinity;
  return {
    bateria: pulseira.bateria,
    bateriaBaixa: pulseira.bateria <= BATERIA_BAIXA,
    ultimaSincronizacao: pulseira.ultimaSincronizacao,
    dadoAntigo: minutos > MINUTOS_PARA_DADO_ANTIGO,
    codigo: pulseira.codigo,
  };
}

export type ResumoDeHoje = {
  hoje: string;
  dia: DiaRegistrado | null;
  passos: number | null;
  faixaPassosDia: Faixa | null;
  faixaPassosAgora: Faixa | null;
  situacaoPassos: Situacao;
  minutosAtivos: number | null;
  faixaAtividadeAgora: Faixa | null;
  sono: SonoEstimado | null;
  faixaSono: Faixa | null;
  situacaoSono: Situacao;
  ultimaMedicao: MedicaoBatimentos | null;
  faixaBatimentos: Faixa | null;
  semHistorico: boolean;
};

export function resumoDeHoje(dados: Dados, pessoaId: string, agora: Date): ResumoDeHoje {
  const hoje = chaveDia(agora);
  const porData = diasPorData(dados.dias, pessoaId);
  const dia = porData.get(hoje) ?? null;
  const fracao = fracaoDoDia(agora);

  const faixaPassosDia = faixaNormal(porData, "passos", hoje);
  const faixaPassosAgora = faixaPassosDia ? faixaAteAgora(faixaPassosDia, fracao) : null;
  const passos = dia ? dia.passos : null;

  const faixaAtividade = faixaNormal(porData, "atividade", hoje);
  const faixaAtividadeAgora = faixaAtividade ? faixaAteAgora(faixaAtividade, fracao) : null;

  const sono = dia?.noite ? estimarSono(dia.noite.contagens) : null;
  const faixaSono = faixaNormal(porData, "sono", hoje);

  const medicoes = [...porData.values()].flatMap((d) => d.batimentos).sort((a, b) => a.em.localeCompare(b.em));

  return {
    hoje,
    dia,
    passos,
    faixaPassosDia,
    faixaPassosAgora,
    situacaoPassos: situacao(passos, faixaPassosAgora),
    minutosAtivos: dia ? dia.minutosAtivos : null,
    faixaAtividadeAgora,
    sono,
    faixaSono,
    situacaoSono: situacao(sono ? sono.minutosDormindo : null, faixaSono),
    ultimaMedicao: medicoes.at(-1) ?? null,
    faixaBatimentos: faixaNormal(porData, "batimentos", hoje) ?? faixaDasMedicoes(medicoes),
    semHistorico: porData.size === 0,
  };
}

/** Quando ainda não há 5 dias com medição, a faixa de costume sai das próprias medições. */
function faixaDasMedicoes(medicoes: MedicaoBatimentos[]): Faixa | null {
  if (medicoes.length < 5) return null;
  const valores = medicoes.map((m) => m.bpm).sort((a, b) => a - b);
  const em = (p: number) => valores[Math.min(valores.length - 1, Math.floor(p * (valores.length - 1)))];
  return { baixo: em(0.2), alto: em(0.8), mediana: em(0.5), dias: valores.length };
}

export type PontoDaSerie = {
  data: string;
  valor: number | null;
  faixa: Faixa | null;
  situacao: Situacao;
  hoje: boolean;
};

/** Série dos últimos N dias de uma métrica, cada ponto com a faixa normal daquele dia. */
export function serieDosUltimosDias(dados: Dados, pessoaId: string, metrica: "passos" | "atividade" | "sono", agora: Date, n = 14): PontoDaSerie[] {
  const hoje = chaveDia(agora);
  const porData = diasPorData(dados.dias, pessoaId);
  const pontos: PontoDaSerie[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const data = somarDias(hoje, -i);
    const ehHoje = i === 0;
    // O dia de hoje ainda não terminou: passos e atividade de hoje ficam de fora da série.
    const valor = ehHoje && metrica !== "sono" ? null : valorDoDia(porData.get(data), metrica);
    const faixa = faixaNormal(porData, metrica, data);
    pontos.push({ data, valor, faixa, situacao: situacao(valor, faixa), hoje: ehHoje });
  }
  return pontos;
}

/** Noites registradas de uma pessoa, da mais recente para a mais antiga. */
export function noitesDe(dados: Dados, pessoaId: string): DiaRegistrado[] {
  return dados.dias
    .filter((d) => d.pessoaId === pessoaId && d.noite)
    .sort((a, b) => b.data.localeCompare(a.data));
}

/** Medições de batimentos de uma pessoa, da mais recente para a mais antiga. */
export function medicoesDe(dados: Dados, pessoaId: string): (MedicaoBatimentos & { data: string })[] {
  return dados.dias
    .filter((d) => d.pessoaId === pessoaId)
    .flatMap((d) => d.batimentos.map((m) => ({ ...m, data: d.data })))
    .sort((a, b) => b.em.localeCompare(a.em));
}
