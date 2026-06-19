"use client";

import { Card } from "@/components/ui/Card";
import { Leaf, Car, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useCountUp } from "@/hooks/useCountUp";

function SustainabilityStat({
  value,
  suffix,
  label,
  icon: Icon,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const { count, ref, visible } = useCountUp(value, { duration: 2500 });
  return (
    <StaggerItem className="text-center">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-rido-green/10 flex items-center justify-center">
          <Icon className="w-7 h-7 text-rido-green" />
        </div>
      </div>
      <span ref={ref} className="font-black text-3xl sm:text-4xl md:text-5xl text-rido-green transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }} suppressHydrationWarning>
        {count.toLocaleString()}{suffix}
      </span>
      <p className="text-muted text-sm mt-2">{label}</p>
    </StaggerItem>
  );
}

const stats = [
  { label: "Tonnes CO\u2082 Saved", value: 1240, suffix: "+", icon: Leaf },
  { label: "Car Trips Replaced", value: 85000, suffix: "+", icon: Car },
  { label: "Km Ridden Emission-Free", value: 420000, suffix: "+", icon: Zap },
];

const commitments = [
  {
    title: "Carbon Neutral Operations",
    description:
      "We offset 100% of our operational emissions through verified carbon credits and green energy.",
  },
  {
    title: "Swappable Batteries",
    description:
      "Our vehicle batteries are swappable and recycled at end-of-life. No single-use waste.",
  },
  {
    title: "Responsible Recycling",
    description:
      "At end of life, every vehicle is dismantled and recycled. We publish our recycling rates.",
  },
];

export function Sustainability() {
  return (
    <section id="sustainability" aria-label="Sustainability impact" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-rido-navy via-rido-green/5 to-rido-navy" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeading
            eyebrow="Planet First"
            before="Real"
            highlight="Sustainability"
            highlightClass="text-rido-green"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">
              Every Rido ride replaces a car trip. Here&apos;s the impact we&apos;re projected to make.
            </p>
          </ScrollReveal>
        </div>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4" staggerDelay={0.15}>
          {stats.map((stat) => (
            <SustainabilityStat key={stat.label} {...stat} />
          ))}
        </StaggerReveal>
        <p className="text-center text-xs text-muted-weak mb-16">Projected impact based on planned fleet size and ridership targets.</p>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {commitments.map((item) => (
            <StaggerItem key={item.title}>
              <Card>
                <h3 className="font-bold text-lg mb-2 text-rido-green">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}