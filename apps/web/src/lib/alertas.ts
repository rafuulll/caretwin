import type postgres from "postgres"
import { buscarDias, hojeNoBrasil, somarDias } from "./historico"
import { procurarMudancas } from "./normal"
import { indiceFixo, textosDoAlerta } from "./respostas-ia"
import type { Dados } from "./types"

/**
 * Os alertas nascem aqui, no servidor, quando a pulseira entrega dias novos
 * (cartões 6.1 e 5.5). Assim o aviso existe mesmo com o site fechado, e a
 * família vê o mesmo alerta em qualquer aparelho.
 *
 * A regra é a MESMA do protótipo, sem cópia: `procurarMudancas` em `normal.ts`
 * (7 dias de base antes dos 3 recentes, 20% para cada lado, 2 de 3 dias para o
 * mesmo lado, mínimo de 5 dias válidos). Uma regra só, num lugar só, faz a tela
 * e o banco nunca discordarem sobre o que é "fora do normal".
 *
 * A frase vem dos textos de `respostas-ia.ts`, os mesmos do protótipo. Quando a
 * IA local escrever os textos (cartões 6.2 e 6.3), estes ficam como reserva.
 */

/** Sempre a transação de quem chama: o alerta nasce junto com o dia, ou nada. */
type Sql = postgres.TransactionSql

/**
 * Quantos dias para trás são lidos. A busca de mudanças olha os últimos 10
 * dias, e cada um deles olha mais 10 (os 3 recentes e os 7 da base): 40 dá
 * folga para uma pulseira que ficou uns dias sem mandar nada.
 */
const DIAS_LIDOS = 40

/**
 * Procura mudanças nos dias da pessoa e grava as que ainda não têm alerta.
 *
 * Roda dentro da transação de quem chama (a rota da pulseira ou o ligar pelo
 * código), então o alerta nasce junto com o dia que o causou, ou nada é gravado.
 * A regra única do banco (pessoa, dia e métrica) faz o recálculo nunca duplicar
 * um alerta e nunca desfazer o "lido". Alerta antigo não é apagado: é histórico.
 *
 * Devolve quantos alertas novos nasceram.
 */
export async function criarAlertasNovos(sql: Sql, pessoaId: string, agora = new Date()): Promise<number> {
  const [pessoa] = await sql<{ nome: string; criado_em: Date }[]>`
    select nome, criado_em from pessoas where id = ${pessoaId} and encerrado_em is null
  `
  if (!pessoa) return 0

  // O "hoje" de Brasília: o servidor roda em UTC e, às 22h daqui, lá já é amanhã.
  const hoje = hojeNoBrasil(agora)
  const dias = await buscarDias(sql, pessoaId, somarDias(hoje, -DIAS_LIDOS), hoje)
  if (dias.length === 0) return 0

  const dados: Dados = {
    pessoas: [{ id: pessoaId, nome: pessoa.nome, quemAcompanha: "", criadoEm: pessoa.criado_em.toISOString() }],
    pulseiras: [],
    dias,
    alertas: [],
  }

  let novos = 0
  for (const mudanca of procurarMudancas(dados, hoje)) {
    // A chave é a mesma do protótipo (pessoa, dia e métrica): o mesmo alerta
    // ganha sempre a mesma frase.
    // Passos acima do normal ganham as frases de boa notícia (`ehBoaNoticia`).
    const textos = textosDoAlerta(mudanca.metrica, mudanca.direcao)
    const escrever = textos[indiceFixo(mudanca.id, textos.length)]
    const texto = escrever({
      nome: pessoa.nome,
      metrica: mudanca.metrica,
      direcao: mudanca.direcao,
      valor: mudanca.valor,
      normal: mudanca.faixa.normal,
      desvio: mudanca.desvio,
    })
    const gravados = await sql`
      insert into alertas (pessoa_id, data, metrica, direcao, desvio, texto)
      values (${pessoaId}, ${mudanca.data}, ${mudanca.metrica}, ${mudanca.direcao}, ${mudanca.desvio}, ${texto})
      on conflict (pessoa_id, data, metrica) do nothing
    `
    novos += gravados.count
  }
  return novos
}
