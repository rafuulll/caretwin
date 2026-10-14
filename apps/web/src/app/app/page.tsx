import { redirect } from "next/navigation";
import { rotas } from "@/content/site";

/* A raiz do app abre direto na tela do momento mais frequente: Hoje. */
export default function RaizDoApp() {
  redirect(rotas.hoje);
}
