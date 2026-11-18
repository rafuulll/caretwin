/**
 * O modelo de linguagem na nuvem que escreve os textos (cartão 6.3).
 *
 * Serve qualquer serviço com a API no formato da OpenAI (Gemini, Groq, OpenAI,
 * OpenRouter...): trocar de serviço é trocar `IA_URL`, `IA_CHAVE` e `IA_MODELO`,
 * sem mexer no código. Responde em poucos segundos e funciona também no site
 * publicado. Por que nuvem e não um modelo local: decisão 0005.
 *
 * Nada aqui é obrigatório: sem as três variáveis, ou com qualquer falha, o
 * texto de regra entra no lugar e o site continua inteiro.
 */

export type ConfigDoModelo = {
  url: string
  modelo: string
  /** Mora no ambiente do servidor e nunca sai dele. */
  chave: string
  /** Quanto esperar pela resposta antes de desistir e usar o texto de regra. */
  tempoMs: number
  /** Opcional: `reasoning_effort` para modelos que "pensam" antes de responder. */
  raciocinio?: string
}

const TEMPO_PADRAO_MS = 15000

export function configDoModelo(env: Record<string, string | undefined> = process.env): ConfigDoModelo | null {
  const url = env.IA_URL?.trim().replace(/\/+$/, "")
  const chave = env.IA_CHAVE?.trim()
  const modelo = env.IA_MODELO?.trim()
  if (!url || !chave || !modelo) return null
  const tempo = Number(env.IA_TEMPO_MS)
  return {
    url,
    chave,
    modelo,
    tempoMs: Number.isFinite(tempo) && tempo >= 1000 ? tempo : TEMPO_PADRAO_MS,
    raciocinio: env.IA_RACIOCINIO?.trim() || undefined,
  }
}

/** Pede uma resposta de texto ao modelo. Qualquer problema vira exceção, e quem chama usa a reserva. */
export async function pedirAoModelo(config: ConfigDoModelo, instrucoes: string, pedido: string): Promise<string> {
  const resposta = await fetch(`${config.url}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.chave}` },
    signal: AbortSignal.timeout(config.tempoMs),
    body: JSON.stringify({
      model: config.modelo,
      // Pouca criatividade: o texto só reescreve números que já existem.
      temperature: 0.3,
      // Folga para modelos que gastam parte do limite pensando; o verificador corta texto longo.
      max_tokens: 700,
      ...(config.raciocinio ? { reasoning_effort: config.raciocinio } : {}),
      messages: [
        { role: "system", content: instrucoes },
        { role: "user", content: pedido },
      ],
    }),
  })
  // Só o status: o corpo do erro pode repetir parte do pedido, e a chave nunca entra na mensagem.
  if (!resposta.ok) throw new Error(`modelo respondeu ${resposta.status}`)
  const corpo: unknown = await resposta.json()
  const texto = (corpo as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content
  if (typeof texto !== "string") throw new Error("modelo sem texto")
  return texto
}
