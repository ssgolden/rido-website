"use client";

import { pricingTiers, noSurpriseGuarantees } from "@/data/pricing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal, StaggerItem } from "@/components/ui/StaggerReveal";
import { useState } from "react";

function PricingCalculator() {
  const [minutes, setMinutes] = useState(10);
  const [plan, setPlan] = useState<"paygo" | "pass" | "day">("paygo");

  const rates = {
    paygo: { unlock: 0.5, perMin: 0.15, flatRate: null },
    pass: { unlock: 0, perMin: 0.1, flatRate: null },
    day: { unlock: 0, perMin: 0, flatRate: 9.99 },
  };

  const r = rates[plan];
  const total = plan === "day" ? r.flatRate! : r.unlock + r.perMin * minutes;

  return (
    <Card className="p-6 sm:p-8 max-w-lg mx-auto">
      <h3 className="text-xl font-bold mb-6 text-center">Estimate Your Ride</h3>

      <div className="flex gap-2 mb-6">
        {(["paygo", "pass", "day"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 ${
              plan === p
                ? "bg-rido-magenta text-white"
                : "glass text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {p === "paygo" ? "Pay as you go" : p === "pass" ? "Rido Pass" : "Day Pass"}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="text-sm text-white/50 mb-2 block">
          Ride duration: <strong className="text-white">{minutes} min</strong>
        </label>
        <input
          type="range"
          min={1}
          max={60}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full accent-rido-magenta h-2 rounded-lg appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rido-magenta [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-rido-magenta [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Ride duration in minutes"
        />
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>1 min</span>
          <span>60 min</span>
        </div>
      </div>

      <div className="glass rounded-xl p-5 text-center">
        <p className="text-sm text-white/50 mb-1">Estimated cost</p>
        <p className="text-4xl font-black text-rido-magenta">
          &euro;{total.toFixed(2)}
        </p>
        {plan !== "day" && (
          <p className="text-xs text-white/30 mt-2">
            &euro;{r.unlock.toFixed(2)} unlock + &euro;{r.perMin.toFixed(2)}/min
          </p>
        )}
        {plan === "day" && (
          <p className="text-xs text-white/30 mt-2">
            Unlimited rides for 24 hours
          </p>
        )}
      </div>
    </Card>
  );
}

export function Pricing() {
  return (
    <section id="pricing" aria-label="Pricing plans" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
              Transparent Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              No <span className="text-gradient-brand">Surprises</span>
            </h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              See the price before every ride. No hidden fees, no minimum top-ups,
              no refund charges.
            </p>
          </ScrollReveal>
        </div>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" staggerDelay={0.1}>
          {pricingTiers.map((tier) => (
            <StaggerItem key={tier.name}>
              <Card
                className={`text-center ${
                  tier.popular
                    ? "border-rido-magenta/40 shadow-lg shadow-rido-magenta/10"
                    : ""
                }`}
              >
                {tier.popular && (
                  <Badge variant="magenta" className="mb-4 cursor-default">Most Popular</Badge>
                )}
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-white/50 mb-6">{tier.description}</p>
                <div className="space-y-3">
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-white/40">Unlock Fee</p>
                    <p className="text-lg font-bold text-rido-magenta">{tier.unlockFee}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-white/40">Per Minute</p>
                    <p className="text-lg font-bold text-rido-magenta">{tier.perMinute}</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <ScrollReveal delay={0.2}>
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-rido-green" />
              <h3 className="text-lg font-bold">No-Surprise Guarantee</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {noSurpriseGuarantees.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-rido-green shrink-0" />
                  <span className="text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <PricingCalculator />
        </ScrollReveal>
      </div>
    </section>
  );
}