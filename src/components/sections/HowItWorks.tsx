"use client";

import { Card } from "@/components/ui/Card";
import { Smartphone, QrCode, Bike, ParkingCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";

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
          <SectionHeading
            eyebrow="Simple as 1-2-3"
            before="How It"
            highlight="Works"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
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
      </div>
    </section>
  );
}