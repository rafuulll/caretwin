/*
  Copy das telas de dentro do app. Nada de texto visível escrito em componente.
*/

import type { Metrica, Situacao } from "@/lib/modelo";
import { plural } from "@/lib/formato";

export const situacoes: Record<Situacao, { rotulo: string; descricao: string }> = {
  dentro: { rotulo: "Dentro do normal", descricao: "Parecido com os últimos 14 dias" },
  abaixo: { rotulo: "Abaixo do normal", descricao: "Menos do que costuma" },
  acima: { rotulo: "Acima do normal", descricao: "Mais do que costuma" },
  sem_dados: { rotulo: "Ainda aprendendo", descricao: "Faltam alguns dias para conhecer o normal" },
};

export const metricas: Record<Metrica, { nome: string; unidade: string }> = {
  passos: { nome: "Passos", unidade: "passos" },
  atividade: { nome: "Tempo em movimento", unidade: "minutos" },
  sono: { nome: "Sono", unidade: "horas" },
  batimentos: { nome: "Batimentos", unidade: "por minuto" },
};

export const comum = {
  verTabela: "Ver os números em tabela",
  esconderTabela: "Esconder a tabela",
  semDados: "Sem dado",
  hoje: "Hoje",
  ontem: "Ontem",
  fechar: "Fechar",
  cancelar: "Cancelar",
  salvar: "Salvar",
  voltar: "Voltar",
  continuar: "Continuar",
  naoEhDiagnostico: "Comparação com o próprio normal. Não é diagnóstico.",
  foraDoNormal: "Fora do normal",
  instrucoesGrafico: "Use as setas para a esquerda e para a direita para ouvir cada ponto do gráfico.",
};

export const ia = {
  titulo: "Resumo do dia",
  tituloQuemCuida: "Resumo para quem cuida",
  gerar: "Escrever o resumo",
  gerarDeNovo: "Escrever de outro jeito",
  gerando: "Escrevendo o resumo…",
  vazio: "Um parágrafo curto, em palavras simples, sobre a noite e o dia até agora.",
  aviso: "A IA ainda não está rodando de verdade: este é um resumo de exemplo, montado com os números reais do dia.",
  como: "Como ligar",
  modal: {
    titulo: "Como ligar a IA de verdade",
    intro: "No CareTwin, quem escreve os resumos é uma IA que roda no próprio computador do projeto, sem mandar dado de saúde para fora.",
    passos: [
      "Instale o Ollama no computador que vai rodar a API e baixe um modelo pequeno em português.",
      "Na API (pasta apps/api), preencha OLLAMA_URL e OLLAMA_MODEL no arquivo .env.local, a partir do .env.example.",
      "A API passa a gerar o texto a partir dos números do dia, e estes exemplos viram a reserva para quando o modelo não responder.",
      "Se um dia o time preferir uma IA na nuvem, a chave se pega em platform.openai.com ou console.anthropic.com.",
    ],
    regraTitulo: "Regra da casa para qualquer chave",
    regra:
      "A chave mora numa variável de ambiente (.env.local, documentada sem valor no .env.example), a chamada sai de uma rota de servidor da API e a chave nunca é escrita no código do navegador nem enviada para o GitHub.",
  },
};

export const hoje = {
  titulo: "Hoje",
  saudacao: (nome: string, hora: number) => `${hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite"}, ${nome}`,
  apoio: (nome: string) => `O dia de ${nome}, comparado com o normal dos últimos 14 dias.`,
  pulseira: {
    titulo: "Pulseira",
    sincronizou: (quando: string) => `Sincronizou ${quando}`,
    nunca: "Ainda não sincronizou",
    antigo: "Os dados podem estar atrasados.",
    bateria: (n: number) => `Bateria em ${n}%`,
    bateriaBaixa: "Bateria baixa: vale carregar hoje à noite.",
    sincronizar: "Sincronizar agora",
    sincronizando: "Sincronizando…",
    sincronizada: "Pulseira sincronizada agora.",
    codigo: (c: string) => `Pulseira ${c}`,
  },
  passos: {
    titulo: "Passos até agora",
    faixa: (baixo: string, alto: string) => `O normal neste horário fica entre ${baixo} e ${alto}`,
    faixaDia: (baixo: string, alto: string) => `Num dia inteiro, costuma ficar entre ${baixo} e ${alto}`,
    aprendendo: "Com mais alguns dias de uso, o CareTwin aprende o normal desta pessoa.",
    ativos: "Tempo em movimento",
    ativosValor: (n: number) => plural(n, "minuto", "minutos"),
    legendaGrafico: "Passos de hoje comparados com a faixa normal deste horário.",
  },
  noite: {
    titulo: "Como foi a noite",
    dormiu: "Dormiu cerca de",
    janela: (inicio: string, fim: string) => `Das ${inicio} às ${fim}`,
    costume: (texto: string) => `Costuma dormir ${texto}`,
    despertares: (n: number) => (n === 0 ? "Não acordou durante a noite" : `Acordou ${plural(n, "vez", "vezes")} durante a noite`),
    emAndamento: "A noite ainda está em andamento. O resumo aparece quando a pessoa acordar.",
    semNoite: "A pulseira ainda não mandou os dados desta noite.",
    verNoite: "Ver a noite em detalhe",
  },
  batimentos: {
    titulo: "Batimentos",
    ultima: (quando: string) => `por minuto, ${quando}`,
    nenhuma: "Nenhuma medição ainda.",
    medir: "Medir agora",
  },
  tendencia: {
    titulo: "Passos nos últimos 14 dias",
    apoio: "A faixa mostra o normal de cada dia. Pontos com contorno grosso ficaram fora dela.",
    legendaSerie: "Passos do dia",
    legendaFaixa: "Faixa normal",
    tabela: { data: "Dia", valor: "Passos", faixa: "Faixa normal", situacao: "Situação" },
    resumoLeitor: (abaixo: number) =>
      abaixo === 0 ? "Nos últimos 14 dias, todos os dias ficaram dentro ou perto do normal." : `Nos últimos 14 dias, ${plural(abaixo, "dia ficou", "dias ficaram")} fora do normal.`,
  },
  alertas: {
    novos: (n: number) => (n === 1 ? "Há 1 alerta novo para olhar com calma." : `Há ${n} alertas novos para olhar com calma.`),
    ver: "Ver alertas",
  },
};

export const sono = {
  titulo: "Sono",
  apoio: "O sono é estimado pelo movimento do pulso durante a noite, das 20:00 às 10:00. É uma estimativa, não um exame.",
  escolherNoite: "Escolher a noite",
  anterior: "Noite anterior",
  proxima: "Próxima noite",
  noiteDe: (data: string) => `Noite que terminou em ${data}`,
  dormiu: "Dormiu cerca de",
  foiDormir: "Pegou no sono",
  acordou: "Acordou",
  despertares: "Despertares",
  costume: "Costume dos últimos 14 dias",
  costumeValor: (baixo: string, alto: string) => `${baixo} a ${alto}`,
  grafico: {
    titulo: "Movimento durante a noite",
    apoio: "Cada barra junta 5 minutos. Barras baixas são sono tranquilo; a área destacada é o período em que a pessoa provavelmente dormiu.",
    legendaMovimento: "Movimento a cada 5 minutos",
    legendaSono: "Período de sono estimado",
    semDado: "Sem dado",
    tabela: { hora: "Horário", movimento: "Movimento médio por minuto" },
    movimento: (v: number) => `${v.toFixed(1).replace(".", ",")} movimentos por minuto`,
    resumoLeitor: (inicio: string, fim: string, duracao: string, despertares: number) =>
      `Pegou no sono por volta das ${inicio}, acordou por volta das ${fim}, dormiu ${duracao} e acordou ${plural(despertares, "vez", "vezes")} no meio da noite.`,
  },
  semana: {
    titulo: "Horas de sono nas últimas noites",
    legendaSerie: "Horas dormidas",
    resumo: (abaixo: number) =>
      abaixo === 0 ? "Nas últimas noites, o sono ficou dentro do costume." : `Nas últimas noites, ${plural(abaixo, "noite ficou", "noites ficaram")} abaixo do costume.`,
    tabela: { data: "Noite", valor: "Dormiu", faixa: "Costume", situacao: "Situação" },
  },
  semNoites: {
    titulo: "Ainda não chegou nenhuma noite",
    texto: "Depois da primeira noite com a pulseira no pulso, o sono aparece aqui na manhã seguinte.",
  },
  emAndamento: "Esta noite ainda está em andamento.",
  como: {
    titulo: "Como o CareTwin estima o sono",
    texto:
      "A pulseira conta quantas vezes o pulso se mexe a cada minuto. Quando o movimento fica baixo por pelo menos meia hora, o CareTwin entende que a pessoa pegou no sono; quando volta a subir e fica alto, entende que ela acordou. Despertares curtos, de 5 minutos ou mais, são contados à parte.",
  },
};

export const batimentos = {
  titulo: "Batimentos",
  apoio: "Uma medição de bancada, feita quando você pedir, com a faixa de costume desta pessoa ao lado.",
  medir: {
    titulo: "Medir agora",
    instrucao: "Sente-se, apoie o braço e deixe a pulseira bem encostada no pulso.",
    botao: "Começar a medição",
    medindo: "Medindo… fique com o braço parado",
    restante: (s: number) => `Faltam ${plural(s, "segundo", "segundos")}`,
    cancelar: "Cancelar medição",
    resultado: (bpm: number) => `${bpm} batimentos por minuto`,
    unidade: "batimentos por minuto",
    guardado: "Medição guardada no histórico de hoje.",
    simulada: "Nesta versão, a medição é simulada pelo app. Com a pulseira conectada, o valor vem do sensor MAX30102.",
    novamente: "Medir de novo",
  },
  faixa: (baixo: number, alto: number) => `Costuma ficar entre ${baixo} e ${alto} por minuto`,
  semFaixa: "Com mais algumas medições, aparece a faixa de costume.",
  historico: {
    titulo: "Histórico",
    apoio: "Medições dos últimos 14 dias.",
    legendaSerie: "Medição",
    legendaFaixa: "Faixa de costume",
    tabela: { quando: "Quando", valor: "Batimentos por minuto", situacao: "Situação" },
    vazio: "Ainda não há medições. A primeira aparece aqui assim que você medir.",
  },
  aviso: "Medida de bancada para acompanhamento. Não substitui aparelho médico. Se sentir mal-estar, procure atendimento.",
};

export const alertas = {
  titulo: "Alertas",
  apoio: "O que fugiu do normal nos últimos dias, explicado com calma. Para quem cuida, de preferência no fim do dia.",
  novos: (n: number) => (n === 0 ? "Nenhum alerta novo" : n === 1 ? "1 alerta novo" : `${n} alertas novos`),
  marcarTodos: "Marcar todos como lidos",
  marcarLido: "Marcar como lido",
  marcarNovo: "Marcar como novo",
  lido: "Lido",
  novo: "Novo",
  desvio: (n: number, direcao: "abaixo" | "acima") => `${n}% ${direcao} da faixa de costume`,
  titulos: {
    passos: { abaixo: "Passos abaixo do normal", acima: "Passos acima do normal" },
    atividade: { abaixo: "Menos tempo em movimento", acima: "Mais tempo em movimento" },
    sono: { abaixo: "Dormiu menos do que costuma", acima: "Dormiu mais do que costuma" },
    batimentos: { abaixo: "Batimentos abaixo do costume", acima: "Batimentos acima do costume" },
  },
  vazio: {
    titulo: "Nenhum alerta por enquanto",
    texto: "Quando um dia fugir do normal desta pessoa, o aviso aparece aqui com a explicação.",
  },
  anunciarLido: "Alerta marcado como lido.",
  anunciarNovo: "Alerta marcado como novo.",
  anunciarTodos: "Todos os alertas foram marcados como lidos.",
};

export const primeiroUso = {
  titulo: "Conectar uma pulseira",
  apoio: "Três passos curtos. Dá para voltar e corrigir a qualquer momento.",
  etapas: ["Quem vai usar", "A pulseira", "Pronto"],
  etapaDe: (n: number, total: number) => `Passo ${n} de ${total}`,
  pessoa: {
    titulo: "Quem vai usar a pulseira?",
    nome: { rotulo: "Nome completo", exemplo: "Ex.: Aparecida Moreira" },
    comoChamar: { rotulo: "Apelido ou forma de tratamento", exemplo: "Ex.: Dona Cida", ajuda: "Como o app vai se referir a essa pessoa, por exemplo Dona Cida ou Seu Jorge. Opcional." },
    idade: { rotulo: "Idade aproximada", exemplo: "Ex.: 78", ajuda: "Opcional." },
    quemAcompanha: { rotulo: "Quem acompanha", exemplo: "Ex.: Marina, filha", ajuda: "Quem vai ler os resumos e os alertas." },
  },
  pulseira: {
    titulo: "Conectar a pulseira",
    passos: [
      "Ligue a pulseira pela chave lateral e espere a tela acender.",
      "Na tela da pulseira, aperte o botão até aparecer o código.",
      "Digite o código abaixo. Ele começa com CT e tem quatro letras ou números depois do traço.",
    ],
    codigo: { rotulo: "Código da pulseira", exemplo: "Ex.: CT-4F2A", ajuda: "Está na tela da pulseira e na etiqueta da caixa." },
    procurar: "Procurar a pulseira",
    procurando: "Procurando a pulseira…",
    encontrada: (codigo: string) => `Pulseira ${codigo} encontrada.`,
  },
  pronto: {
    titulo: "Tudo pronto",
    texto: (nome: string) =>
      `${nome} já está no CareTwin. Os primeiros passos aparecem na próxima sincronização, e a primeira noite chega na manhã seguinte. O normal pessoal fica pronto depois de 5 dias de uso.`,
    botao: "Ir para Hoje",
  },
  erros: {
    resumo: (n: number) => (n === 1 ? "Corrija 1 campo para continuar" : `Corrija ${n} campos para continuar`),
    nome: "Escreva o nome de quem vai usar a pulseira.",
    idade: "Use só números, entre 1 e 120.",
    quemAcompanha: "Escreva quem vai acompanhar, mesmo que seja a própria pessoa.",
    codigo: "O código tem o formato CT-0000, com letras ou números depois do traço.",
    codigoEmUso: "Este código já está ligado a outra pessoa.",
  },
};

export const vazio = {
  semPessoas: {
    titulo: "Vamos conectar a primeira pulseira",
    texto: "Ainda não há ninguém sendo acompanhado. Em três passos curtos, você cadastra a pessoa e liga a pulseira dela.",
    botao: "Conectar uma pulseira",
  },
  semDias: {
    titulo: "Os primeiros dados estão a caminho",
    texto: "A pulseira já está ligada a esta pessoa. Os passos aparecem na próxima sincronização e a primeira noite chega na manhã seguinte.",
    botao: "Sincronizar agora",
  },
};

export const ajustes = {
  titulo: "Ajustes",
  apoio: "Quem você acompanha, como o app aparece para você e os dados de exemplo.",
  perfil: {
    titulo: "Seu perfil",
    nome: { rotulo: "Seu nome", ajuda: "Aparece no topo do app." },
    salvar: "Salvar perfil",
    salvo: "Perfil salvo.",
    erroNome: "Escreva um nome com pelo menos 2 letras.",
  },
  pessoas: {
    titulo: "Pessoas acompanhadas",
    apoio: "Cada pessoa tem a sua pulseira e o seu normal.",
    vazio: "Ninguém cadastrado ainda.",
    adicionar: "Conectar outra pulseira",
    editar: "Editar",
    remover: "Remover",
    pulseira: (codigo: string, bateria: number) => `Pulseira ${codigo}, bateria em ${bateria}%`,
    semPulseira: "Sem pulseira ligada",
    acompanhadaPor: (nome: string) => `Quem acompanha: ${nome}`,
    anos: (n: number) => `${n} anos`,
    confirmarRemover: {
      titulo: (nome: string) => `Remover ${nome}?`,
      texto: "A pulseira, os dias registrados e os alertas desta pessoa saem junto. Não dá para desfazer.",
      confirmar: "Remover pessoa",
    },
    editarTitulo: (nome: string) => `Editar ${nome}`,
    salvo: "Dados da pessoa salvos.",
    removido: "Pessoa removida.",
  },
  aparencia: {
    titulo: "Aparência",
    tema: { rotulo: "Tema", claro: "Claro", escuro: "Escuro", sistema: "Igual ao aparelho" },
    texto: { rotulo: "Tamanho do texto", padrao: "Padrão", grande: "Grande" },
    ajuda: "O texto grande aumenta tudo no app, inclusive botões e gráficos.",
  },
  exemplos: {
    titulo: "Dados de exemplo",
    apoio: (pessoas: number, dias: number, alertas: number) =>
      `Agora há ${plural(pessoas, "pessoa", "pessoas")}, ${plural(dias, "dia registrado", "dias registrados")} e ${plural(alertas, "alerta", "alertas")} neste navegador.`,
    restaurar: "Restaurar os exemplos",
    apagar: "Apagar tudo",
    confirmarRestaurar: {
      titulo: "Restaurar os dados de exemplo?",
      texto: "Tudo o que está neste navegador volta a ser Dona Cida e Seu Jorge, com 21 dias de exemplo.",
      confirmar: "Restaurar",
    },
    confirmarApagar: {
      titulo: "Apagar todos os dados?",
      texto: "Pessoas, pulseiras, dias e alertas saem deste navegador. Dá para restaurar os exemplos depois.",
      confirmar: "Apagar tudo",
    },
    restaurados: "Exemplos restaurados.",
    apagados: "Todos os dados foram apagados.",
  },
  sessao: {
    titulo: "Sessão",
    texto: (nome: string) => `Você entrou como ${nome}. A sessão fica só neste navegador.`,
  },
};
