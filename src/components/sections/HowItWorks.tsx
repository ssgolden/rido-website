"use client";

import { Card } from "@/components/ui/Card";
import { Smartphone, QrCode, Bike, ParkingCircle } from "lucide-react";

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
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rido-coral text-sm font-semibold uppercase tracking-wider mb-3">
            Simple as 1-2-3
          </p>
          <h2 className="text-4xl md:text-5xl font-black">
            How It <span className="text-gradient-coral">Works</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <Card key={step.title} className="text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-rido-coral text-white text-sm font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div className="mt-4 mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-rido-coral/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-rido-coral" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}