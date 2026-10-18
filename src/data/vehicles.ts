import type { Locale } from "@/lib/i18n/config";

export type VehicleId = "e-scooter" | "e-bike";

export interface Vehicle {
  id: VehicleId;
  name: string;
  type: "e-scooter" | "e-bike";
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  features: string[];
  image: string;
  images: string[];
  /** Transparent cut-outs of `images`, same order (public/images/cutouts). Used on the site; JSON-LD keeps `image`. */
  cutouts: string[];
  imageAlt: string;
}

/** The user-visible, translatable strings of a Vehicle. */
export type VehicleCopy = Pick<
  Vehicle,
  "tagline" | "description" | "specs" | "features" | "imageAlt"
>;

/** "/images/scooter/x.jpg" -> "/images/cutouts/x.webp". Pure string; call withBase() at render time. */
const toCutout = (path: string) => path.replace(/^\/images\/[^/]+\/(.+)\.[a-z]+$/, "/images/cutouts/$1.webp");

const defineVehicle = (v: Omit<Vehicle, "cutouts">): Vehicle => ({ ...v, cutouts: v.images.map(toCutout) });

export const vehicles: Vehicle[] = [
  defineVehicle({
    id: "e-scooter",
    name: "Rido Scooter",
    type: "e-scooter",
    tagline: "Glide through the city",
    description:
      "A wide deck, brakes front and rear and up to 45 km of range, with a certified helmet docked on the stem. Made for getting around town.",
    specs: [
      { label: "Range", value: "45 km" },
      { label: "Top speed", value: "25 km/h" },
      { label: "Weight limit", value: "120 kg" },
      { label: "Battery", value: "Swappable" },
    ],
    features: [
      "Helmet provided",
      "DGT certified — Spain's new 2026 VMP rules",
      "Registered fleet with ID sticker",
      "Civil liability insurance included",
      "Anti-tampering motor, 25 km/h by design",
      "Front and rear lights, brake light and reflectors",
      "Dual brakes (front + rear)",
      "≥203 mm puncture-resistant wheels",
      "Turn signals",
      "Beginner mode (15 km/h)",
      "GPS tracking & geofencing",
    ],
    image: "/images/scooter/rido-scooter-product.jpg",
    images: [
      "/images/scooter/rido-scooter-product.jpg",
      "/images/scooter/rido-scooter-three-quarter-helmet.jpeg",
      "/images/scooter/rido-scooter-side-helmet.jpeg",
      "/images/scooter/rido-scooter-handlebars.jpeg",
    ],
    imageAlt: "Rido e-scooter",
  }),
  defineVehicle({
    id: "e-bike",
    name: "Rido Bike",
    type: "e-bike",
    tagline: "Go further with less effort",
    description:
      "Smooth electric pedal assist, an adjustable saddle and a sturdy front basket. Made for longer trips and the weekly shop.",
    specs: [
      { label: "Range", value: "60 km" },
      { label: "Assist speed", value: "25 km/h" },
      { label: "Weight limit", value: "130 kg" },
      { label: "Battery", value: "Swappable" },
    ],
    features: [
      "Electric pedal assist",
      "Civil liability insurance included",
      "Front and rear integrated lights and reflectors",
      "Adjustable saddle height",
      "Front cargo basket",
      "Puncture-resistant tyres",
      "Step-through frame design",
    ],
    image: "/images/bike/rido-bike-side.jpg",
    images: [
      "/images/bike/rido-bike-front.jpg",
      "/images/bike/rido-bike-side.jpg",
      "/images/bike/rido-bike-detail.jpg",
      "/images/bike/rido-bike-lifestyle.jpg",
    ],
    imageAlt: "Rido e-bike electric-assist bicycle",
  }),
];

// Spanish copy, parallel to `vehicles` and keyed by vehicle id. English
// lives on the Vehicle objects above — they are also consumed by the
// English-only JSON-LD schemas in src/lib/schema.ts, so their shape
// must not change.
const vehicleCopyEs: Record<VehicleId, VehicleCopy> = {
  "e-scooter": {
    tagline: "Deslízate por la ciudad",
    description:
      "Plataforma ancha, frenos delantero y trasero y hasta 45 km de autonomía, con un casco certificado acoplado en la barra. Pensado para moverte por la ciudad.",
    specs: [
      { label: "Autonomía", value: "45 km" },
      { label: "Velocidad máxima", value: "25 km/h" },
      { label: "Peso máximo", value: "120 kg" },
      { label: "Batería", value: "Intercambiable" },
    ],
    features: [
      "Casco incluido",
      "Certificado DGT — nueva normativa VMP 2026",
      "Flota inscrita con etiqueta identificativa",
      "Seguro de responsabilidad civil incluido",
      "Motor antimanipulación, 25 km/h de fábrica",
      "Luces delantera y trasera, luz de freno y catadióptricos",
      "Freno doble (delantero + trasero)",
      "Ruedas antipinchazos de ≥203 mm",
      "Intermitentes",
      "Modo principiante (15 km/h)",
      "GPS y geofencing",
    ],
    imageAlt: "Patinete eléctrico Rido",
  },
  "e-bike": {
    tagline: "Pedalea más lejos con menos esfuerzo",
    description:
      "Pedaleo asistido suave, sillín ajustable y una cesta delantera resistente. Pensada para trayectos más largos y para hacer la compra.",
    specs: [
      { label: "Autonomía", value: "60 km" },
      { label: "Velocidad asistida", value: "25 km/h" },
      { label: "Peso máximo", value: "130 kg" },
      { label: "Batería", value: "Intercambiable" },
    ],
    features: [
      "Pedaleo asistido eléctrico",
      "Seguro de responsabilidad civil incluido",
      "Luces integradas delanteras y traseras con catadióptricos",
      "Sillín de altura ajustable",
      "Cesta de carga delantera",
      "Neumáticos antipinchazos",
      "Cuadro abierto (step-through)",
    ],
    imageAlt: "Bici eléctrica de pedaleo asistido Rido",
  },
};

/**
 * Returns the vehicle's user-visible copy for the given locale.
 * For "en" this is a verbatim view of the Vehicle's own fields.
 */
export function getVehicleCopy(vehicle: Vehicle, locale: Locale): VehicleCopy {
  if (locale === "es") return vehicleCopyEs[vehicle.id];
  return {
    tagline: vehicle.tagline,
    description: vehicle.description,
    specs: vehicle.specs,
    features: vehicle.features,
    imageAlt: vehicle.imageAlt,
  };
}