"use client";

import { testimonials } from "@/data/testimonials";
import { Star, Quote, Users } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useState, useEffect, useCallback } from "react";


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-rido-yellow text-rido-yellow" : "text-white/20"}`} />
      ))}
    </div>
  );
}

function GradientAvatar({ initial, index }: { initial: string; index: number }) {
  const gradients = [
    "from-rido-magenta to-rido-magenta-light",
    "from-rido-magenta-light to-rido-yellow",
    "from-rido-magenta-dark to-rido-magenta",
    "from-rido-yellow to-rido-magenta-light",
  ];
  const gradient = gradients[index % gradients.length];
  return (
    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-rido-magenta/20`}>
      {initial}
    </div>
  );
}

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const ROTATE_INTERVAL = 6000;
  const [progressWidth, setProgressWidth] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
    setProgressWidth(0);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / ROTATE_INTERVAL) * 100, 100);
      setProgressWidth(pct);
      if (pct >= 100) next();
    }, 50);
    return () => clearInterval(interval);
  }, [current, next]);

  return (
    <section id="testimonials" aria-label="Rider testimonials" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden section-tint-magenta">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-rido-magenta/5 blur-3xl" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">Trusted by Riders</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">What Riders <span className="text-gradient-brand">Say</span></h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-sm">
              <Users className="w-4 h-4 text-rido-magenta/60" />
              <span>Join 10,000+ happy riders</span>
            </div>
          </ScrollReveal>
        </div>
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {testimonials.map((t, i) => (
            <StaggerItem key={t.name}>
              <div className={`glass rounded-2xl p-6 h-full flex flex-col transition-all duration-300 relative overflow-hidden ${i === current ? "border-rido-magenta/40 shadow-lg shadow-rido-magenta/10" : ""} group hover:border-l-4 hover:border-l-rido-magenta hover:-translate-y-1`}>
                {i === current && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
                    <div className="h-full bg-rido-magenta transition-all duration-50" style={{ width: `${progressWidth}%` }} />
                  </div>
                )}
                <Quote className="w-6 h-6 text-rido-magenta/30 mb-4 shrink-0" />
                <p className="text-white/70 text-sm leading-relaxed flex-1 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                  <GradientAvatar initial={t.name.charAt(0)} index={i} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    <p className="text-xs text-white/40">{t.city}</p>
                  </div>
                </div>
                <div className="mt-3"><StarRating rating={t.rating} /></div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setProgressWidth(0); }}
              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${i === current ? "bg-rido-magenta w-6" : "bg-white/20 hover:bg-white/40"}`}
              aria-label={`Go to testimonial ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
