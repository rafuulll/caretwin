import type { MetadataRoute } from "next";
import { marca, rotas } from "@/content/site";

/* Manifesto do PWA: o CareTwin pode ser instalado na tela inicial do celular. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: marca.nome,
    short_name: marca.nome,
    description: marca.descricao,
    lang: "pt-BR",
    start_url: rotas.hoje,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f0f9ff",
    theme_color: "#0369a1",
    categories: ["health", "lifestyle"],
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone-mascara-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
