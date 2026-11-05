import { marca } from "@/content/site";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  somenteSimbolo = false,
}: {
  className?: string;
  somenteSimbolo?: boolean;
}) {
  return (
    <span className={cn("ct-wordmark", className)} role="img" aria-label={marca.nome}>
      <span aria-hidden="true">
        {somenteSimbolo ? marca.nome.slice(0, 1) : marca.nome}
      </span>
      <span className="ct-wordmark-dot" aria-hidden="true" />
    </span>
  );
}
