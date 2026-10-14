import { redirect } from "next/navigation"

/**
 * `/app` sozinho não é tela nenhuma: quem entra cai direto no painel, que é o
 * momento mais frequente do dia. O endereço do painel tem o nome dele, pra o
 * rótulo do menu e o endereço falarem a mesma palavra.
 */
export default function PaginaApp() {
  redirect("/app/painel")
}
