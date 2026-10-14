/**
 * O texto do tour de boas-vindas.
 *
 * Ele roda uma vez, na primeira visita, e ATRAVESSA PÁGINAS: começa no site,
 * continua dentro do app e termina lá. A última parada é de propósito: ela
 * conta que o tour inteiro é código do projeto e pode ser mudado ou removido a
 * quando alguém pedir, porque quem abriu este app tem que sair sabendo que manda nele.
 *
 * `pagina` é o endereço onde a parada acontece, e ele vale também pras telas de
 * dentro dele: "/app" acontece em "/app/painel" também. Vazio significa "onde
 * a pessoa estiver". As paradas seguem a ordem desta lista, então elas são
 * também o roteiro da jornada: site, depois app.
 *
 * `alvo` é um seletor de CSS. Parada sem alvo aparece no centro da tela. Se o
 * alvo não existir na página (você renomeou a tela, tirou o menu), a parada é
 * PULADA em vez de quebrar o tour: veja `tour.tsx`.
 */

export const tour = {
  /** Nome dos controles do próprio tour. */
  proximo: "Próximo",
  anterior: "Voltar",
  fechar: "Fechar",
  concluir: "Entendi",

  /** Botão que existe na tela de configurações pra rodar o tour de novo. */
  rever: {
    titulo: "Rever as boas-vindas",
    texto: "Roda de novo aquele passo a passo que apareceu na primeira vez.",
    acao: "Ver de novo",
  },

  paradas: [
    {
      pagina: "/",
      alvo: "[data-tour='entrar']",
      titulo: "Boas-vindas ao CareTwin",
      texto: "Este é o CareTwin. Quer ver o sistema por dentro? Clica em entrar.",
    },
    {
      pagina: "/app",
      alvo: "[data-tour='menu']",
      titulo: "O menu",
      texto:
        "Este é o menu. Cada item é uma parte do seu dia: o painel, o sono, os batimentos e os alertas.",
    },
    {
      pagina: "/app",
      alvo: "[data-tour='conteudo']",
      titulo: "O seu dia",
      texto: "Aqui o seu dia aparece comparado com o seu normal, e não com a meta dos outros.",
    },
    {
      pagina: "/app",
      alvo: "[data-tour='perfil']",
      titulo: "Perfil e sair",
      texto: "Aqui você ajusta o seu perfil e sai do sistema.",
    },
    {
      pagina: "/app",
      alvo: null,
      titulo: "Uma última coisa",
      texto: "Você pode pedir pro seu assistente remover este tour, e o sistema fica mais limpo.",
    },
  ],
}
