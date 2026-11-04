import type { Locale } from "@/lib/i18n/config";
import { vehicles, getVehicleCopy, type Vehicle, type VehicleCopy } from "@/data/vehicles";
import { liveCities } from "@/data/cities";

// Server-side copy: pages pass the active locale's object and fleet to
// <Vehicles>, so each page's JS carries one language only.
// Vehicle-specific copy (taglines, descriptions, specs, features) lives in src/data/vehicles.ts.
const en = {
  ariaLabel: "Our vehicles",
  label: "The fleet",
  title: "Meet the Rido e-scooter",
  tabsLabel: "Choose a vehicle",
  badgeScooter: "E-scooter",
  badgeBike: "E-bike · coming later",
  /** Tab suffix for a vehicle not riding in any live town yet. */
  later: "Later",
  imageUnavailable: "Image unavailable",
  /** {name} and {n} are filled in by the component. */
  thumbAlt: "{name} view {n}",
  specsLabel: "Specifications",
  featuresLabel: "Included",
};

export type VehiclesCopy = typeof en;

export const vehiclesCopy: Record<Locale, VehiclesCopy> = {
  en,
  es: {
    ariaLabel: "Nuestros vehículos",
    label: "La flota",
    title: "Conoce el patinete Rido",
    tabsLabel: "Elige un vehículo",
    badgeScooter: "Patinete eléctrico",
    badgeBike: "Bici eléctrica · más adelante",
    later: "Más adelante",
    imageUnavailable: "Imagen no disponible",
    thumbAlt: "{name}, vista {n}",
    specsLabel: "Especificaciones",
    featuresLabel: "Incluye",
  },
};

/** What <Vehicles> renders per vehicle: identity, images and one locale's copy. */
export type FleetItem = Pick<Vehicle, "id" | "name" | "type" | "cutouts"> & VehicleCopy & { later: boolean };

export function getFleet(locale: Locale): FleetItem[] {
  return vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    type: v.type,
    cutouts: v.cutouts,
    ...getVehicleCopy(v, locale),
    later: !liveCities.some((c) => c.vehicles.includes(v.id)),
  }));
}
