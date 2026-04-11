"use client";

import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";
import Image from "next/image";
import { Apple, Play } from "lucide-react";

export function DownloadCTA() {
  return (
    <section aria-label="Download the Rido app" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rido-magenta/20 via-rido-navy to-rido-magenta-light/10" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-rido-magenta/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Ready to{" "}
            <span className="text-gradient-brand">Ride</span>?
          </h2>
          <p className="text-lg text-white/50 max-w-lg mx-auto mb-10">
            Download the Rido app and start moving freely across Spain. Your first
            ride is waiting.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="min-w-[220px] gap-3">
              <Apple className="w-5 h-5" />
              <span className="flex flex-col items-start">
                <span className="text-[10px] leading-tight opacity-70">Download on the</span>
                <span className="text-sm leading-tight font-bold">App Store</span>
              </span>
            </Button>
            <Button variant="secondary" size="lg" className="min-w-[220px] gap-3">
              <Play className="w-5 h-5" />
              <span className="flex flex-col items-start">
                <span className="text-[10px] leading-tight opacity-70">Get it on</span>
                <span className="text-sm leading-tight font-bold">Google Play</span>
              </span>
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 max-w-xs mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/images/app/rido-app-screenshot.png"
                  alt="Rido app showing vehicle map and ride options"
                  width={300}
                  height={650}
                  className="mx-auto rounded-3xl shadow-2xl shadow-rido-magenta/20"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}