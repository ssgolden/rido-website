import type { Locale } from "@/lib/i18n/config";
import { vehicles, getVehicleCopy, type Vehicle, type VehicleCopy } from "@/data/vehicles";

// Server-side copy: pages pass the active locale's object and fleet to
// <Vehicles>, so each page's JS carries one language only.
// Vehicle-specific copy (taglines, descriptions, specs, features) lives in src/data/vehicles.ts.
const en = {
  ariaLabel: "Our vehicles",
  label: "The fleet",
  title: "Choose your ride",
  tabsLabel: "Choose a vehicle",
  badgeScooter: "E-scooter",
  badgeBike: "E-bike",
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
    title: "Elige tu vehículo",
    tabsLabel: "Elige un vehículo",
    badgeScooter: "Patinete eléctrico",
    badgeBike: "Bici eléctrica",
    imageUnavailable: "Imagen no disponible",
    thumbAlt: "{name}, vista {n}",
    specsLabel: "Especificaciones",
    featuresLabel: "Incluye",
  },
};

/** What <Vehicles> renders per vehicle: identity, images and one locale's copy. */
export type FleetItem = Pick<Vehicle, "id" | "name" | "type" | "cutouts"> & VehicleCopy;

export function getFleet(locale: Locale): FleetItem[] {
  return vehicles.map((v) => ({ id: v.id, name: v.name, type: v.type, cutouts: v.cutouts, ...getVehicleCopy(v, locale) }));
}
