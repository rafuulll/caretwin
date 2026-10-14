/*
  Formatação brasileira em um lugar só.
  As datas do CareTwin são guardadas como "AAAA-MM-DD" no horário local, porque o dia de
  quem usa a pulseira começa e termina no relógio dela, e não no UTC do servidor.
*/

const numeroBR = new Intl.NumberFormat("pt-BR");

export function numero(valor: number): string {
  return numeroBR.format(Math.round(valor));
}

export function porcentagem(valor: number): string {
  return `${Math.round(valor)}%`;
}

export function plural(qtd: number, singular: string, pluralTexto: string): string {
  return `${numero(qtd)} ${qtd === 1 ? singular : pluralTexto}`;
}

/** Chave de dia local, montada por componente para nunca cair um dia por causa de fuso. */
export function chaveDia(data: Date): string {
  const a = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${a}-${m}-${d}`;
}

export function dataDaChave(chave: string): Date {
  const [a, m, d] = chave.split("-").map(Number);
  return new Date(a, m - 1, d, 12, 0, 0);
}

export function somarDias(chave: string, dias: number): string {
  const data = dataDaChave(chave);
  data.setDate(data.getDate() + dias);
  return chaveDia(data);
}

export function hojeChave(): string {
  return chaveDia(new Date());
}

const dataLonga = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const diaSemanaCurto = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const diaMes = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
const horaMinuto = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function dataPorExtenso(chave: string): string {
  const texto = dataLonga.format(dataDaChave(chave));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function dataNumerica(chave: string): string {
  return dataCurta.format(dataDaChave(chave));
}

export function diaEMes(chave: string): string {
  return diaMes.format(dataDaChave(chave)).replace(".", "");
}

export function diaDaSemana(chave: string): string {
  const texto = diaSemanaCurto.format(dataDaChave(chave)).replace(".", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function hora(iso: string | Date): string {
  return horaMinuto.format(typeof iso === "string" ? new Date(iso) : iso);
}

/** "há 12 minutos", "há 3 horas", "ontem às 21:40". */
export function tempoDesde(iso: string, agora: Date = new Date()): string {
  const instante = new Date(iso);
  const minutos = Math.round((agora.getTime() - instante.getTime()) / 60000);
  if (minutos < 1) return "agora mesmo";
  if (minutos < 60) return `há ${plural(minutos, "minuto", "minutos")}`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24 && chaveDia(instante) === chaveDia(agora)) return `há ${plural(horas, "hora", "horas")}`;
  const ontem = new Date(agora);
  ontem.setDate(ontem.getDate() - 1);
  if (chaveDia(instante) === chaveDia(ontem)) return `ontem às ${hora(instante)}`;
  return `${dataNumerica(chaveDia(instante))} às ${hora(instante)}`;
}

/** 425 minutos vira "7 h 05". */
export function duracao(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

/** Duração por extenso para leitor de tela: "7 horas e 5 minutos". */
export function duracaoFalada(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  const h = Math.floor(total / 60);
  const m = total % 60;
  const partes: string[] = [];
  if (h > 0) partes.push(plural(h, "hora", "horas"));
  if (m > 0) partes.push(plural(m, "minuto", "minutos"));
  return partes.join(" e ") || "0 minutos";
}

/** Minuto do dia (0 a 1439) para "HH:MM". */
export function minutoParaHora(minutoDoDia: number): string {
  const m = ((Math.round(minutoDoDia) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Chave de busca sem acento e sem caixa. */
export function chaveBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] ?? "" : "";
  return (primeira + ultima).toUpperCase();
}
