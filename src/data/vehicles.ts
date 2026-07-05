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
  imageAlt: string;
}

/** The user-visible, translatable strings of a Vehicle. */
export type VehicleCopy = Pick<
  Vehicle,
  "tagline" | "description" | "specs" | "features" | "imageAlt"
>;

export const vehicles: Vehicle[] = [
  {
    id: "e-scooter",
    name: "Rido Scooter",
    type: "e-scooter",
    tagline: "Glide through the city",
    description:
      "Our top-tier e-scooter with a wide deck, powerful brakes, and up to 45 km of range. Built for urban explorers who demand safety and style.",
    specs: [
      { label: "Range", value: "45 km" },
      { label: "Top Speed", value: "25 km/h" },
      { label: "Weight Limit", value: "120 kg" },
      { label: "Battery", value: "Swappable" },
    ],
    features: [
      "Helmet provided",
      "Front and rear lights",
      "Dual brakes (front + rear)",
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
  },
  {
    id: "e-bike",
    name: "Rido Bike",
    type: "e-bike",
    tagline: "Pedal further, effort less",
    description:
      "Our electric-assist bike with smooth pedal support, an adjustable saddle, and a sturdy front basket. Perfect for longer commutes and carrying essentials.",
    specs: [
      { label: "Range", value: "60 km" },
      { label: "Assist Speed", value: "25 km/h" },
      { label: "Weight Limit", value: "130 kg" },
      { label: "Battery", value: "Swappable" },
    ],
    features: [
      "Electric pedal assist",
      "Adjustable saddle height",
      "Front cargo basket",
      "Integrated lights",
      "Puncture-resistant tires",
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
  },
];

// Spanish copy, parallel to `vehicles` and keyed by vehicle id. English
// lives on the Vehicle objects above — they are also consumed by the
// English-only JSON-LD schemas in src/lib/schema.ts, so their shape
// must not change.
const vehicleCopyEs: Record<VehicleId, VehicleCopy> = {
  "e-scooter": {
    tagline: "Deslízate por la ciudad",
    description:
      "Nuestro patinete eléctrico de primera con plataforma ancha, frenos potentes y hasta 45 km de autonomía. Hecho para exploradores urbanos que exigen seguridad y estilo.",
    specs: [
      { label: "Autonomía", value: "45 km" },
      { label: "Velocidad máxima", value: "25 km/h" },
      { label: "Peso máximo", value: "120 kg" },
      { label: "Batería", value: "Intercambiable" },
    ],
    features: [
      "Casco incluido",
      "Luces delantera y trasera",
      "Freno doble (delantero + trasero)",
      "Intermitentes",
      "Modo principiante (15 km/h)",
      "GPS y geovallado",
    ],
    imageAlt: "Patinete eléctrico Rido",
  },
  "e-bike": {
    tagline: "Pedalea más lejos con menos esfuerzo",
    description:
      "Nuestra bici con asistencia eléctrica, pedaleo suave, sillín ajustable y una cesta delantera resistente. Perfecta para trayectos largos y para llevar lo esencial.",
    specs: [
      { label: "Autonomía", value: "60 km" },
      { label: "Velocidad asistida", value: "25 km/h" },
      { label: "Peso máximo", value: "130 kg" },
      { label: "Batería", value: "Intercambiable" },
    ],
    features: [
      "Pedaleo asistido eléctrico",
      "Sillín de altura ajustable",
      "Cesta de carga delantera",
      "Luces integradas",
      "Neumáticos antipinchazos",
      "Cuadro de acceso bajo",
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