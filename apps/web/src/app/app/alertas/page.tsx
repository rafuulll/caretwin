import type { Metadata } from "next";
import { TelaAlertas } from "@/components/app/telas/alertas";
import { alertas } from "@/content/app";

export const metadata: Metadata = { title: alertas.titulo };

export default function PaginaAlertas() {
  return <TelaAlertas />;
}
