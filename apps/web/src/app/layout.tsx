import type { Metadata } from "next"
import localFont from "next/font/local"
import config from "../../design-system.json"
import { designSystem, toCssVars } from "@/lib/design-system"
import { RegistrarSw } from "@/components/registrar-sw"
import { marca } from "@/content/site"
import "./globals.css"
import "./redesign.css"

// Arquivos locais mantêm o lettering aprovado sem depender de uma chamada ao Google.
const fustat = localFont({
  src: [
    {path: "../../public/brand/fustat-0.ttf", weight:"400", style:"normal"},
    {path: "../../public/brand/fustat-1.ttf", weight:"500", style:"normal"},
    {path: "../../public/brand/fustat-2.ttf", weight:"600", style:"normal"},
    {path: "../../public/brand/fustat-3.ttf", weight:"700", style:"normal"},
  ],
  variable: "--font-fustat", display: "swap",
})

export const metadata: Metadata = {
  title: `${marca.nome} · ${marca.tagline}`,
  description: marca.descricaoCurta,
  // O ícone da tela inicial do iPhone, que não lê os ícones do manifest.
  icons: { apple: "/icones/apple-touch-icon.png" },
}

/**
 * O que o design-system.json traz além das cores por papel: o ritmo do
 * espaçamento, a altura de linha e o tom de marca usado como tinta. A conversão
 * principal mora em `toCssVars`; estes três entram aqui para que nenhum valor
 * do JSON fique sem virar variável.
 */
function variaveisDoRitmo(): Record<string, string> {
  const extras: Record<string, string> = {
    "--ds-space": config.layout.space,
    "--ds-line-height": String(config.layout.lineHeight),
  }
  // Quando o accent é o mesmo tom da primária, ele não é escrito: assim a prévia
  // de tema da tela de configurações, que troca só a primária, leva o accent
  // junto pelo `var(--ds-primary)` do globals.css.
  if (config.tokens.primaryAccent !== config.tokens.primary) {
    extras["--ds-primary-accent"] = config.tokens.primaryAccent
  }
  return extras
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Os tokens do design-system.json viram custom properties aqui, no servidor.
  // É isso que faz trocar o JSON repintar o app inteiro sem tocar em componente.
  const vars = { ...toCssVars(designSystem), ...variaveisDoRitmo() } as React.CSSProperties

  return (
    <html
      lang="pt-BR"
      className={`${fustat.variable} h-full`}
      style={vars}
      data-ds={designSystem.id}
      data-mode={designSystem.mode}
    >
      <body className="min-h-full">
        {children}
        <RegistrarSw />
      </body>
    </html>
  )
}
