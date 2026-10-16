"use client";

import { ErrorView } from "@/components/layout/ErrorView";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-rido-navy font-sans overflow-x-hidden">
        <ErrorView error={error} reset={reset} locale="en" />
      </body>
    </html>
  );
}
