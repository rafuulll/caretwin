import type { Metadata } from "next";
import { TelaAjustes } from "@/components/app/telas/ajustes";
import { ajustes } from "@/content/app";

export const metadata: Metadata = { title: ajustes.titulo };

export default function PaginaAjustes() {
  return <TelaAjustes />;
}
