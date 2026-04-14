export interface City {
  name: string;
  region: string;
  slug: string;
  lat: number;
  lng: number;
  vehicles: ("e-scooter" | "e-bike")[];
  comingSoon?: boolean;
}

export const cities: City[] = [
  { name: "Marbella", region: "Costa del Sol", slug: "marbella", lat: 36.5099, lng: -4.8862, vehicles: ["e-scooter", "e-bike"] },
  { name: "San Pedro de Alcántara", region: "Costa del Sol", slug: "san-pedro-de-alcantara", lat: 36.5942, lng: -4.9955, vehicles: ["e-scooter", "e-bike"] },
  { name: "Cancelada", region: "Costa del Sol", slug: "cancelada", lat: 36.4473, lng: -5.0755, vehicles: ["e-scooter", "e-bike"] },
  { name: "Estepona", region: "Costa del Sol", slug: "estepona", lat: 36.4275, lng: -5.1456, vehicles: ["e-scooter", "e-bike"] },
  { name: "El Paraíso", region: "Costa del Sol", slug: "el-paraiso", lat: 36.4642, lng: -5.0149, vehicles: ["e-scooter"] },
];

export const activeCityCount = cities.filter((c) => !c.comingSoon).length;