"use client";

import { ErrorView } from "@/components/layout/ErrorView";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView error={error} reset={reset} locale="es" />;
}
