/*
  As paradas do tour da primeira visita. Dado puro: o invólucro em
  src/components/onboarding/tour.tsx só lê esta lista.
  "pagina" é o começo do endereço onde a parada acontece; "alvo" é o data-tour do elemento.
*/

export type ParadaTour = {
  pagina: string;
  alvo: string | null;
  titulo: string;
  texto: string;
};

export const tour = {
  proximo: "Próximo",
  anterior: "Voltar",
  concluir: "Concluir",
  entendi: "Entendi",
  progresso: "Passo {{current}} de {{total}}",
  fechar: "Fechar o tour",
  paradas: [
    {
      pagina: "/",
      alvo: "entrar",
      titulo: "Este é o CareTwin",
      texto: "Esta é a página que apresenta o projeto. Quer ver o sistema por dentro? Clique em Entrar.",
    },
    {
      pagina: "/app",
      alvo: "menu",
      titulo: "O menu do dia",
      texto: "Cada item é um momento do dia: Hoje, a noite em Sono, os Batimentos e os Alertas para quem cuida.",
    },
    {
      pagina: "/app",
      alvo: "conteudo",
      titulo: "O dia comparado com o normal",
      texto: "Aqui o dia aparece comparado com o normal da própria pessoa nos últimos 14 dias, e não com a meta dos outros.",
    },
    {
      pagina: "/app",
      alvo: "perfil",
      titulo: "Quem você acompanha",
      texto: "Aqui você troca a pessoa acompanhada e sai do sistema quando quiser.",
    },
    {
      pagina: "/app",
      alvo: null,
      titulo: "Pronto para explorar",
      texto: "Os dados são de exemplo. Em Ajustes dá para restaurar os exemplos, mudar o tamanho do texto e o tema. Você também pode pedir ao seu assistente para remover este tour.",
    },
  ] satisfies ParadaTour[],
};
