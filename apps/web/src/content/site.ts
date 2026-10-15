/**
 * TODA a copy do CareTwin mora aqui.
 *
 * Nenhum texto visível fica solto dentro de componente. Mudar uma frase custa
 * uma linha neste arquivo, e não uma varredura no projeto inteiro.
 *
 * O tom vale pra qualquer frase nova: português do dia a dia, calmo, sem termo
 * clínico, sem urgência e sem diagnóstico. O CareTwin conta o que mudou em
 * relação ao normal de cada pessoa e, no máximo, sugere observar ou conversar.
 */

export const marca = {
  nome: "CareTwin",
  tagline: "O dia de quem você ama, comparado com o normal de cada um",
  descricaoCurta:
    "Uma pulseira discreta aprende o normal de cada pessoa e conta, em palavras simples, quando o dia muda.",
}

export const landing = {
  /** Barra fixa do topo do site. Os `href` com `#` apontam para as dobras. */
  cabecalho: {
    navegacao: "Navegação da página",
    irParaInicio: "Ir para o início",
    entrar: "Entrar",
    comoUsar: "Como usar",
    links: [
      { rotulo: "O normal de cada um", href: "/#normal-de-cada-um" },
      { rotulo: "Como funciona", href: "/#como-funciona" },
    ],
  },

  /** Dobra 1: a abertura */
  hero: {
    eyebrow: "Acompanhamento gentil",
    titulo: "Perceba a tempo quando o dia de quem você ama muda.",
    subtitulo:
      "A pulseira aprende o jeito de cada pessoa e conta, em palavras simples, quando os passos, o sono ou os batimentos fogem do de sempre. Sem meta igual para todo mundo e sem susto.",
    ctaPrimario: "Entrar no CareTwin",
    ctaSecundario: "Ver como funciona",
    /** Linha honesta embaixo dos botões. O app não é vendido e não tem número de uso pra contar. */
    provaSocial: "Projeto acadêmico. Os dados que aparecem são de pessoas inventadas.",
  },

  /**
   * A prévia do app na abertura, montada em HTML. Os números vêm dos dados de
   * exemplo; aqui moram só os rótulos.
   *
   * A prévia é decoração (o mesmo conteúdo está escrito na dobra), então ela
   * fica fora do leitor de tela.
   */
  mockup: {
    endereco: "caretwin.app/app/painel",
    titulo: "Painel",
    periodo: "Hoje",
    passos: "Passos até agora",
    pulseira: "Pulseira",
    bateria: "Bateria",
    sincronizou: "Sincronizou",
    semana: "Últimos 7 dias",
    situacao: {
      abaixo: "Abaixo do normal",
      dentro: "Dentro do normal",
      acima: "Acima do normal",
      aprendendo: "Aprendendo o normal",
    },
  },

  /** Dobra 2, a viva: o normal de uma pessoa de exemplo, desenhado com os dados do app. */
  normalDeCadaUm: {
    titulo: "Um dia comum para uma pessoa é um dia diferente para outra",
    subtitulo:
      "Em vez de cobrar a mesma meta de todo mundo, o CareTwin compara cada dia com a semana anterior da própria pessoa. É assim que uma mudança pequena aparece cedo, antes de virar rotina.",
    rotuloGrafico: "Passos de {nome} nos últimos 7 dias, com a faixa do normal dela",
    faixa: "Faixa do normal de {nome}",
    foraDoNormal: "Fora do normal",
    dentroDoNormal: "Dentro do normal",
    leitura:
      "Para {nome}, o normal fica entre {baixo} e {alto} passos por dia. Nos dias marcados, ela andou menos que isso, e o CareTwin avisou quem acompanha.",
    numeros: "Os números do gráfico",
    passos: "passos",
  },

  /** Dobra 3: o que a pessoa ganha, um item por benefício */
  beneficios: {
    titulo: "O que muda no seu dia",
    itens: [
      {
        icone: "passos",
        titulo: "O seu normal, não o dos outros",
        texto: "Você vê como foi o seu dia comparado com o seu jeito de sempre, e não com a meta de um desconhecido.",
      },
      {
        icone: "escrever",
        titulo: "O que mudou, em palavras",
        texto: "Quando algo sai do de sempre, o CareTwin explica em frases simples, sem número complicado.",
      },
      {
        icone: "alertas",
        titulo: "Quem cuida percebe cedo",
        texto: "A família vê quando algo sai do seu padrão, sem você precisar ficar explicando.",
      },
      {
        icone: "batimentos",
        titulo: "Sono e batimentos juntos",
        texto: "A noite e as medições ficam num lugar só, sem susto e sem cara de exame.",
      },
    ],
  },

  /** Dobra 4: o percurso do dia, um passo por momento */
  comoFunciona: {
    titulo: "Do acordar ao fim do dia, sem precisar perguntar",
    subtitulo: "A pulseira faz a parte chata. Cada pessoa abre o app só na hora em que ele ajuda.",
    passos: [
      {
        numero: "01",
        titulo: "Primeiro, a pulseira e o perfil",
        texto: "Um passo a passo curto conecta a pulseira e cria o perfil. Depois de alguns dias, o CareTwin já conhece o normal da pessoa.",
      },
      {
        numero: "02",
        titulo: "De manhã, como foi a noite",
        texto: "Ao acordar, a pessoa vê quanto dormiu, quantas vezes acordou e se a pulseira já mandou os dados.",
      },
      {
        numero: "03",
        titulo: "Durante o dia, os passos",
        texto: "Os passos de hoje aparecem ao lado do normal para este horário, junto com a bateria da pulseira.",
      },
      {
        numero: "04",
        titulo: "Quando quiser, os batimentos",
        texto: "Uma medição guiada de doze segundos, guardada no histórico com a faixa de costume da pessoa.",
      },
      {
        numero: "05",
        titulo: "À noite, o resumo para quem cuida",
        texto: "Quem acompanha lê um resumo escrito do dia e vê se houve algum alerta de mudança.",
      },
    ],
  },

  /**
   * Dobra guardada: o CareTwin não é vendido, então não existe preço nem plano.
   * O arquivo `planos.tsx` continua no projeto, sem ninguém importar, e estas
   * chaves ficam vazias de propósito: vazio aqui é reserva, e não peça faltando.
   */
  precos: {
    titulo: "",
    subtitulo: "",
    selo: "",
    planos: [] as Array<{
      nome: string
      preco: string
      periodo: string
      descricao: string
      recursos: string[]
      cta: string
      destaque: boolean
    }>,
  },

  /** Dobra guardada, pelo mesmo motivo: o site não apresenta time nem sócios. */
  time: {
    titulo: "",
    subtitulo: "",
    pessoas: [] as Array<{ nome: string; cargo: string; bio: string; iniciais: string }>,
  },

  rodape: {
    texto: "Projeto acadêmico da disciplina UPX, Engenharia da Computação. Nenhum dado sai deste computador.",
    navegacao: "Links do rodapé",
    links: [
      { rotulo: "Como usar", href: "/como-usar" },
      { rotulo: "Entrar", href: "/entrar" },
    ],
  },
}

/** Textos de dentro do app. O rótulo do menu e o endereço falam a mesma palavra. */
export const sistema = {
  nav: [
    { rotulo: "Painel", href: "/app/painel", icone: "painel" },
    { rotulo: "Sono", href: "/app/sono", icone: "sono" },
    { rotulo: "Batimentos", href: "/app/batimentos", icone: "batimentos" },
    { rotulo: "Alertas", href: "/app/alertas", icone: "alertas", contaNovos: true },
    // Só aparece para quem entrou com conta: sem conta não existe família.
    { rotulo: "Família", href: "/app/familia", icone: "familia", soConta: true },
    { rotulo: "Configurações", href: "/app/configuracoes", icone: "settings" },
  ],

  /**
   * Textos da casca (menu, topo, carregamento). A maioria vira nome acessível
   * de botão só-ícone: se apagar, o leitor de tela fica sem saber o que o
   * botão faz.
   */
  casca: {
    navegacao: "Navegação principal",
    abrirMenu: "Abrir menu",
    fecharMenu: "Fechar menu",
    pularParaConteudo: "Pular para o conteúdo",
    carregando: "Carregando o CareTwin",
    sair: "Sair",
    pessoaNaTela: "Pessoa acompanhada",
    conectarOutra: "Conectar outra pulseira",
    alertasNovos: ["novo", "novos"] as const,
  },

  /** Os cadastros, com o artigo junto, pras frases automáticas saírem certas. */
  cadastros: {
    pessoa: { singular: "pessoa", plural: "pessoas", artigo: "a" },
    pulseira: { singular: "pulseira", plural: "pulseiras", artigo: "a" },
    dia: { singular: "dia registrado", plural: "dias registrados", artigo: "o" },
    alerta: { singular: "alerta", plural: "alertas", artigo: "o" },
  },

  /** Como cada situação é dita. Sempre com ícone ao lado, nunca só a cor. */
  situacoes: {
    abaixo: "Abaixo do normal",
    dentro: "Dentro do normal",
    acima: "Acima do normal",
    aprendendo: "Aprendendo o normal",
  },

  metricas: {
    passos: { nome: "Passos", unidade: "passos", icone: "passos" },
    sono: { nome: "Sono", unidade: "de sono", icone: "sono" },
    batimentos: { nome: "Batimentos", unidade: "por minuto", icone: "batimentos" },
  },

  /** Peças repetidas em mais de uma tela. */
  comum: {
    saudacao: { manha: "Bom dia", tarde: "Boa tarde", noite: "Boa noite", comNome: "{saudacao}, {nome}" },
    faixaDeCostume: "Faixa do normal",
    foraDoNormal: "Fora do normal",
    hoje: "Hoje",
    verNumeros: "Ver os números do gráfico",
    mil: "mil",
    semDado: "Sem dado da pulseira",
    /** Palavras que viram plural sozinhas nas frases automáticas. */
    contagens: {
      dia: ["dia", "dias"] as const,
      passo: ["passo", "passos"] as const,
      alerta: ["alerta novo", "alertas novos"] as const,
    },
    aprendendo: {
      titulo: "O CareTwin ainda está conhecendo {nome}",
      texto:
        "Com {feitos} de {total} dias de pulseira, ainda não dá pra dizer o que é normal. Faltam {faltam}. Até lá, os números aparecem sem comparação.",
    },
    semPessoa: {
      titulo: "Nenhuma pulseira conectada ainda",
      texto: "Conecte a primeira pulseira e crie o perfil de quem vai usar. Leva menos de dois minutos.",
      acao: "Conectar a pulseira",
    },
    esperandoDados: {
      titulo: "Os primeiros dados estão a caminho",
      texto:
        "A pulseira de {nome} está conectada e ainda não mandou nada. Na pulseira de verdade isso acontece sozinho; aqui dá pra simular a primeira sincronização.",
      textoConta:
        "A pulseira de {nome} está ligada e ainda não mandou nada. Os dados aparecem aqui sozinhos assim que ela sincronizar.",
      acao: "Simular a primeira sincronização",
      feito: "Pulseira sincronizada agora.",
      verFamilia: "Ver a família",
    },
    /** O que quem entrou com conta vê antes de ter uma pessoa na tela. */
    conta: {
      semVinculo: {
        titulo: "Ligue a primeira pulseira",
        texto:
          "Digite o código impresso atrás da pulseira. Se ela já tiver família, quem administra recebe o seu pedido para entrar.",
        acao: "Ligar uma pulseira",
      },
      esperando: {
        titulo: "Seu pedido está esperando",
        texto: "Quem administra a família da pulseira precisa aprovar. Assim que aprovar, a pessoa aparece aqui.",
      },
      outra: "Ligar outra pulseira",
      falhou: {
        titulo: "Não deu para carregar a sua família agora",
        texto: "Confira a internet e tente de novo em alguns instantes.",
        acao: "Tentar de novo",
      },
    },
    pulseira: {
      titulo: "Pulseira {codigo}",
      bateria: "Bateria",
      bateriaBaixa: "Hora de carregar",
      sincronizou: "Última atualização",
      nunca: "Ainda não sincronizou",
      atrasada: "Faz um tempo que não chega dado. Vale conferir se a pulseira está no pulso e perto do celular.",
      emDia: "Dados em dia",
    },
  },

  /** Painel (`/app/painel`): a tela que abre o app, o dia de hoje contra o normal. */
  painel: {
    titulo: "Painel",
    descricao: "O dia de {nome} comparado com o próprio normal, e não com a meta dos outros.",
    descricaoPropria: "O seu dia comparado com o seu próprio normal, e não com a meta dos outros.",
    passos: {
      titulo: "Passos até agora",
      normalAteAgora: "O normal até este horário: {baixo} a {alto}",
      normalDoDia: "Num dia inteiro, o normal fica entre {baixo} e {alto}.",
      semPassos: "Os passos de hoje ainda não chegaram.",
      faixa: "Onde os passos de hoje ficam em relação ao normal até este horário",
    },
    grafico: {
      titulo: "Os últimos 14 dias",
      descricao: "Cada barra é um dia inteiro de passos. A faixa clara é o normal daquele dia.",
      rotulo: "Passos por dia nos últimos 14 dias, com a faixa do normal",
      hojeParcial: "Hoje ainda não terminou",
    },
  },

  /** Sono (`/app/sono`): o momento de manhã, ao acordar. */
  sono: {
    titulo: "Sono",
    descricao: "Como foi a noite de {nome} e se a pulseira já mandou os dados.",
    noite: {
      titulo: "A noite de {data}",
      dormiu: "Dormiu",
      deitou: "Pegou no sono",
      levantou: "Acordou",
      despertares: "Acordou no meio",
      vezes: { uma: "1 vez", varias: "{n} vezes", nenhuma: "Nenhuma vez" },
      normal: "Costuma dormir entre {baixo} e {alto}.",
      estimativa:
        "É uma estimativa pelo movimento do pulso, como as pulseiras comuns fazem. Não é exame de sono.",
      chegando: "A noite de hoje ainda está chegando. Aqui aparece a última noite completa.",
      semNoite: "Nenhuma noite completa chegou da pulseira ainda.",
    },
    movimento: {
      titulo: "O movimento durante a noite",
      descricao: "Barras baixas são o corpo quieto. A área clara é o tempo que o CareTwin estima de sono.",
      rotulo: "Movimento por intervalos de 10 minutos, das 20h às 10h",
      dormindo: "Tempo de sono estimado",
      movimento: "Movimento",
    },
    historico: {
      titulo: "As últimas 14 noites",
      descricao: "Cada barra é uma noite. A faixa clara é o normal daquela noite.",
      rotulo: "Horas de sono estimadas nas últimas 14 noites, com a faixa do normal",
    },
  },

  /** Batimentos (`/app/batimentos`): medir quando quiser e ver o histórico. */
  batimentos: {
    titulo: "Batimentos",
    descricao: "Uma medição quando {nome} quiser, guardada com a faixa de costume.",
    medir: {
      titulo: "Medir agora",
      instrucao: "Sente, apoie o braço e deixe a pulseira encostada no pulso. São só {segundos} segundos.",
      comecar: "Começar a medição",
      medindo: "Medindo. Fique com o braço parado",
      faltam: "Faltam {n} segundos",
      resultado: "batimentos por minuto",
      guardada: "Medição guardada no histórico de hoje.",
      deNovo: "Medir de novo",
      cancelar: "Cancelar",
      cancelada: "Medição cancelada.",
      costume: "Costuma ficar entre {baixo} e {alto} por minuto.",
      simulada:
        "Nesta versão a medição é simulada. Com a pulseira de verdade, o número vem do sensor do pulso.",
    },
    aviso:
      "É uma medida para acompanhar o dia a dia, e não um aparelho médico. Se não estiver se sentindo bem, procure atendimento.",
    historico: {
      titulo: "Histórico de medições",
      descricao: "As medições mais recentes primeiro.",
      grafico: "Os últimos 14 dias",
      rotulo: "Batimentos das medições dos últimos 14 dias, com a faixa de costume",
      vazio: "Nenhuma medição ainda. A primeira aparece aqui assim que terminar.",
      porMinuto: "por minuto",
    },
  },

  /** Alertas (`/app/alertas`): o momento de quem cuida, à noite. */
  alertas: {
    titulo: "Alertas",
    descricao: "O resumo do dia de {nome} e o que saiu do normal, pra ler com calma.",
    resumo: {
      titulo: "Resumo do dia",
      descricao: "Um parágrafo curto, em palavras simples, sobre a noite e o dia até agora.",
      escrever: "Escrever o resumo do dia",
      outro: "Escrever de outro jeito",
      escrevendo: "Escrevendo",
    },
    ia: {
      aviso:
        "A IA não está rodando de verdade: este é um texto de exemplo, montado com os números reais do dia. Para ligar, falta a chave de API.",
      como: "Como",
      modal: {
        titulo: "Como ligar a IA de verdade",
        descricao: "São três caminhos curtos. Os dois primeiros pedem uma chave; o terceiro roda no seu computador.",
        passos: [
          {
            titulo: "Uma chave na OpenAI",
            texto: "Crie uma conta e gere uma chave de API no painel da OpenAI.",
            link: { rotulo: "Abrir o painel da OpenAI", href: "https://platform.openai.com" },
          },
          {
            titulo: "Ou uma chave na Anthropic",
            texto: "O mesmo caminho, no console da Anthropic.",
            link: { rotulo: "Abrir o console da Anthropic", href: "https://console.anthropic.com" },
          },
          {
            titulo: "Ou a IA local, sem chave",
            texto:
              "O plano do CareTwin é um modelo local (Ollama) rodando no computador da API. A API do CareTwin chama o modelo e o texto chega aqui pronto, sem chave e sem dado saindo do computador.",
          },
          {
            titulo: "Peça ao seu assistente pra ligar com segurança",
            texto:
              "A chave mora numa variável de ambiente no arquivo .env.local, documentada sem valor no .env.example. A chamada sai de uma rota de servidor em src/app/api. A chave nunca é escrita no código do navegador e nunca vai para o repositório.",
          },
        ],
        fechar: "Entendi",
      },
    },
    lista: {
      titulo: "Alertas de mudança",
      novos: { um: "1 alerta novo", varios: "{n} alertas novos", nenhum: "Nenhum alerta novo" },
      ontem: "Ontem",
      marcarTodos: "Marcar todos como lidos",
      marcarLido: "Marcar como lido",
      marcarNovo: "Marcar como novo",
      novo: "Novo",
      lidoAviso: "Alerta marcado como lido.",
      novoAviso: "Alerta marcado como novo.",
      todosAviso: "Todos os alertas foram marcados como lidos.",
      titulos: {
        passos: { abaixo: "Menos passos que o normal", acima: "Mais passos que o normal" },
        sono: { abaixo: "Menos sono que o normal", acima: "Mais sono que o normal" },
        batimentos: { abaixo: "Batimentos abaixo do costume", acima: "Batimentos acima do costume" },
      },
      desvio: "{n}% {lado} do normal",
      lado: { abaixo: "abaixo", acima: "acima" },
      escritoPelaIa: "Texto de exemplo escrito pela IA",
      vazio: {
        titulo: "Nenhuma mudança por aqui",
        texto: "Os dias de {nome} seguem parecidos com o normal. Quando algo mudar por dois dias, o alerta aparece aqui.",
      },
    },
  },

  /** Primeiro uso (`/app/primeiro-uso`): conectar a pulseira e criar o perfil. */
  primeiroUso: {
    titulo: "Conectar uma pulseira",
    descricao: "Três passos curtos. Depois disso, o CareTwin começa a aprender o normal da pessoa.",
    progresso: "Passo {n} de {total}",
    passos: ["A pulseira", "O perfil", "Pronto"],
    pulseira: {
      titulo: "Qual é o código da pulseira?",
      texto: "Ele está impresso atrás da pulseira, no formato CT seguido de quatro letras ou números.",
      rotulo: "Código da pulseira",
      exemplo: "Ex.: CT-7K3P",
      ajuda: "Pode digitar com letras minúsculas, o app acerta sozinho.",
    },
    perfil: {
      titulo: "Quem vai usar a pulseira?",
      texto: "Só o que aparece nas telas. Nada de documento, endereço ou dado de saúde.",
      nome: "Como a família chama essa pessoa",
      exemploNome: "Ex.: Dona Helena",
      ajudaNome: "É o nome que aparece no painel e no resumo do dia.",
      quemAcompanha: "Quem acompanha",
      exemploQuemAcompanha: "Ex.: Paulo, filho",
      ajudaQuemAcompanha: "Pode ser a própria pessoa, se ela se acompanha sozinha.",
    },
    pronto: {
      titulo: "Tudo pronto",
      texto:
        "A pulseira de {nome} está conectada. Nos primeiros {dias} dias o CareTwin só observa: depois disso, cada dia passa a ser comparado com o normal de {nome}.",
      ir: "Ir para o painel",
    },
    avancar: "Continuar",
    voltar: "Voltar",
    concluir: "Conectar a pulseira",
    erros: {
      codigo: "O código tem o formato CT-0000, com quatro letras ou números depois do traço.",
      codigoEmUso: "Esta pulseira já está ligada a outra pessoa.",
      nome: "Escreva como a família chama essa pessoa.",
      quemAcompanha: "Escreva quem acompanha, mesmo que seja a própria pessoa.",
    },

    /**
     * Com conta: o código vai para o servidor, e a pergunta de quem é a
     * pulseira define o papel (a própria pessoa ou quem cuida).
     */
    ligar: {
      titulo: "Ligar uma pulseira",
      descricao:
        "Digite o código e diga de quem é a pulseira. Se ela já tiver família, quem administra recebe o seu pedido.",
      passos: ["A pulseira", "De quem é", "Pronto"],
      dono: {
        titulo: "Esta pulseira é sua ou de alguém que você cuida?",
        texto: "A resposta define o que você vê e o que pode fazer na família desta pulseira.",
        legenda: "De quem é a pulseira",
        acompanhada: { rotulo: "É minha", ajuda: "Eu uso a pulseira e quero ver o meu dia." },
        cuidador: { rotulo: "É de alguém que eu cuido", ajuda: "Eu acompanho a pessoa que usa a pulseira." },
        erro: "Escolha uma das duas opções.",
      },
      nome: {
        titulo: "Esta pulseira ainda não tem família",
        texto:
          "Você vai administrar a família: aprova quem pedir para entrar e pode remover quem cuida. Falta só o nome.",
        rotuloPropria: "Como a família chama você",
        rotuloCuidador: "Como a família chama essa pessoa",
        exemplo: "Ex.: Dona Helena",
        ajuda: "É o nome que aparece no painel e no resumo do dia.",
        erro: "Escreva o nome, com pelo menos duas letras.",
      },
      continuar: "Continuar",
      enviar: "Ligar a pulseira",
      pronto: {
        titulo: "Tudo pronto",
        textoCuidador:
          "A pulseira de {nome} está ligada. Nos primeiros {dias} dias o CareTwin só observa: depois disso, cada dia passa a ser comparado com o normal de {nome}.",
        textoPropria:
          "A sua pulseira está ligada. Nos primeiros {dias} dias o CareTwin só observa: depois disso, cada dia passa a ser comparado com o seu normal.",
        ir: "Ir para o painel",
      },
      pedido: {
        titulo: "Pedido enviado",
        texto:
          "A pulseira {codigo} já tem família. Quem administra precisa aprovar o seu pedido, e a pessoa aparece no app assim que isso acontecer.",
        ir: "Voltar para o início",
      },
      erros: {
        codigo_inexistente: "Não existe pulseira com esse código. Confira as letras e os números atrás da pulseira.",
        ja_tem_vinculo: "Você já faz parte desta família ou já pediu para entrar.",
        ja_tem_acompanhada:
          "Esta pulseira já tem uma conta como a própria pessoa. Se você cuida de quem usa, escolha a outra opção.",
        pulseira_em_encerramento:
          "Esta pulseira está travada porque o acompanhamento foi encerrado. Ela fica livre de novo em {data}.",
        invalido: "Confira o código, no formato CT-0000.",
      },
    },
  },

  /** Família (`/app/familia`): quem acompanha a pessoa, os pedidos, sair e encerrar. */
  familia: {
    titulo: "Família",
    descricao: "Quem acompanha {nome}, os pedidos para entrar e a sua participação.",
    carregando: "Carregando a família",
    semConta: {
      titulo: "A família aparece com a sua conta",
      texto: "Entre com e-mail e senha para ver quem acompanha cada pessoa e responder pedidos para entrar.",
    },
    papeis: { cuidador: "Cuida", acompanhada: "A própria pessoa" },
    papeisNoPedido: { cuidador: "quem cuida", acompanhada: "a própria pessoa" },
    voce: "você",
    administra: "Administra",
    desde: "Desde {data}",
    membros: {
      titulo: "Quem acompanha {nome}",
      descricao: "Todas as contas que veem os dados de {nome}.",
      remover: "Remover",
      rotuloRemover: "Remover {nome} da família",
      confirmar: {
        titulo: "Remover {nome} da família?",
        texto:
          "{nome} deixa de ver os dados de {pessoa}. Os dias e os alertas continuam. Se precisar, {nome} pode pedir para entrar de novo.",
        confirmar: "Remover",
      },
      removido: "{nome} saiu da família.",
    },
    pedidos: {
      titulo: "Pedidos para entrar",
      descricao: "Quem digitou o código da pulseira de {nome} e espera a sua resposta.",
      vazio: "Nenhum pedido esperando.",
      pediuComo: "Pediu para entrar como {papel}, {quando}.",
      aprovar: "Aprovar",
      recusar: "Recusar",
      rotuloAprovar: "Aprovar o pedido de {nome}",
      rotuloRecusar: "Recusar o pedido de {nome}",
      aprovado: "{nome} agora faz parte da família.",
      recusado: "O pedido de {nome} foi recusado.",
    },
    sair: {
      titulo: "Sair da família",
      texto: "Você deixa de ver os dados de {nome}. Os dias e os alertas continuam para quem fica.",
      acao: "Sair da família de {nome}",
      confirmar: {
        titulo: "Sair da família de {nome}?",
        texto: "Para voltar, você precisa digitar o código da pulseira de novo e esperar alguém aprovar.",
        confirmar: "Sair",
      },
    },
    encerrar: {
      titulo: "Encerrar o acompanhamento",
      texto:
        "Você é a última pessoa na família de {nome}. Encerrar tira {nome} de todas as telas e trava a pulseira. Durante {dias} dias, dá para recuperar tudo. Depois disso, os dias e os alertas são apagados de vez e a pulseira fica livre.",
      instrucao: "Para confirmar, escreva esta frase:",
      rotulo: "Frase de confirmação",
      ajuda: "Pode escrever sem acento e sem ponto final.",
      acao: "Encerrar o acompanhamento",
    },
    pendencias: {
      pedidosTitulo: "Seus pedidos esperando",
      pedidoItem: "Pulseira {codigo}, como {papel}, {quando}.",
      desistir: "Desistir",
      rotuloDesistir: "Desistir do pedido da pulseira {codigo}",
      desistiu: "Pedido da pulseira {codigo} retirado.",
      encerradasTitulo: "Acompanhamentos encerrados",
      encerradaItem: "Dá para recuperar até {data}.",
      recuperar: "Recuperar",
      rotuloRecuperar: "Recuperar o acompanhamento de {nome}",
      recuperado: "{nome} voltou para o app.",
    },
    erros: {
      ultimo_membro: "Você é a última pessoa da família. Para sair, encerre o acompanhamento.",
      outros_membros: "Ainda há outras pessoas na família. Nesse caso, o caminho é sair.",
      confirmacao_errada: "A frase não confere. Escreva exatamente como aparece acima.",
      so_admin: "Só quem administra a família pode fazer isso.",
      nao_remove_acompanhada: "A própria pessoa não pode ser removida por outra conta.",
      use_sair: "Para sair da família, use a opção de sair.",
      ja_tem_acompanhada:
        "Esta pessoa já tem uma conta como a própria pessoa. Recuse este pedido, ou peça para a conta entrar como quem cuida.",
      mudou: "Isso mudou enquanto a tela estava aberta. A lista foi atualizada.",
    },
  },

  /** Erros que qualquer chamada ao servidor pode dar. */
  erros: {
    geral: "Não deu certo agora. Tente de novo em alguns minutos.",
    semRede: "Sem conexão com a internet. Confira a rede e tente de novo.",
    semConta: "Esta parte do app precisa de uma conta com e-mail e senha.",
    desligado: "O banco não está ligado neste ambiente.",
  },

  /**
   * Microcopy dos primitivos de UI (botão fechar, busca, confirmação…).
   *
   * Fica aqui pelo mesmo motivo do resto: nenhum texto solto dentro de
   * componente. Trocar "Cancelar" por "Voltar" é uma linha, não uma varredura.
   */
  acoes: {
    fechar: "Fechar",
    cancelar: "Cancelar",
    confirmar: "Confirmar",
    limpar: "Limpar",
    buscar: "Buscar",
    selecione: "Selecione…",
  },

  /**
   * Configurações: a bancada do projeto. Os dados de exemplo e o perfil de
   * quem entrou.
   */
  configuracoes: {
    titulo: "Configurações",
    descricao: "Os dados de exemplo e o seu perfil.",
    descricaoConta: "A sua conta e o tour do app.",

    dados: {
      titulo: "Dados de exemplo",
      descricao:
        "As pessoas e os dias que aparecem no app são inventados e ficam só neste navegador. Estes dois botões mexem em tudo de uma vez.",
      restaurar: "Restaurar exemplos",
      limpar: "Limpar tudo",
      dicaVazios:
        "Limpar tudo deixa o app como no primeiro dia de uso, sem nenhuma pulseira. É assim que dá pra ver o passo a passo de conectar a pulseira e as telas vazias.",
      confirmarRestaurar: {
        titulo: "Restaurar os dados de exemplo?",
        texto: "As pessoas, os dias e os alertas voltam a ser os de exemplo. O que foi cadastrado ou medido aqui some.",
        confirmar: "Restaurar",
      },
      confirmarLimpar: {
        titulo: "Apagar todos os dados?",
        texto:
          "Pessoas, pulseiras, dias registrados e alertas ficam vazios. Dá para trazer os exemplos de volta depois, mas o que foi cadastrado aqui não volta.",
        confirmar: "Apagar tudo",
      },
    },

    perfil: {
      titulo: "Perfil",
      descricao:
        "O nome que aparece no topo do app. Nesta versão não existe conta nem servidor por trás: é uma sessão guardada neste navegador.",
      descricaoConta:
        "A conta que você usa para entrar. Para trocar a senha, use a opção de esqueci minha senha na tela de entrar.",
      nome: "Nome",
      email: "E-mail",
      ajudaEmail: "Fica só neste navegador. Nenhuma mensagem é enviada.",
      salvar: "Salvar alterações",
      salvo: "Perfil atualizado.",
      sair: "Sair da sessão",
      erros: {
        nome: "Escreva pelo menos duas letras.",
        email: "Escreva um e-mail válido, como voce@exemplo.com.",
      },
    },
  },
}

/**
 * A porta de entrada (`/entrar`).
 *
 * O passo a passo do Google mora aqui, e não dentro do modal: trocar de
 * provedor, ou mudar uma frase do tutorial, é editar texto, não abrir componente.
 */
export const entrada = {
  voltar: "Voltar para o site",

  titulo: "Veja como está o dia de hoje",
  subtitulo: "Entre para acompanhar o seu dia ou o de quem você cuida.",

  google: {
    botao: "Continuar com Google",
    /** Fica abaixo do botão enquanto o login com Google não está ligado. */
    ajuda: "Ainda não está conectado. O botão mostra o passo a passo para ligar.",
    /** E este quando ele já está ligado: aí o botão faz login de verdade. */
    ajudaLigado: "Você vai para o Google escolher a conta e volta para cá já dentro do app.",

    /**
     * O que aparece quando uma volta do Google não deu certo. A chave é o
     * `?google=` do endereço, escrito pelas rotas de `src/app/api/auth`.
     * Motivo que não estiver nesta lista não vira mensagem nenhuma: o endereço
     * é editável por qualquer pessoa, e texto vindo de lá não entra na tela.
     */
    avisos: {
      cancelado: "Você fechou a tela do Google antes de escolher a conta. Pode tentar de novo.",
      expirado: "A tentativa demorou demais e expirou por segurança. Clique de novo no botão.",
      incompleto: "O Google devolveu uma resposta incompleta. Tente mais uma vez.",
      falhou:
        "O Google recusou as credenciais deste app. Confira o Client ID, o Client Secret e o endereço de retorno cadastrado.",
      indisponivel:
        "O login com Google ainda não está ligado neste app. Use o nome e a senha logo abaixo por enquanto.",
    },
  },

  separador: "ou",

  campos: {
    usuario: {
      rotulo: "Nome ou e-mail",
      placeholder: "Ex.: marina@email.com",
      ajuda: "É assim que você aparece no topo do app.",
      erro: "Escreva seu nome ou seu e-mail.",
    },
    senha: {
      rotulo: "Senha",
      ajuda: "Nesta versão a senha não é conferida nem guardada em lugar nenhum.",
      erro: "Escreva a senha.",
    },
  },

  entrar: "Entrar",

  /** A linha honesta embaixo do formulário. A explicação completa mora na página Como usar. */
  aviso: {
    texto: "A senha não sai deste navegador e nada é enviado para servidor nenhum. Ligar o login de verdade é o próximo passo, explicado em",
    link: "Como usar",
  },

  /**
   * O login de verdade, com a conta guardada no Supabase Auth. Toma o lugar do
   * formulário simulado quando SUPABASE_URL, a chave publicável e o AUTH_SECRET
   * estão no ambiente.
   */
  conta: {
    entrar: {
      botao: "Entrar",
    },
    criar: {
      titulo: "Criar uma conta",
      texto: "Use um e-mail que você abre sempre. Vamos mandar um link para confirmar que ele é seu.",
      botao: "Criar conta",
      enviado:
        "Pronto. Mandamos um link de confirmação para o seu e-mail. Abra o link e depois entre por aqui com o e-mail e a senha.",
    },
    recuperar: {
      titulo: "Esqueci minha senha",
      texto: "Escreva o e-mail da sua conta. Se ele estiver cadastrado, chega um link para criar uma senha nova.",
      botao: "Mandar o link",
      enviado:
        "Se existir uma conta com esse e-mail, o link para criar uma senha nova já está a caminho. Confira também a caixa de spam.",
    },
    trocar: {
      esqueci: "Esqueci minha senha",
      criar: "Ainda não tenho conta",
      jaTenho: "Já tenho conta",
      voltar: "Voltar para entrar",
    },
    campos: {
      nome: {
        rotulo: "Seu nome",
        placeholder: "Ex.: Marina Alves",
        ajuda: "É assim que você aparece no topo do app.",
        erro: "Escreva seu nome, com pelo menos 2 letras.",
      },
      email: {
        rotulo: "E-mail",
        placeholder: "Ex.: marina@email.com",
        erro: "Escreva um e-mail completo, como marina@email.com.",
      },
      senha: {
        rotulo: "Senha",
        ajudaNova: "Pelo menos 8 caracteres.",
        erro: "Escreva a senha.",
        erroCurta: "A senha precisa ter pelo menos 8 caracteres.",
      },
    },

    /**
     * Por que não deu certo. A chave é o `motivo` que as rotas de
     * `src/app/api/auth/conta` devolvem; motivo fora da lista vira `falhou`.
     */
    motivos: {
      credenciais: "E-mail ou senha não conferem. Confira os dois e tente de novo.",
      nao_confirmado: "Falta confirmar o e-mail. Abra o link que mandamos quando você criou a conta.",
      senha_fraca: "Essa senha é fácil de adivinhar. Escolha uma mais longa, misturando letras e números.",
      senha_igual: "A senha nova precisa ser diferente da anterior.",
      ja_existe: "Já existe uma conta com esse e-mail. Entre com ela ou use Esqueci minha senha.",
      muitas_tentativas: "Foram muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.",
      link_expirado: "Esse link expirou ou já foi usado. Peça um novo em Esqueci minha senha.",
      invalido: "Algum campo veio vazio ou num formato que não reconhecemos. Confira e tente de novo.",
      indisponivel: "O login está fora do ar agora. Tente de novo em alguns minutos.",
      falhou: "Não deu certo desta vez. Tente de novo em alguns minutos.",
    },

    /** Avisos no topo do formulário. `confirmada` vem de `?conta=` no endereço. */
    avisos: {
      confirmada: "E-mail confirmado. Agora é só entrar com o seu e-mail e a senha.",
      linkExpirado:
        "Esse link expirou ou já foi usado. Entre com o e-mail e a senha, ou peça um link novo em Esqueci minha senha.",
    },

    nota: "A senha é conferida pelo Supabase e não fica guardada no app nem neste navegador.",

    novaSenha: {
      titulo: "Crie uma senha nova",
      subtitulo: "Escolha a senha que você vai usar daqui em diante.",
      rotulo: "Senha nova",
      ajuda: "Pelo menos 8 caracteres.",
      repetir: "Repita a senha nova",
      erroDiferente: "As duas senhas precisam ser iguais.",
      botao: "Salvar e entrar",
      carregando: "Conferindo o link do e-mail.",
      semLink: "Esta página só funciona pelo link que chega no seu e-mail. Peça um link novo na tela de entrar.",
      desligado: "O login com e-mail ainda não está ligado neste app.",
      irParaEntrar: "Ir para a tela de entrar",
    },
  },

  modalGoogle: {
    titulo: "Como conectar o Google de verdade",
    descricao:
      "São sete passos no Google Cloud Console. Você faz uma vez, guarda as duas chaves no projeto e o botão passa a funcionar.",

    passos: [
      {
        titulo: "Abra o Google Cloud Console",
        texto:
          "É o painel onde o Google guarda as credenciais dos seus projetos. Entre com a mesma conta que você já usa no dia a dia.",
        link: {
          rotulo: "Abrir o Console do Google",
          href: "https://console.cloud.google.com/apis/credentials",
        },
        codigo: "https://console.cloud.google.com/apis/credentials",
        codigoRotulo: "Endereço",
      },
      {
        titulo: "Crie um projeto",
        texto:
          "No seletor de projetos, no topo da página, escolha “Novo projeto”. O nome é só pra você se achar depois.",
        codigo: "CareTwin",
        codigoRotulo: "Nome sugerido",
      },
      {
        titulo: "Crie um ID do cliente OAuth",
        texto:
          "No menu lateral, siga o caminho abaixo. Se o Google pedir para configurar a tela de consentimento antes, escolha “Externo” e preencha só o nome do app e o seu e-mail de contato.",
        codigo: "Credenciais → Criar credenciais → ID do cliente OAuth",
        codigoRotulo: "Caminho no menu",
      },
      {
        titulo: "Escolha o tipo de aplicativo",
        texto:
          "No campo “Tipo de aplicativo”, selecione a opção abaixo. É ela que libera os dois campos dos próximos passos.",
        codigo: "Aplicativo da Web",
        codigoRotulo: "Tipo de aplicativo",
      },
      {
        titulo: "Autorize o endereço do app",
        texto:
          "Em “Origens JavaScript autorizadas”, clique em “Adicionar URI” e cole o endereço abaixo. É o endereço do app rodando neste computador.",
        codigo: "http://localhost:3000",
        codigoRotulo: "Origens JavaScript autorizadas",
      },
      {
        titulo: "Autorize o endereço de retorno",
        texto:
          "Em “URIs de redirecionamento autorizados”, clique em “Adicionar URI” e cole o endereço abaixo. É para onde o Google devolve a pessoa depois do login, e precisa bater caractere por caractere.",
        codigo: "http://localhost:3000/api/auth/callback/google",
        codigoRotulo: "URIs de redirecionamento autorizados",
      },
      {
        titulo: "Guarde as duas chaves no projeto",
        texto:
          "Ao salvar, o Google mostra o Client ID e o Client Secret. Crie um arquivo chamado .env.local na raiz do projeto e cole as três linhas abaixo, trocando o texto depois do “=” pelos valores que apareceram. A terceira é sua, e não vem do Google: é o segredo que assina a sessão, e pode ser qualquer texto embaralhado com 32 letras ou mais (no terminal, openssl rand -base64 32 gera um). Depois pare o servidor e rode npm run dev de novo.",
        codigo:
          "GOOGLE_CLIENT_ID=cole-aqui-o-seu-client-id\nGOOGLE_CLIENT_SECRET=cole-aqui-o-seu-client-secret\nAUTH_SECRET=cole-aqui-um-texto-aleatorio-longo",
        codigoRotulo: ".env.local",
      },
    ],

    nota: "O .env.local não vai para o Git, e não deve ir. O Client Secret é uma senha: se ele vazar, gere outro no mesmo lugar em que criou.",

    aviso:
      "Assim que as três linhas estiverem no .env.local, este botão passa a fazer login de verdade, sem mexer em código nenhum. Enquanto isso, entre com o nome e a senha.",

    fechar: "Entendi",
    copiar: "Copiar",
    copiado: "Copiado!",
    falhaCopia: "Não deu para copiar automaticamente. Selecione o texto acima e use Ctrl+C (ou Cmd+C).",
  },
}

/**
 * A página Como usar (`/como-usar`): o que o CareTwin já faz, o que ainda falta
 * ligar e onde cada coisa encaixa no projeto.
 */
export const comoUsar = {
  titulo: "Como usar o CareTwin",
  subtitulo:
    "O que este protótipo já faz hoje, o que ainda falta conectar e por onde seguir. Escrito para quem vai mostrar o app e para quem vai continuar o projeto.",
  voltar: "Voltar para o site",
  entrar: "Entrar no app",
  ondeEncaixa: "Onde encaixa",

  hoje: {
    titulo: "O que este app já faz hoje",
    descricao: "Tudo abaixo funciona agora, com pessoas e dias de exemplo guardados neste navegador.",
    itens: [
      { titulo: "O site", texto: "A página de abertura conta o que o CareTwin resolve, com o normal de uma pessoa de exemplo desenhado ao vivo." },
      { titulo: "A tela de entrar", texto: "Nome ou e-mail, senha e o botão do Google com o passo a passo para ligar o login de verdade." },
      { titulo: "Painel", texto: "Durante o dia: os passos de hoje ao lado do normal para este horário, a bateria e a última atualização da pulseira." },
      { titulo: "Sono", texto: "De manhã: quanto a pessoa dormiu, quantas vezes acordou e se a pulseira já mandou a noite." },
      { titulo: "Batimentos", texto: "Quando quiser: uma medição guiada de doze segundos e o histórico com a faixa de costume." },
      { titulo: "Alertas", texto: "À noite, para quem cuida: o resumo escrito do dia e os alertas de mudança, com marcar como lido." },
      { titulo: "Primeiro uso", texto: "O passo a passo para conectar uma pulseira, com a tela de espera até os primeiros dados chegarem." },
      { titulo: "Funciona no celular", texto: "Todas as telas se ajustam a telas pequenas, com botões grandes e texto legível." },
      { titulo: "O visual do CareTwin", texto: "Cores, fonte e cantos saem de um arquivo só, o design-system.json, então mudar o visual do app inteiro é mudar esse arquivo." },
    ],
  },

  conectar: {
    titulo: "O que ainda falta conectar, e onde cada coisa encaixa",
    descricao: "Cada item já tem lugar reservado no projeto. Ligar é preencher esse lugar, não reformar telas.",
    itens: [
      {
        titulo: "API do CareTwin",
        texto: "A pulseira manda os dados para a API própria do projeto. Ligar o app a ela troca os dados de exemplo pelos dados reais da pulseira, sem nenhuma tela mudar.",
        onde: "src/lib/store.ts",
      },
      {
        titulo: "Envio de e-mail",
        texto: "Para mandar o resumo do dia ou um aviso de mudança por e-mail para quem acompanha.",
        onde: ".env.example, grupo do envio de e-mail",
      },
      {
        titulo: "Backend e banco de dados",
        texto: "O banco no Supabase guarda as contas, as pessoas, as pulseiras e quem vê quem. Com a DATABASE_URL no .env.local e as migrações rodadas, quem entra com e-mail e senha vê só a própria família. Sem ela, o app segue com os dados de exemplo neste navegador.",
        onde: "src/lib/banco.ts, src/lib/familia.ts e banco/migracoes",
      },
      {
        titulo: "Login com Google",
        texto: "O caminho inteiro já está montado e desligado: o botão na tela de entrar, o passo a passo dentro dele e as rotas prontas. Colou GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e AUTH_SECRET no .env.local, ligou.",
        onde: "src/lib/google.ts e src/app/api/auth",
      },
      {
        titulo: "A IA que escreve os textos",
        texto: "Para escrever o resumo do dia e os textos dos alertas de verdade. O plano é a IA local (Ollama) chamada pela API; também dá para usar uma chave da OpenAI, que tem grupo próprio no .env.example. A chamada sai sempre de uma rota de servidor, nunca do navegador.",
        onde: "src/app/api e .env.example, grupo OPENAI_API_KEY",
      },
      {
        titulo: "WhatsApp",
        texto: "Para avisar quem acompanha pelo canal que a família realmente lê.",
        onde: ".env.example, grupo do WhatsApp",
      },
      {
        titulo: "Automações",
        texto: "O n8n já está no projeto, com o arquivo pronto para subir e um guia com dois exemplos. É por ele que passam e-mail, WhatsApp, planilha e envio na hora marcada, sem escrever código.",
        onde: "pasta n8n",
      },
      {
        titulo: "Storybook",
        texto: "O catálogo dos componentes do CareTwin, já configurado, com o visual aplicado e auditoria de acessibilidade em cada componente.",
        onde: "pasta .storybook, rode npm run storybook",
      },
    ],
  },

  proximos: {
    titulo: "Os próximos passos",
    itens: [
      "Usar o app com os dados de exemplo por uma semana e anotar o que incomodar.",
      "Ligar o app à API do CareTwin quando ela estiver pronta, trocando os dados de exemplo pelos dados reais da pulseira.",
      "Testar com três a cinco pessoas.",
      "Mostrar o resultado ao professor.",
    ],
  },
}
