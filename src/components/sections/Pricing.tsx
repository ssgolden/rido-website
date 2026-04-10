"use client";

import { pricingTiers, noSurpriseGuarantees } from "@/data/pricing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, ShieldCheck } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rido-coral text-sm font-semibold uppercase tracking-wider mb-3">
            Transparent Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-black">
            No <span className="text-gradient-coral">Surprises</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            See the price before every ride. No hidden fees, no minimum top-ups,
            no refund charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`text-center ${
                tier.popular
                  ? "border-rido-coral/40 shadow-lg shadow-rido-coral/10"
                  : ""
              }`}
            >
              {tier.popular && (
                <Badge variant="coral" className="mb-4">
                  Most Popular
                </Badge>
              )}
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <p className="text-sm text-white/50 mb-6">{tier.description}</p>
              <div className="space-y-3">
                <div className="glass rounded-xl p-3">
                  <p className="text-xs text-white/40">Unlock Fee</p>
                  <p className="text-lg font-bold text-rido-coral">
                    {tier.unlockFee}
                  </p>
                </div>
                <div className="glass rounded-xl p-3">
                  <p className="text-xs text-white/40">Per Minute</p>
                  <p className="text-lg font-bold text-rido-coral">
                    {tier.perMinute}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-rido-green" />
            <h3 className="text-lg font-bold">
              No-Surprise Guarantee
            </h3>
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
      </div>
    </section>
  );
}