"use client";

import type { FaqItem } from "@/data/faq";
import type { CategoryFilter, FaqCopy } from "@/components/sections/FAQ.copy";
import { ChevronDown, Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { useState, useMemo } from "react";
import { STAGGER } from "@/lib/motion";

const VISIBLE_LIMIT = 6;

/** Stable filter order; ids never change — only the labels are localized. */
const categoryIds: readonly CategoryFilter[] = ["all", "getting-started", "pricing", "safety", "legal"];

/**
 * Native exclusive accordion: every item shares name="faq", so opening one
 * closes the others with no JavaScript, and closed answers stay in the page
 * for find-in-page. The open/close height animation is CSS (.faq-item in
 * globals.css) where the browser supports it; elsewhere it opens instantly.
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details name="faq" className="faq-item group border-b border-white/10 last:border-b-0">
      <summary className="list-none [&::-webkit-details-marker]:hidden w-full flex items-center justify-between py-5 text-left cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy">
        <span className="font-semibold text-white/90 group-hover:text-rido-magenta-light transition-colors duration-200 pr-4 text-sm sm:text-base">{question}</span>
        <ChevronDown className="w-5 h-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <p className="pb-5 text-sm text-muted leading-relaxed pr-8">{answer}</p>
    </details>
  );
}

export function FAQ({ t, items }: { t: FaqCopy; items: FaqItem[] }) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [showAll, setShowAll] = useState(false);

  // Thirteen questions need a category filter, not a search box; the browser's
  // find-in-page already searches the closed answers (native <details>).
  const filteredItems = useMemo(
    () => items.filter((item) => category === "all" || item.category === category),
    [items, category]
  );

  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, VISIBLE_LIMIT);
  const hiddenCount = filteredItems.length - visibleItems.length;

  return (
    <section id="faq" aria-label={t.sectionAria} className="py-16 sm:py-24 px-4 sm:px-6">
      {/* FAQPage JSON-LD is injected by the locale root layout (EN on /, ES on /es). */}
      <div className="max-w-3xl mx-auto">
        <SectionHeader label={t.label} title={t.title} intro={t.intro} />
        <ScrollReveal delay={STAGGER.text}>
          <div className="chip-row flex gap-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categoryIds.map((catId) => (
              <button key={catId} onClick={() => { setCategory(catId); setShowAll(false); }}
                className={`shrink-0 min-h-11 px-4 py-2 rounded-full text-xs font-semibold transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rido-magenta focus-visible:ring-offset-2 focus-visible:ring-offset-rido-navy ${category === catId ? "bg-rido-magenta text-white" : "glass text-muted hover:text-white hover:bg-white/10"}`}>
                {t.categories[catId]}
              </button>
            ))}
          </div>
          {/* Plain list on the section surface (no card-in-card): the city page uses the same treatment. */}
          <div className="border-t border-white/10">
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted-weak py-8 text-sm">{t.noResults}</p>
            ) : (
              visibleItems.map((item) => (
                <FAQItem key={item.question} question={item.question} answer={item.answer} />
              ))
            )}
          </div>
          {hiddenCount > 0 && (
            <div className="mt-4 text-center">
              <Button variant="secondary" size="sm" onClick={() => setShowAll(true)} aria-label={`${t.showAllBefore} ${filteredItems.length} ${t.showAllAfter}`}>
                {t.showAllBefore} {filteredItems.length} {t.showAllAfter} <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          <div className="mt-6 text-center">
            <a href="mailto:info@rido.bike" suppressHydrationWarning className="inline-flex items-center gap-2 text-sm text-rido-magenta-light hover:text-white transition-colors cursor-pointer">
              <Mail className="w-4 h-4" /> {t.stillQuestions}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
