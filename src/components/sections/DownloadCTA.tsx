"use client";

import { Button } from "@/components/ui/Button";
import Image from "next/image";

export function DownloadCTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rido-magenta/20 via-rido-navy to-rido-magenta-light/10" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-rido-magenta/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-6">
          Ready to{" "}
          <span className="text-gradient-brand">Ride</span>?
        </h2>
        <p className="text-lg text-white/50 max-w-lg mx-auto mb-10">
          Download the Rido app and start moving freely across Spain. Your first
          ride is waiting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="min-w-[200px]">
            🍎 App Store
          </Button>
          <Button variant="secondary" size="lg" className="min-w-[200px]">
            ▶ Google Play
          </Button>
        </div>

        <div className="mt-12 max-w-xs mx-auto">
          <Image
            src="/images/app/rido-app-screenshot.png"
            alt="Rido app screenshot"
            width={300}
            height={650}
            className="mx-auto rounded-3xl shadow-2xl shadow-rido-magenta/20"
            priority
          />
        </div>
      </div>
    </section>
  );
}