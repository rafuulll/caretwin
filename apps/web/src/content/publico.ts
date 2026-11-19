/**
 * Os textos das duas páginas abertas, /demo e /ao-vivo. Ficam separados de
 * `site.ts` porque só elas usam, e porque são páginas sem conta.
 */

export const publico = {
  faixa: "Demonstração pública, somente leitura. Estes dados são de uma pessoa de teste, simulados para a apresentação.",
  voltar: "Conhecer o CareTwin",
  desligada: {
    titulo: "Esta demonstração não está ligada",
    corpo: "O administrador do site ainda não escolheu uma pulseira de demonstração para mostrar aqui.",
  },
  erro: {
    titulo: "Não deu para carregar agora",
    corpo: "Tente de novo em alguns segundos.",
    tentar: "Tentar de novo",
  },
  carregando: "Carregando a demonstração",
  demo: {
    titulo: "Demonstração",
    subtitulo: "Os dados da pulseira de {codigo}, do jeito que a família vê no painel.",
    verAoVivo: "Ver os dados brutos em tempo real",
    trocar: "Pulseira",
    semNome: "Pessoa de demonstração",
  },
  aoVivo: {
    titulo: "Dados brutos ao vivo",
    subtitulo: "Acelerômetro, giroscópio e batimentos da pulseira {codigo}, direto do sensor, uma atualização por segundo.",
    verDemo: "Ver o painel da demonstração",
    status: {
      ao_vivo: "Ao vivo",
      parado: "Sem sinal há {tempo}",
      nunca: "Esperando a pulseira",
      conectando: "Conectando",
    },
    dica: "Para ligar: na pulseira, segure o botão A por 2 segundos. O modo ao vivo dura 2 minutos.",
    passos: "Passos hoje",
    bpm: "Batimentos",
    bpmSemDedo: "Sem dedo no sensor",
    bpmMedindo: "Medindo: mantenha o dedo parado",
    bpmUnidade: "bpm",
    taxa: "Leituras por segundo",
    bateria: "Bateria",
    ultimoLote: "Último lote",
    graficos: {
      aceleracao: "Acelerômetro",
      aceleracaoUnidade: "g",
      aceleracaoAjuda: "A gravidade parada marca 1 g no eixo que aponta para baixo.",
      giroscopio: "Giroscópio",
      giroscopioUnidade: "graus/s",
      giroscopioAjuda: "Mede o quanto a pulseira gira em cada eixo.",
      infravermelho: "Pulso no sensor de batimentos",
      pulso: "Pulso",
      infravermelhoUnidade: "u.a.",
      infravermelhoAjuda:
        "A luz infravermelha refletida no dedo, sem a parte constante do sinal: cada pico é uma batida. Fica reto enquanto não há dedo.",
    },
    janela: "Últimos {segundos} segundos",
    eixos: { x: "X", y: "Y", z: "Z" },
  },
} as const
