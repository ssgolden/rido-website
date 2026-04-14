"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-rido-navy font-sans overflow-x-hidden">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rido-magenta/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-rido-magenta" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">
              Application Error
            </h1>

            <p className="text-white/60 mb-6">
              A critical error occurred. Please refresh the page or return home.
              {error.digest && (
                <span className="block mt-2 text-xs text-white/40">
                  Error ID: {error.digest}
                </span>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => reset()}
                className="gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Try Again
              </Button>

              <Link href="/">
                <Button variant="secondary" className="gap-2 w-full sm:w-auto">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}