import { marca } from "@/content/site"
import { cn } from "@/lib/cn"

type PropsLogo = {
  className?: string
  /** Só o símbolo, sem o nome ao lado (o nome continua no leitor de tela). */
  somenteSimbolo?: boolean
}

/**
 * A marca do CareTwin, desenhada em SVG e pintada com `currentColor` para
 * herdar o `text-primary`. Trocar o design system no JSON repinta o logo junto.
 */
export function Logo({ className, somenteSimbolo = false }: PropsLogo) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Dois círculos que se sobrepõem, a pessoa e o normal dela, e o traço do
          pulso passando pelos dois. Desenhado em traço, como os ícones do app. */}
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0 text-primary"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="16" r="8.5" strokeWidth="2" />
        <circle cx="20" cy="16" r="8.5" strokeWidth="2" strokeOpacity="0.45" />
        <path d="M5 16.5h4.5l2-4 3 8 2.5-5.5 1.5 1.5H27" strokeWidth="2" />
      </svg>

      {somenteSimbolo ? (
        <span className="sr-only">{marca.nome}</span>
      ) : (
        <span
          className="truncate font-display text-base text-ink"
          style={{ fontWeight: "var(--ds-display-weight)", letterSpacing: "var(--ds-tracking)" }}
        >
          {marca.nome}
        </span>
      )}
    </span>
  )
}
