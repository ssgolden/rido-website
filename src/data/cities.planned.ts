/**
 * Planned towns that are NOT announced yet.
 *
 * Nothing on the site may import this file: src/data/cities.ts ships to every
 * visitor's browser, this list must not. scripts/check-town-leak.mjs reads
 * this file and fails CI if any name or slug below appears in the static
 * export, and if the count per region disagrees with `plannedTowns` in
 * cities.ts.
 *
 * Announcement day: move the town into `announcedCities` in cities.ts and
 * lower its region's `plannedTowns` count.
 */
import type { City } from "./cities";

export const plannedCities: City[] = [
  { name: "Marbella", region: "Costa del Sol", isoRegion: "ES-MA", slug: "marbella", lat: 36.5099, lng: -4.8862, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "San Pedro de Alcántara", region: "Costa del Sol", isoRegion: "ES-MA", slug: "san-pedro-de-alcantara", lat: 36.4872, lng: -4.9911, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "Cancelada", region: "Costa del Sol", isoRegion: "ES-MA", slug: "cancelada", lat: 36.4616, lng: -5.0524, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "Estepona", region: "Costa del Sol", isoRegion: "ES-MA", slug: "estepona", lat: 36.4275, lng: -5.1456, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "El Paraíso", region: "Costa del Sol", isoRegion: "ES-MA", slug: "el-paraiso", lat: 36.4728, lng: -5.0335, vehicles: ["e-scooter"], comingSoon: true },
];
