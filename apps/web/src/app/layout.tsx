import type { Metadata } from "next"
import { Inter } from "next/font/google"
import config from "../../design-system.json"
import { designSystem, toCssVars } from "@/lib/design-system"
import { marca } from "@/content/site"
import "./globals.css"

// A fonte do CareTwin. O design-system.json aponta para --font-inter; se um dia
// a família mudar lá, o navegador cai na pilha de reserva sem quebrar o layout.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: `${marca.nome} · ${marca.tagline}`,
  description: marca.descricaoCurta,
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
      className={`${inter.variable} h-full`}
      style={vars}
      data-ds={designSystem.id}
      data-mode={designSystem.mode}
    >
      <body className="min-h-full">{children}</body>
    </html>
  )
}
