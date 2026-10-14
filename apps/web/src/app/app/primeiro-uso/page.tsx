import type { Metadata } from "next";
import { TelaPrimeiroUso } from "@/components/app/telas/primeiro-uso";
import { primeiroUso } from "@/content/app";

export const metadata: Metadata = { title: primeiroUso.titulo };

export default function PaginaPrimeiroUso() {
  return <TelaPrimeiroUso />;
}
