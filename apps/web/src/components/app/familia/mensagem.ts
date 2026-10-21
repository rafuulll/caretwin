import { sistema } from "@/content/site"
import { dataPorExtenso, diaDoCarimbo, horaDoCarimbo, preencher } from "@/lib/formato"

type Recusa = { status: number; codigo?: string; quando?: string }

/**
 * A frase de uma recusa do servidor. Primeiro o código que a própria tela
 * sabe explicar, depois os códigos que qualquer chamada pode dar, e por fim a
 * frase genérica. O texto que vem do servidor nunca vai direto para a tela:
 * ele é para quem lê o log, e as frases do app moram no `site.ts`.
 */
export function mensagemDaRecusa(recusa: Recusa, daTela: Record<string, string> = {}): string {
  // O `quando` do servidor vira o dia ({data}) ou a hora ({hora}), conforme a frase pede.
  const data = recusa.quando ? dataPorExtenso(diaDoCarimbo(recusa.quando)).toLowerCase() : ""
  const hora = recusa.quando ? horaDoCarimbo(recusa.quando) : ""
  if (recusa.codigo && recusa.codigo in daTela) return preencher(daTela[recusa.codigo], { data, hora })
  if (recusa.codigo === "sem_rede") return sistema.erros.semRede
  if (recusa.codigo === "sem_conta") return sistema.erros.semConta
  if (recusa.status === 503) return sistema.erros.desligado
  return sistema.erros.geral
}
