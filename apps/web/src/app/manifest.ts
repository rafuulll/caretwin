import type { MetadataRoute } from "next"
import config from "../../design-system.json"
import { marca } from "@/content/site"

/**
 * O que deixa o CareTwin ser instalado na tela inicial do celular (cartão 7.7).
 * Instalado, ele abre direto no Painel, sem a barra do navegador, e com o
 * service worker (`public/sw.js`) continua abrindo sem internet.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: marca.nome,
    short_name: marca.nome,
    description: marca.descricaoCurta,
    lang: "pt-BR",
    start_url: "/app/painel",
    scope: "/",
    display: "standalone",
    background_color: config.tokens.canvas,
    theme_color: config.tokens.canvas,
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
