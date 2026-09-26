"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-rido-navy flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rido-magenta/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rido-magenta" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-white/60 mb-6">
          We apologize for the inconvenience. An unexpected error occurred.
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
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Button
            variant="secondary"
            className="gap-2 w-full sm:w-auto"
            onClick={() => window.location.href = "/"}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}