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
  { name: "Marbella", region: "Costa del Sol", slug: "marbella", lat: 36.5099, lng: -4.8862, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "San Pedro de Alcántara", region: "Costa del Sol", slug: "san-pedro-de-alcantara", lat: 36.4872, lng: -4.9911, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "Cancelada", region: "Costa del Sol", slug: "cancelada", lat: 36.4616, lng: -5.0524, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "Estepona", region: "Costa del Sol", slug: "estepona", lat: 36.4275, lng: -5.1456, vehicles: ["e-scooter", "e-bike"], comingSoon: true },
  { name: "El Paraíso", region: "Costa del Sol", slug: "el-paraiso", lat: 36.4728, lng: -5.0335, vehicles: ["e-scooter"], comingSoon: true },
];

export const activeCityCount = cities.filter((c) => !c.comingSoon).length;