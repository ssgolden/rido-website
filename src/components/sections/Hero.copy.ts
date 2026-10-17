import type { Locale } from "@/lib/i18n/config";
import { primaryCity } from "@/data/cities";
import { vehicles } from "@/data/vehicles";

// Server-side copy: pages pass the active locale's object to <Hero>, so each
// page's JS carries one language only.
const town = primaryCity?.name ?? "Torrevieja";

const en = {
  waitlistKicker: "Waitlist now open",
  waitlistSingular: "{count} person on the waitlist",
  waitlistPlural: "{count} people on the waitlist",
  badge: `Launching soon in ${town}`,
  /** Last `highlightCount` words get the brand gradient — the only gradient text on the page. */
  headlineWords: ["Move", "freely", "along", "the", "coast."],
  highlightCount: 2,
  subheadline:
    "Shared e-scooters and e-bikes, run by people who live here. Cheaper than a taxi, cleaner than a rental car. Launching first in Torrevieja on the Costa Blanca — the Costa del Sol is next.",
  /** Phones: the badge above already says where we launch, so the intro stops before it. */
  subheadlineShort: "Shared e-scooters and e-bikes, run by people who live here. Cheaper than a taxi, cleaner than a rental car.",
  microcopy: "No spam. One email when we launch near you.",
  secondary: "See how it works",
  imageAlt: "The Rido e-scooter in brand magenta, with its helmet docked on the stem",
  chipsLabel: "Highlights",
  chips: ["Helmet included", "DGT certified", `${town} launch`],
};

export type HeroCopy = typeof en;

export const heroCopy: Record<Locale, HeroCopy> = {
  en,
  es: {
    waitlistKicker: "Lista de espera abierta",
    waitlistSingular: "{count} persona en la lista de espera",
    waitlistPlural: "{count} personas en la lista de espera",
    badge: `Muy pronto en ${town}`,
    headlineWords: ["Muévete", "libre", "por", "la", "costa."],
    highlightCount: 2,
    subheadline:
      "Patinetes y bicis eléctricas compartidas, gestionadas por gente que vive aquí. Más barato que un taxi, más limpio que un coche de alquiler. Arrancamos en Torrevieja, en la Costa Blanca — la Costa del Sol, después.",
    subheadlineShort:
      "Patinetes y bicis eléctricas compartidas, gestionadas por gente que vive aquí. Más barato que un taxi, más limpio que un coche de alquiler.",
    microcopy: "Sin spam. Un correo cuando lleguemos a tu zona.",
    secondary: "Cómo funciona",
    imageAlt: "El patinete eléctrico Rido en magenta, con el casco acoplado en la barra",
    chipsLabel: "Lo esencial",
    chips: ["Casco incluido", "Certificado DGT", `Lanzamiento en ${town}`],
  },
};

/** Hero product image (a cut-out path; Hero applies withBase() at render time). */
export const heroImage = vehicles[0].cutouts[0];
