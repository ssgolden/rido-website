"use client";

import { faqItems } from "@/data/faq";
import { ChevronDown, Search, Mail } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Category = "all" | "getting-started" | "pricing" | "safety" | "legal";

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "getting-started", label: "Getting Started" },
  { id: "pricing", label: "Pricing" },
  { id: "safety", label: "Safety" },
  { id: "legal", label: "Legal" },
];

const faqCategories: Category[] = [
  "getting-started", "getting-started", "getting-started",
  "legal", "safety", "safety", "safety",
  "pricing", "pricing", "pricing", "safety", "legal",
];

function FAQItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-5 text-left cursor-pointer group" aria-expanded={isOpen}>
        <span className="font-semibold text-white/90 group-hover:text-rido-magenta transition-colors pr-4 text-sm sm:text-base">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="shrink-0">
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="overflow-hidden">
            <p className="pb-5 text-sm text-white/50 leading-relaxed pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const filteredItems = useMemo(() => {
    return faqItems.map((item, i) => ({ ...item, index: i, cat: faqCategories[i] }))
      .filter((item) => {
        const matchesSearch = search === "" || item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || item.cat === category;
        return matchesSearch && matchesCategory;
      });
  }, [search, category]);

  return (
    <section id="faq" aria-label="Frequently asked questions" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <ScrollReveal>
            <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">Got Questions?</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">Frequently <span className="text-gradient-brand">Asked</span></h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">Everything you need to know about riding with Rido.</p>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.1}>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl glass text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-rido-magenta/50 cursor-text"
              aria-label="Search frequently asked questions" />
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${category === cat.id ? "bg-rido-magenta text-white" : "glass text-white/50 hover:text-white hover:bg-white/10"}`}>
                {cat.label}
              </button>
            ))}
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6">
            {filteredItems.length === 0 ? (
              <p className="text-center text-white/30 py-8 text-sm">No questions match your search. Try different keywords.</p>
            ) : (
              filteredItems.map((item) => (
                <FAQItem key={item.index} question={item.question} answer={item.answer}
                  isOpen={openIndex === item.index} onToggle={() => setOpenIndex(openIndex === item.index ? null : item.index)} />
              ))
            )}
          </div>
          <div className="mt-6 text-center">
            <a href="mailto:info@rido.bike" className="inline-flex items-center gap-2 text-sm text-rido-magenta hover:text-rido-magenta-light transition-colors cursor-pointer">
              <Mail className="w-4 h-4" /> Still have questions? Email info@rido.bike
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
