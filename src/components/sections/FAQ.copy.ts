import type { Locale } from "@/lib/i18n/config";
import type { Category } from "@/data/faq";

// Server-side copy: pages pass the active locale's object (and FAQ list) to
// <FAQ>, so each page's JS carries one language only.
export type CategoryFilter = "all" | Category;

export interface FaqCopy {
  sectionAria: string;
  label: string;
  title: string;
  intro: string;
  categories: Record<CategoryFilter, string>;
  noResults: string;
  showAllBefore: string;
  showAllAfter: string;
  stillQuestions: string;
}

export const faqCopy = {
  en: {
    sectionAria: "Frequently asked questions",
    label: "FAQ",
    title: "Questions, answered",
    intro: "Pricing, safety, rules and everything else about riding with Rido.",
    categories: {
      all: "All",
      "getting-started": "Getting started",
      pricing: "Pricing",
      safety: "Safety",
      legal: "Legal",
    },
    noResults: "No questions in this category yet.",
    showAllBefore: "Show all",
    showAllAfter: "questions",
    stillQuestions: "Still have questions? Email info@rido.bike",
  },
  es: {
    sectionAria: "Preguntas frecuentes",
    label: "Preguntas frecuentes",
    title: "Resolvemos tus dudas",
    intro: "Precios, seguridad, normas y todo lo demás para moverte con Rido.",
    categories: {
      all: "Todas",
      "getting-started": "Primeros pasos",
      pricing: "Precios",
      safety: "Seguridad",
      legal: "Legal",
    },
    noResults: "Todavía no hay preguntas en esta categoría.",
    showAllBefore: "Ver las",
    showAllAfter: "preguntas",
    stillQuestions: "¿Sigues con dudas? Escríbenos a info@rido.bike",
  },
} as const satisfies Record<Locale, FaqCopy>;
