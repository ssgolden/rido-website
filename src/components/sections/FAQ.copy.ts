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
  searchPlaceholder: string;
  searchAria: string;
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
    searchPlaceholder: "Search questions…",
    searchAria: "Search frequently asked questions",
    categories: {
      all: "All",
      "getting-started": "Getting started",
      pricing: "Pricing",
      safety: "Safety",
      legal: "Legal",
    },
    noResults: "No questions match your search. Try different keywords.",
    showAllBefore: "Show all",
    showAllAfter: "questions",
    stillQuestions: "Still have questions? Email info@rido.bike",
  },
  es: {
    sectionAria: "Preguntas frecuentes",
    label: "Preguntas frecuentes",
    title: "Resolvemos tus dudas",
    intro: "Precios, seguridad, normas y todo lo demás para moverte con Rido.",
    searchPlaceholder: "Busca una pregunta…",
    searchAria: "Buscar en las preguntas frecuentes",
    categories: {
      all: "Todas",
      "getting-started": "Primeros pasos",
      pricing: "Precios",
      safety: "Seguridad",
      legal: "Legal",
    },
    noResults: "Ninguna pregunta coincide con tu búsqueda. Prueba con otras palabras.",
    showAllBefore: "Ver las",
    showAllAfter: "preguntas",
    stillQuestions: "¿Sigues con dudas? Escríbenos a info@rido.bike",
  },
} as const satisfies Record<Locale, FaqCopy>;
