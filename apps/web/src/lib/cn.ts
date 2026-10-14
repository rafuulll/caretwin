/** Junta classes, ignorando as vazias. Pequeno de propósito: o projeto não precisa de mais. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
