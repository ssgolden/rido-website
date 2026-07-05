"use client";

import { faqItems, type Category } from "@/data/faq";
import { ChevronDown, Search, Mail } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CategoryFilter = "all" | Category;

const VISIBLE_LIMIT = 6;

const categories: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "getting-started", label: "Getting Started" },
  { id: "pricing", label: "Pricing" },
  { id: "safety", label: "Safety" },
  { id: "legal", label: "Legal" },
];

function FAQItem({ question, answer, isOpen, onToggle, id }: { question: string; answer: string; isOpen: boolean; onToggle: () => void; id: string }) {
  const answerId = `faq-answer-${id}`;
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-5 text-left cursor-pointer group" aria-expanded={isOpen} aria-controls={answerId}>
        <span className="font-semibold text-white/90 group-hover:text-rido-magenta transition-colors pr-4 text-sm sm:text-base">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="shrink-0">
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div id={answerId} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="overflow-hidden" role="region">
            <p className="pb-5 text-sm text-muted leading-relaxed pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const filteredItems = useMemo(() => {
    return faqItems
      .filter((item) => {
        const matchesSearch = search === "" || item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || item.category === category;
        return matchesSearch && matchesCategory;
      })
      .map((item, idx) => ({ ...item, stableId: `faq-${idx}` }));
  }, [search, category]);

  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, VISIBLE_LIMIT);
  const hiddenCount = filteredItems.length - visibleItems.length;

  return (
    <section id="faq" aria-label="Frequently asked questions" className="py-12 sm:py-24 px-4 sm:px-6">
      {/* FAQPage schema is also injected globally in src/lib/schema.ts; this inline instance is kept for the interactive FAQ section only and deduplicates cleanly via @id in global schemas. */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <SectionHeading
            eyebrow="Got Questions?"
            before="Frequently"
            highlight="Asked"
            className="text-3xl sm:text-4xl md:text-5xl font-black"
          />
          <ScrollReveal>
            <p className="mt-4 text-muted max-w-xl mx-auto">Everything you need to know about riding with Rido.</p>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.1}>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-weak" />
            <input type="text" placeholder="Search questions..." value={search} onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
              className="w-full pl-11 pr-4 py-3 rounded-xl glass text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-rido-magenta/50 cursor-text"
              aria-label="Search frequently asked questions" />
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setShowAll(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${category === cat.id ? "bg-rido-magenta text-white" : "glass text-muted hover:text-white hover:bg-white/10"}`}>
                {cat.label}
              </button>
            ))}
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6">
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted-weak py-8 text-sm">No questions match your search. Try different keywords.</p>
            ) : (
              visibleItems.map((item) => (
                <FAQItem key={item.stableId} question={item.question} answer={item.answer} id={item.stableId}
                  isOpen={openIndex === item.stableId} onToggle={() => setOpenIndex(openIndex === item.stableId ? null : item.stableId)} />
              ))
            )}
          </div>
          {hiddenCount > 0 && (
            <div className="mt-4 text-center">
              <Button variant="secondary" size="sm" onClick={() => setShowAll(true)} aria-label={`Show all ${filteredItems.length} questions`}>
                Show all {filteredItems.length} questions <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          <div className="mt-6 text-center">
            <a href="mailto:info@rido.bike" suppressHydrationWarning className="inline-flex items-center gap-2 text-sm text-rido-magenta hover:text-rido-magenta-light transition-colors cursor-pointer">
              <Mail className="w-4 h-4" /> Still have questions? Email info@rido.bike
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
