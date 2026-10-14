import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { marca } from "@/content/site";
import { ProvedorAnuncios } from "@/components/ui/anunciador";
import { EfeitoPreferencias } from "@/components/app/efeito-preferencias";
import { RegistroServiceWorker } from "@/components/pwa/registro-service-worker";

/*
  Atkinson Hyperlegible: a fonte que a skill ui-ux-pro-max indicou para produtos de
  cuidado com idosos, desenhada pelo Braille Institute para ser lida com facilidade
  por quem tem baixa visão. Os arquivos ficam no projeto (licença OFL em ./fonts),
  então nada é baixado de fora quando o app abre.
*/
const atkinson = localFont({
  src: [
    { path: "./fonts/atkinson-hyperlegible-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/atkinson-hyperlegible-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/atkinson-hyperlegible-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--fonte-atkinson",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: `${marca.nome}: o normal de cada pessoa, acompanhado com calma`,
    template: `%s | ${marca.nome}`,
  },
  description: marca.descricao,
  applicationName: marca.nome,
  appleWebApp: { capable: true, title: marca.nome, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f9ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1726" },
  ],
};

/*
  Aplica tema e tamanho de texto antes da primeira pintura, lendo as preferências
  guardadas neste navegador. Sem isso, quem escolheu o tema escuro veria um clarão.
*/
const scriptPreferencias = `(function(){try{var p=JSON.parse(localStorage.getItem("caretwin:preferencias:v1")||"{}");var t=p.tema||"sistema";var e=t==="escuro"||(t==="sistema"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.dataset.tema=e?"escuro":"claro";r.dataset.texto=p.texto==="grande"?"grande":"padrao";}catch(_){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-tema="claro" data-texto="padrao" className={atkinson.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptPreferencias }} />
      </head>
      <body className="min-h-dvh">
        <ProvedorAnuncios>{children}</ProvedorAnuncios>
        <EfeitoPreferencias />
        <RegistroServiceWorker />
      </body>
    </html>
  );
}
