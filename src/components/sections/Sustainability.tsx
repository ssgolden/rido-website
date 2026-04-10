"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Leaf, Car, Zap } from "lucide-react";

function AnimatedCounter({
  end,
  suffix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="font-black text-4xl md:text-5xl text-rido-green">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { label: "Tonnes CO₂ Saved", value: 1240, suffix: "+", icon: Leaf },
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
    <section id="sustainability" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-rido-navy via-rido-green/5 to-rido-navy" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rido-green text-sm font-semibold uppercase tracking-wider mb-3">
            Planet First
          </p>
          <h2 className="text-4xl md:text-5xl font-black">
            Real <span className="text-rido-green">Sustainability</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Not just talk. Every Rido ride replaces a car trip. Here&apos;s our real impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-rido-green/10 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-rido-green" />
                </div>
              </div>
              <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              <p className="text-white/40 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commitments.map((item) => (
            <Card key={item.title}>
              <h3 className="font-bold text-lg mb-2 text-rido-green">
                {item.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}