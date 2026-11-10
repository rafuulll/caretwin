/**
 * Conversa com o Ollama, o modelo de linguagem que roda no notebook (cartão 6.3).
 *
 * A Vercel não roda modelo. Na demo, o Ollama fica num computador do grupo e o
 * servidor chama ele pela rede; na versão publicada, sem `OLLAMA_URL`, esta
 * etapa simplesmente não acontece e o texto de regra entra no lugar. O modelo
 * nunca é obrigatório: tudo aqui pode falhar sem o site perceber.
 */

export type ConfigDoOllama = {
  url: string
  modelo: string
  /** Quanto esperar pela resposta antes de desistir e usar o texto de regra. */
  tempoMs: number
}

/** Um modelo de 3B cabe em notebook comum; modelos maiores escrevem melhor em português. */
const MODELO_PADRAO = "llama3.2:3b"
const TEMPO_PADRAO_MS = 8000

export function configDoOllama(env: Record<string, string | undefined> = process.env): ConfigDoOllama | null {
  const url = env.OLLAMA_URL?.trim().replace(/\/+$/, "")
  if (!url) return null
  const tempo = Number(env.OLLAMA_TEMPO_MS)
  return {
    url,
    modelo: env.OLLAMA_MODELO?.trim() || MODELO_PADRAO,
    tempoMs: Number.isFinite(tempo) && tempo >= 1000 ? tempo : TEMPO_PADRAO_MS,
  }
}

/** Pede uma resposta de texto ao modelo. Qualquer problema vira exceção, e quem chama usa a reserva. */
export async function pedirAoOllama(config: ConfigDoOllama, instrucoes: string, pedido: string): Promise<string> {
  const resposta = await fetch(`${config.url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(config.tempoMs),
    body: JSON.stringify({
      model: config.modelo,
      stream: false,
      // Pouca criatividade: o texto só reescreve números que já existem.
      options: { temperature: 0.3, num_predict: 220 },
      messages: [
        { role: "system", content: instrucoes },
        { role: "user", content: pedido },
      ],
    }),
  })
  if (!resposta.ok) throw new Error(`ollama respondeu ${resposta.status}`)
  const corpo: unknown = await resposta.json()
  const texto = (corpo as { message?: { content?: unknown } })?.message?.content
  if (typeof texto !== "string") throw new Error("ollama sem texto")
  return texto
}
