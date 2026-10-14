import type { Metadata } from "next";
import { TelaHoje } from "@/components/app/telas/hoje";
import { hoje } from "@/content/app";

export const metadata: Metadata = { title: hoje.titulo };

export default function PaginaHoje() {
  return <TelaHoje />;
}
