import type { Metadata } from "next";
import { NotFoundView } from "@/components/layout/NotFoundView";

export const metadata: Metadata = {
  title: "Página no encontrada — Rido",
  description: "Esta página no existe. Vuelve a rido.bike.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView locale="es" />;
}
