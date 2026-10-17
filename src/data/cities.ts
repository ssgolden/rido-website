export type LaunchRegion = "Costa Blanca" | "Costa del Sol";

export interface City {
  name: string;
  region: LaunchRegion;
  /** ISO 3166-2 province code, used for the geo.region meta tag. */
  isoRegion: "ES-A" | "ES-MA";
  slug: string;
  lat: number;
  lng: number;
  vehicles: ("e-scooter" | "e-bike")[];
  comingSoon?: boolean;
}

/**
 * Towns that may be named publicly. This module is imported by client
 * components, so everything in it ships to every visitor's browser: only
 * announced towns belong here.
 *
 * Planned, unannounced towns live in ./cities.planned.ts, which no page or
 * component imports. Every export build (scripts/check-town-leak.mjs) fails if any
 * of their names or slugs appear in the static export.
 *
 * To announce a town: move its entry from cities.planned.ts into this list,
 * lower the matching `plannedTowns` count below, then hand-edit
 * public/llms.txt and public/llms-full.txt (static files this list cannot
 * reach).
 */
export const announcedCities: City[] = [
  // Costa Blanca — first launch.
  { name: "Torrevieja", region: "Costa Blanca", isoRegion: "ES-A", slug: "torrevieja", lat: 37.9787, lng: -0.6822, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
];

/** Planned towns per region whose names are not public yet (counts only). */
export const plannedTowns: { region: LaunchRegion; count: number }[] = [{ region: "Costa del Sol", count: 5 }];

/** Regions with at least one planned town that is not yet announced. */
export const regionsWithUnannouncedTowns: LaunchRegion[] = plannedTowns.filter((r) => r.count > 0).map((r) => r.region);

/** Number of not-yet-announced towns planned in a region. */
export const plannedTownCount = (region: LaunchRegion): number =>
  plannedTowns.find((r) => r.region === region)?.count ?? 0;

/** The first announced town; drives homepage geo meta and JSON-LD geo. */
export const primaryCity: City | undefined = announcedCities[0];
