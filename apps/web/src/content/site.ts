/*
  Toda a copy do site, da tela de entrar, da casca do app e da página Como usar.
  Regra do projeto: nenhum texto visível fica escrito dentro de componente.
  Para mudar uma frase, é só mudar aqui.
*/

export const marca = {
  nome: "CareTwin",
  descricao: "Acompanhamento pessoal de saúde com uma pulseira discreta, que compara cada dia com o normal da própria pessoa.",
  projeto: "Projeto da disciplina UPX, Engenharia da Computação, UniFacens, 2026.",
};

export const rotas = {
  site: "/",
  comoFunciona: "/#como-funciona",
  entrar: "/entrar",
  comoUsar: "/como-usar",
  app: "/app",
  hoje: "/app/hoje",
  sono: "/app/sono",
  batimentos: "/app/batimentos",
  alertas: "/app/alertas",
  ajustes: "/app/ajustes",
  primeiroUso: "/app/primeiro-uso",
} as const;

export const site = {
  pularParaConteudo: "Pular para o conteúdo",
  cabecalho: {
    navegacao: "Navegação do site",
    comoFunciona: "Como funciona",
    comoUsar: "Como usar",
    entrar: "Entrar",
    inicio: "CareTwin, página inicial",
  },
  abertura: {
    rotulo: "Acompanhamento pessoal de saúde",
    titulo: "Perceba a tempo quando o dia de quem você ama muda.",
    apoio:
      "Uma pulseira discreta aprende o normal de cada pessoa e conta, em palavras simples, quando os passos, o sono ou os batimentos fogem desse padrão. Sem meta igual para todo mundo e sem susto.",
    botaoPrincipal: "Entrar no CareTwin",
    botaoSecundario: "Ver como funciona",
    nota: "Projeto acadêmico. O CareTwin não é um aparelho médico e não faz diagnóstico.",
  },
  previa: {
    rotuloAcessivel: "Prévia da tela Hoje do CareTwin, com dados de exemplo",
    saudacao: "Bom dia, Marina",
    pessoa: "Dona Cida",
    sincronizou: "Sincronizou há 18 min",
    bateria: "64%",
    passosRotulo: "Passos até agora",
    passosValor: "1.240",
    passosFaixa: "O normal dela neste horário: 1.150 a 1.430",
    situacao: "Dentro do normal",
    sonoRotulo: "Noite",
    sonoValor: "7 h 05",
    sonoFaixa: "Costuma dormir de 6 h 50 a 7 h 30",
    resumoRotulo: "Resumo do dia",
    resumo: "Dormiu bem e começou o dia no ritmo de sempre. Nenhum aviso novo.",
  },
  normal: {
    titulo: "O normal é de cada um",
    apoio:
      "Dez mil passos pode ser pouco para uma pessoa e demais para outra. O CareTwin compara cada dia com os últimos 14 dias da própria pessoa, e é isso que permite perceber cedo uma mudança de verdade.",
    metaIgual: "Meta igual para todo mundo",
    metaIgualValor: "10.000 passos",
    metaIgualLeitura: "Dona Cida aparece sempre como atrasada, mesmo nos dias bons.",
    normalDela: "O normal da Dona Cida",
    normalDelaValor: "3.500 a 4.900 passos",
    normalDelaLeitura: "Quando ela anda 2.300 passos dois dias seguidos, a mudança aparece na hora.",
    legendaGrafico: "Comparação entre uma meta fixa de 10.000 passos e a faixa normal de 3.500 a 4.900 passos da Dona Cida. O dia mais recente, com 2.300 passos, fica abaixo da faixa dela.",
    eixoPassos: "passos por dia",
    hojeRotulo: "Ontem: 2.300",
  },
  comoFunciona: {
    titulo: "Um dia com o CareTwin",
    apoio: "Quatro momentos, do acordar até a hora em que a família confere se está tudo bem.",
    etapas: [
      {
        titulo: "De manhã, a noite contada",
        texto: "Ao acordar, você vê quanto dormiu, quantas vezes acordou e se a pulseira já mandou os dados.",
      },
      {
        titulo: "Durante o dia, o seu ritmo",
        texto: "Os passos aparecem comparados com o que é comum para você neste mesmo horário, e não com o dia inteiro.",
      },
      {
        titulo: "Quando quiser, os batimentos",
        texto: "Um toque pede uma medição e guarda o histórico, com a faixa de costume ao lado.",
      },
      {
        titulo: "À noite, a família por dentro",
        texto: "Quem cuida lê um resumo curto do dia e vê, com calma, se algo saiu do padrão.",
      },
    ],
  },
  exemplo: {
    titulo: "Assim chega um aviso",
    apoio: "Quando algo foge do normal, o CareTwin explica o que mudou com palavras de gente, em vez de mostrar um número solto ou um alarme vermelho.",
    alertaRotulo: "Aviso de ontem",
    alertaTitulo: "Passos abaixo do normal",
    alertaTexto:
      "Dona Cida teve 2.310 passos neste dia. Nos últimos 14 dias, o comum foi entre 3.500 e 4.900 passos. Vale perguntar como foi o dia.",
    alertaDesvio: "34% abaixo da faixa de costume",
    resumoRotulo: "Resumo para quem cuida",
    resumoTexto:
      "Dona Cida teve um dia mais parado do que costuma. Dormiu cerca de 7 h 05, bem no ritmo de sempre. Vale uma ligação tranquila para perguntar como ela está.",
    iaNota: "Resumo escrito por inteligência artificial a partir dos números do dia.",
  },
  beneficios: {
    titulo: "O que muda para quem usa",
    itens: [
      { titulo: "Seu dia, seu normal", texto: "Eu vejo como foi o meu dia comparado com o meu normal, e não com a meta dos outros." },
      { titulo: "Palavras simples", texto: "Eu entendo o que mudou em palavras simples, sem número complicado." },
      { titulo: "Família por perto", texto: "Quem cuida de mim percebe cedo quando algo sai do meu padrão, sem eu precisar ficar explicando." },
      { titulo: "Sono e coração juntos", texto: "Eu acompanho meu sono e meus batimentos num lugar só, sem susto e sem diagnóstico." },
    ],
  },
  chamada: {
    titulo: "Comece pelo dia de hoje.",
    apoio: "Entre e veja o CareTwin funcionando com duas pessoas de exemplo, Dona Cida e Seu Jorge.",
    botao: "Entrar no CareTwin",
    secundario: "Como usar",
  },
  rodape: {
    navegacao: "Links do rodapé",
    aviso: "As pessoas dos exemplos são fictícias. O CareTwin não substitui acompanhamento médico.",
  },
};

export const entrada = {
  titulo: "Entrar no CareTwin",
  subtitulo: "Acompanhe o seu dia ou o de quem você cuida.",
  voltar: "Voltar ao site",
  google: "Entrar com Google",
  separador: "ou",
  usuario: {
    rotulo: "E-mail ou nome",
    exemplo: "Ex.: marina@exemplo.com",
    ajuda: "O nome aparece no topo do app, para você saber quem entrou.",
  },
  senha: {
    rotulo: "Senha",
    ajuda: "Nesta versão a senha não sai deste navegador e não é guardada.",
    mostrar: "Mostrar senha",
    esconder: "Esconder senha",
  },
  botao: "Entrar",
  carregando: "Entrando…",
  nota: "Nesta versão de demonstração nada é enviado para servidor nenhum. Ligar o login de verdade é o próximo passo, explicado na página",
  comoUsar: "Como usar",
  erros: {
    resumo: (n: number) => (n === 1 ? "Falta preencher 1 campo" : `Faltam preencher ${n} campos`),
    usuario: "Escreva seu e-mail ou nome para entrar.",
    senha: "Escreva uma senha. Ela fica só neste navegador.",
  },
  vitrine: {
    titulo: "Cada pessoa tem o seu normal.",
    texto: "O CareTwin aprende o ritmo de quem usa a pulseira e avisa, com calma, quando um dia foge desse padrão.",
    itens: ["Passos comparados com o normal do horário", "Sono estimado pelo movimento da noite", "Resumo do dia para quem cuida"],
  },
  modalGoogle: {
    titulo: "Como ligar o login com Google",
    intro:
      "O botão já está no lugar. Para ele funcionar, o CareTwin usa o Supabase Auth, que já faz parte do backend do projeto. São sete passos, e os dois endereços que mais dão erro estão prontos para copiar.",
    passos: [
      { texto: "Abra o Google Cloud Console e crie um projeto chamado CareTwin.", link: "https://console.cloud.google.com/projectcreate", rotuloLink: "Abrir o Google Cloud Console" },
      { texto: "Em APIs e serviços, configure a tela de permissão OAuth como Externa e preencha o nome do app e o e-mail de contato." },
      { texto: "Em Credenciais, crie um ID do cliente OAuth do tipo Aplicativo da Web." },
      { texto: "Em Origens JavaScript autorizadas, cole o endereço do site:", copiar: "http://localhost:3000" },
      { texto: "Em URIs de redirecionamento autorizados, cole o endereço de retorno do Supabase, trocando SEU-PROJETO pelo nome do projeto:", copiar: "https://SEU-PROJETO.supabase.co/auth/v1/callback" },
      { texto: "Copie o ID do cliente e a chave secreta e cole em Authentication, Sign In / Providers, Google, no painel do Supabase.", link: "https://supabase.com/dashboard", rotuloLink: "Abrir o painel do Supabase" },
      { texto: "Com o provedor ativo, o cartão 5.3 do Trello (Autenticação) liga esta tela à sessão de verdade, sem mudar o desenho dela." },
    ],
    copiar: "Copiar",
    copiado: "Copiado",
    fechar: "Fechar",
    abreEmNovaAba: "(abre em nova aba)",
  },
};

export const casca = {
  menuPrincipal: "Menu principal",
  itens: [
    { rotulo: "Hoje", href: rotas.hoje, icone: "hoje" },
    { rotulo: "Sono", href: rotas.sono, icone: "sono" },
    { rotulo: "Batimentos", href: rotas.batimentos, icone: "batimentos" },
    { rotulo: "Alertas", href: rotas.alertas, icone: "alertas" },
    { rotulo: "Ajustes", href: rotas.ajustes, icone: "configuracoes" },
  ],
  sair: "Sair",
  saindo: "Saindo…",
  acompanhando: "Acompanhando",
  trocarPessoa: "Escolher a pessoa acompanhada",
  quemEntrou: (nome: string) => `Você entrou como ${nome}`,
  alertasNovos: (n: number) => (n === 1 ? "1 alerta novo" : `${n} alertas novos`),
  carregando: "Carregando o CareTwin…",
  offline: "Sem internet agora. O CareTwin continua mostrando os últimos dados guardados neste aparelho.",
  voltouOnline: "A internet voltou.",
  rodape: "CareTwin, protótipo acadêmico. Não substitui acompanhamento médico.",
};

export const comoUsar = {
  titulo: "Como usar o CareTwin",
  apoio:
    "O que este protótipo já faz hoje, o que ainda falta ligar e em que parte do projeto cada coisa se encaixa. Escrito para o time e para quem for avaliar.",
  voltar: "Voltar ao site",
  entrar: "Entrar no CareTwin",
  bloco1: {
    titulo: "O que já funciona hoje",
    itens: [
      { titulo: "Site de apresentação", texto: "Conta o que o CareTwin resolve, para quem é e como é um dia com ele." },
      { titulo: "Tela de entrar", texto: "Com Google, e-mail ou nome e senha. A sessão fica neste navegador até o login de verdade ser ligado." },
      { titulo: "Hoje", texto: "Resolve o momento da manhã e do meio do dia: a noite, os passos comparados com o normal do horário, a pulseira e um resumo escrito." },
      { titulo: "Sono", texto: "Mostra a noite minuto a minuto, quando a pessoa provavelmente dormiu e acordou, e compara com o costume." },
      { titulo: "Batimentos", texto: "Pede uma medição de bancada, guarda o histórico e mostra a faixa de costume." },
      { titulo: "Alertas", texto: "É a tela de quem cuida, à noite: um resumo do dia e cada mudança explicada em palavras simples." },
      { titulo: "Primeiro uso", texto: "Passo a passo para cadastrar a pessoa e conectar a pulseira, com uma tela vazia amigável enquanto os dados não chegam." },
      { titulo: "Ajustes", texto: "Pessoas acompanhadas, tema claro ou escuro, texto grande e os dados de exemplo para restaurar ou apagar." },
      { titulo: "No celular e sem internet", texto: "Funciona a partir de 375 pixels de largura, pode ser instalado na tela inicial e continua mostrando os últimos dados quando a internet cai." },
    ],
  },
  bloco2: {
    titulo: "O que ainda falta ligar, e onde cada coisa se encaixa",
    itens: [
      {
        titulo: "API do CareTwin",
        texto: "Hoje os dados moram no navegador. Quando a API em FastAPI com Supabase estiver no ar, as leituras e gravações passam a ir para ela, e nenhuma tela muda.",
        onde: "apps/web/src/lib/store.ts e docs/openapi.yaml",
      },
      {
        titulo: "Pulseira de verdade",
        texto: "O firmware do ESP32-S3 já envia o resumo diário, a noite e os passos ao vivo nos formatos que este app lê. Falta só apontar a pulseira para a API publicada.",
        onde: "firmware/ e as rotas /v1/device/* do contrato",
      },
      {
        titulo: "Login com Google",
        texto: "O botão e o passo a passo já estão na tela de entrar. Com o Supabase Auth configurado, a sessão local vira sessão de verdade.",
        onde: "apps/web/src/app/entrar e o cartão 5.3 do Trello",
      },
      {
        titulo: "Inteligência artificial local",
        texto: "Os resumos escritos hoje são exemplos com os números reais do dia. A IA local (Ollama) vai gerar esses textos pela API, e os exemplos continuam como reserva.",
        onde: "ai/ e apps/web/src/content/ia.ts",
      },
      {
        titulo: "Avisos no celular de quem cuida",
        texto: "O app já é instalável e já tem o service worker. Falta a API enviar uma notificação quando nascer um alerta novo.",
        onde: "apps/web/public/sw.js",
      },
    ],
  },
  bloco3: {
    titulo: "Os próximos passos",
    itens: [
      "Usar o app com os dados de exemplo por alguns dias e anotar o que incomodar.",
      "Ligar o app à API do CareTwin para trocar os exemplos pelos dados reais da pulseira.",
      "Testar com três a cinco pessoas, de preferência alguém que cuida de um familiar.",
      "Mostrar o resultado ao professor e à banca, com a pulseira funcionando ao vivo.",
    ],
  },
};

export const naoEncontrado = {
  titulo: "Esta página não existe",
  texto: "O endereço pode ter sido digitado errado ou a página mudou de lugar.",
  app: "Ir para Hoje",
  site: "Voltar ao site",
};

export const erroNaTela = {
  titulo: "Algo não saiu como esperado",
  texto: "Os seus dados continuam guardados neste aparelho. Tente carregar a tela de novo.",
  tentar: "Tentar de novo",
  voltar: "Ir para Hoje",
};
