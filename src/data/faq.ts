import type { Locale } from "@/lib/i18n/config";

export type Category = "getting-started" | "pricing" | "safety" | "legal";

/** A user-visible string pair — the type forces EN and ES to stay in sync. */
interface LocalizedString {
  en: string;
  es: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: Category;
}

interface FaqSource {
  question: LocalizedString;
  answer: LocalizedString;
  category: Category;
}

/**
 * Single source of truth for FAQ content. Both locales live side by side so a
 * question can never be added or edited in one language only.
 */
const faqSources: readonly FaqSource[] = [
  {
    question: {
      en: "What age do I need to be to ride a Rido?",
      es: "¿Qué edad necesito para montar en un Rido?",
    },
    answer: {
      en: "You must be at least 18 years old to ride a Rido e-scooter or e-bike. You'll need to verify your age when creating an account in the app.",
      es: "Debes tener al menos 18 años para montar en un patinete o bici eléctrica de Rido. Tendrás que verificar tu edad al crear tu cuenta en la app.",
    },
    category: "getting-started",
  },
  {
    question: {
      en: "How do I find and unlock a Rido vehicle?",
      es: "¿Cómo encuentro y desbloqueo un vehículo de Rido?",
    },
    answer: {
      en: "Open the Rido app, find a vehicle near you on the map, scan the QR code on the handlebar, and you're ready to ride. The app shows real-time availability and battery levels.",
      es: "Abre la app de Rido, localiza un vehículo cerca de ti en el mapa, escanea el código QR del manillar y listo para rodar. La app muestra la disponibilidad y el nivel de batería en tiempo real.",
    },
    category: "getting-started",
  },
  {
    question: {
      en: "Do I need a driver's license?",
      es: "¿Necesito carné de conducir?",
    },
    answer: {
      en: "No. In Spain no licence is required for e-scooters limited to 25 km/h (personal mobility vehicles, VMP) or for pedal-assist e-bikes, which the law treats as bicycles. You must be at least 18 to ride with Rido.",
      es: "No. En España no se necesita carné para patinetes eléctricos limitados a 25 km/h (vehículos de movilidad personal, VMP) ni para bicis de pedaleo asistido, que la ley considera bicicletas. Para usar Rido debes tener al menos 18 años.",
    },
    category: "getting-started",
  },
  {
    question: {
      en: "What happens if I damage a vehicle?",
      es: "¿Qué pasa si daño un vehículo?",
    },
    answer: {
      en: "You are responsible for up to €2,000 in damage as outlined in our Terms of Service. We recommend riding carefully and parking responsibly. Our tandem detection system monitors for misuse.",
      es: "Eres responsable de hasta 2.000 € en daños, tal y como recogen nuestros Términos de Servicio. Te recomendamos conducir con cuidado y aparcar de forma responsable. Nuestro sistema de detección de tándem vigila el uso indebido.",
    },
    category: "legal",
  },
  {
    question: {
      en: "Can I ride in bike lanes?",
      es: "¿Puedo circular por el carril bici?",
    },
    answer: {
      en: "Yes! In Spain, e-scooters and e-bikes are permitted in bike lanes and on roads with speed limits up to 30 km/h. Always avoid sidewalks and pedestrian zones.",
      es: "¡Sí! En España, los patinetes y las bicis eléctricas pueden circular por carriles bici y por vías con límite de hasta 30 km/h. Evita siempre las aceras y las zonas peatonales.",
    },
    category: "safety",
  },
  {
    question: {
      en: "Where do I park when I'm done?",
      es: "¿Dónde aparco al terminar?",
    },
    answer: {
      en: "Park in designated areas shown in the app. These are typically bike rack zones or marked parking areas. Keep sidewalks clear for pedestrians and accessibility.",
      es: "Aparca en las zonas designadas que muestra la app, normalmente aparcamientos de bicis o zonas señalizadas. Deja las aceras libres para los peatones y la accesibilidad.",
    },
    category: "safety",
  },
  {
    question: {
      en: "Do I need to wear a helmet?",
      es: "¿Tengo que llevar casco?",
    },
    answer: {
      en: "Yes on e-scooters: from 1 October 2026 helmet use is mandatory for e-scooter (VMP) riders across Spain. We include a helmet with every scooter and offer helmet rewards in the app. On e-bikes a helmet is strongly recommended.",
      es: "Sí, en patinete: desde el 1 de octubre de 2026 el casco es obligatorio en toda España para quienes conducen un VMP. Incluimos un casco con cada patinete y ofrecemos recompensas por usarlo en la app. En bici eléctrica es muy recomendable.",
    },
    category: "safety",
  },
  {
    question: {
      en: "How much does it cost?",
      es: "¿Cuánto cuesta?",
    },
    answer: {
      en: "Fares will be announced at launch. What won't change: you'll always see the price before every ride, with no minimum top-up and no hidden fees.",
      es: "Las tarifas se anunciarán en el lanzamiento. Lo que no cambia: siempre verás el precio antes de cada trayecto, sin recarga mínima ni costes ocultos.",
    },
    category: "pricing",
  },
  {
    question: {
      en: "What is the Rido Pass?",
      es: "¿Qué es el Rido Pass?",
    },
    answer: {
      en: "The Rido Pass is our rider membership — free unlocks and a reduced per-minute rate for frequent riders. Exact pricing will be announced at launch.",
      es: "El Rido Pass es nuestra suscripción para usuarios frecuentes: desbloqueos gratis y una tarifa por minuto reducida. El precio exacto se anunciará en el lanzamiento.",
    },
    category: "pricing",
  },
  {
    question: {
      en: "Can I get a refund for unused balance?",
      es: "¿Puedo recuperar el saldo que no use?",
    },
    answer: {
      en: "Yes! We offer free refunds of unused balance. No minimum top-up required, and you can request a refund at any time through the app. See our Terms of Service for details.",
      es: "¡Sí! Devolvemos el saldo no utilizado de forma gratuita. No hay recarga mínima y puedes solicitar el reembolso en cualquier momento desde la app. Consulta nuestros Términos de Servicio para más detalles.",
    },
    category: "pricing",
  },
  {
    question: {
      en: "What if the battery dies during my ride?",
      es: "¿Y si la batería se agota durante mi trayecto?",
    },
    answer: {
      en: "Our app shows real-time battery levels so you can choose a fully charged vehicle. If a battery runs low during your ride, you can end it at any designated parking area — no extra charge.",
      es: "La app muestra el nivel de batería en tiempo real para que elijas un vehículo con carga completa. Si la batería se queda baja durante el trayecto, puedes terminarlo en cualquier zona de aparcamiento designada, sin coste extra.",
    },
    category: "safety",
  },
  {
    question: {
      en: "Is my ride insured?",
      es: "¿Está asegurado mi trayecto?",
    },
    answer: {
      en: "Yes, every Rido ride includes basic insurance coverage. Our e-scooters and e-bikes are insured against third-party liability. For full details, see our Terms of Service.",
      es: "Sí, cada trayecto con Rido incluye una cobertura de seguro básica. Nuestros patinetes y bicis eléctricas están asegurados frente a responsabilidad civil. Para más detalles, consulta nuestros Términos de Servicio.",
    },
    category: "legal",
  },
];

function resolveFaqItems(locale: Locale): FaqItem[] {
  return faqSources.map((item) => ({
    question: item.question[locale],
    answer: item.answer[locale],
    category: item.category,
  }));
}

/** Per-locale FAQ lists — `Record<Locale, ...>` forces every locale to exist. */
export const faqItemsByLocale: Record<Locale, FaqItem[]> = {
  en: resolveFaqItems("en"),
  es: resolveFaqItems("es"),
};

/**
 * Canonical English list. Kept as the default export shape so the JSON-LD
 * FAQPage schema (src/lib/schema.ts) keeps emitting English on the EN page.
 */
export const faqItems: FaqItem[] = faqItemsByLocale.en;
