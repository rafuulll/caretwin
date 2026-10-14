import type { Metadata } from "next";
import { TelaSono } from "@/components/app/telas/sono";
import { sono } from "@/content/app";

export const metadata: Metadata = { title: sono.titulo };

export default function PaginaSono() {
  return <TelaSono />;
}
