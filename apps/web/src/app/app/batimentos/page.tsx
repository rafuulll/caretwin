import type { Metadata } from "next";
import { TelaBatimentos } from "@/components/app/telas/batimentos";
import { batimentos } from "@/content/app";

export const metadata: Metadata = { title: batimentos.titulo };

export default function PaginaBatimentos() {
  return <TelaBatimentos />;
}
