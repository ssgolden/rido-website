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
  /**
   * Announcement switch, per town. While false, the town's name, card, map
   * marker, landing page, sitemap entry and JSON-LD stay hidden; only its
   * region name appears publicly. Flip to true on that town's announcement day.
   *
   * NOTE: public/llms.txt and public/llms-full.txt are static files this flag
   * cannot reach — update their "Cities" sections by hand when you flip it.
   */
  announced: boolean;
}

export const cities: City[] = [
  // Costa Blanca — first launch, announced.
  { name: "Torrevieja", region: "Costa Blanca", isoRegion: "ES-A", slug: "torrevieja", lat: 37.9787, lng: -0.6822, vehicles: ["e-scooter", "e-bike"], comingSoon: true, announced: true },
  // Costa del Sol — planned, town names not yet announced.
  { name: "Marbella", region: "Costa del Sol", isoRegion: "ES-MA", slug: "marbella", lat: 36.5099, lng: -4.8862, vehicles: ["e-scooter", "e-bike"], comingSoon: true, announced: false },
  { name: "San Pedro de Alcántara", region: "Costa del Sol", isoRegion: "ES-MA", slug: "san-pedro-de-alcantara", lat: 36.4872, lng: -4.9911, vehicles: ["e-scooter", "e-bike"], comingSoon: true, announced: false },
  { name: "Cancelada", region: "Costa del Sol", isoRegion: "ES-MA", slug: "cancelada", lat: 36.4616, lng: -5.0524, vehicles: ["e-scooter", "e-bike"], comingSoon: true, announced: false },
  { name: "Estepona", region: "Costa del Sol", isoRegion: "ES-MA", slug: "estepona", lat: 36.4275, lng: -5.1456, vehicles: ["e-scooter", "e-bike"], comingSoon: true, announced: false },
  { name: "El Paraíso", region: "Costa del Sol", isoRegion: "ES-MA", slug: "el-paraiso", lat: 36.4728, lng: -5.0335, vehicles: ["e-scooter"], comingSoon: true, announced: false },
];

/** Towns that may be named publicly. Every public surface reads this, never `cities`. */
export const announcedCities: City[] = cities.filter((c) => c.announced);

/** Regions with at least one planned town that is not yet announced. */
export const regionsWithUnannouncedTowns: LaunchRegion[] = [
  ...new Set(cities.filter((c) => !c.announced).map((c) => c.region)),
];

/** The first announced town; drives homepage geo meta and JSON-LD geo. */
export const primaryCity: City | undefined = announcedCities[0];

export const activeCityCount = cities.filter((c) => !c.comingSoon).length;
