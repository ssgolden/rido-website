"use client";

import { Card } from "@/components/ui/Card";
import { Smartphone, QrCode, Bike, ParkingCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import Image from "next/image";

const steps = [
  {
    icon: Smartphone,
    title: "Download & Create",
    description: "Get the Rido app for free, create your account in seconds, and add your payment method.",
  },
  {
    icon: QrCode,
    title: "Scan & Unlock",
    description: "Find a Rido nearby on the map, scan the QR code on the handlebar, and you're ready to roll.",
  },
  {
    icon: Bike,
    title: "Ride & Enjoy",
    description: "Follow traffic rules, use bike lanes, and enjoy the ride. Helmet recommended for your safety.",
  },
  {
    icon: ParkingCircle,
    title: "Park & End Ride",
    description: "Park responsibly in designated areas shown in the app. End your ride and pay only for what you used.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-label="How it works" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
              Simple as 1-2-3
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              How It <span className="text-gradient-brand">Works</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="relative">
          {/* Progress line */}
          <div className="hidden lg:block absolute top-[3.5rem] left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5 bg-gradient-to-r from-rido-magenta/50 via-rido-magenta/20 to-rido-magenta/50" />

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.12}>
            {steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <Card className="text-center relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-rido-magenta text-white text-sm font-bold flex items-center justify-center cursor-default">
                    {i + 1}
                  </div>
                  <div className="mt-4 mb-4 flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-rido-magenta/10 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-rido-magenta" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>

        {/* App screenshot */}
        <ScrollReveal delay={0.3} className="mt-16 flex justify-center">
          <div className="relative max-w-xs">
            <Image
              src="/images/app/rido-app-screenshot.png"
              alt="Rido app showing nearby vehicles and scan-to-ride"
              width={280}
              height={600}
              className="rounded-3xl shadow-2xl shadow-rido-magenta/20"
              priority
            />
            <div className="absolute -inset-4 rounded-[2rem] bg-rido-magenta/5 -z-10" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}