import type { Locale } from "@/lib/i18n/config";
import { primaryCity } from "@/data/cities";
import { vehicles } from "@/data/vehicles";

// Server-side copy: pages pass the active locale's object to <Hero>, so each
// page's JS carries one language only.
const town = primaryCity?.name ?? "Torrevieja";

const en = {
  locale: "en" as Locale,
  liveKicker: "Download the app and ride today",
  badge: `Now riding in ${town}`,
  /** Last `highlightCount` words in solid brand magenta: the town. */
  headlineWords: ["Shared", "e-scooters", "in", `${town}.`],
  highlightCount: 1,
  subheadline:
    "Move freely along the coast. Shared e-scooters, run by people who live here. Cheaper than a taxi, cleaner than a rental car. Live now in Torrevieja on the Costa Blanca — the Costa del Sol is next.",
  /** Phones: the headline already names the product and the town, so one line. */
  subheadlineShort: "Live now. Cheaper than a taxi, cleaner than a rental car.",
  microcopy: "Free to download. You see the price before every ride.",
  secondary: "See how it works",
  imageAlt: "The Rido e-scooter in brand magenta, with its helmet docked on the stem",
  chipsLabel: "Highlights",
  chips: ["Helmet included", "DGT certified", `Live in ${town}`],
};

export type HeroCopy = typeof en;

export const heroCopy: Record<Locale, HeroCopy> = {
  en,
  es: {
    locale: "es",
    liveKicker: "Descarga la app y monta hoy",
    badge: `Ya en ${town}`,
    headlineWords: ["Patinetes", "eléctricos", "compartidos", "en", `${town}.`],
    highlightCount: 1,
    subheadline:
      "Muévete libre por la costa. Patinetes eléctricos compartidos, gestionados por gente que vive aquí. Más barato que un taxi, más limpio que un coche de alquiler. Ya disponibles en Torrevieja, en la Costa Blanca — la Costa del Sol, después.",
    subheadlineShort: "Ya disponibles. Más barato que un taxi, más limpio que un coche de alquiler.",
    microcopy: "Descarga gratuita. Ves el precio antes de cada trayecto.",
    secondary: "Cómo funciona",
    imageAlt: "El patinete eléctrico Rido en magenta, con el casco acoplado en la barra",
    chipsLabel: "Lo esencial",
    chips: ["Casco incluido", "Certificado DGT", `Ya en ${town}`],
  },
};

/** Hero product image (a cut-out path; Hero applies withBase() at render time). */
export const heroImage = vehicles[0].cutouts[0];
