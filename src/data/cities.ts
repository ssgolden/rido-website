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
  { name: "Madrid", region: "Comunidad de Madrid", slug: "madrid", lat: 40.4168, lng: -3.7038, vehicles: ["e-scooter", "e-bike"] },
  { name: "Barcelona", region: "Cataluña", slug: "barcelona", lat: 41.3851, lng: 2.1734, vehicles: ["e-scooter", "e-bike"] },
  { name: "Valencia", region: "Comunidad Valenciana", slug: "valencia", lat: 39.4699, lng: -0.3763, vehicles: ["e-scooter", "e-bike"] },
  { name: "Sevilla", region: "Andalucía", slug: "sevilla", lat: 37.3891, lng: -5.9845, vehicles: ["e-scooter", "e-bike"] },
  { name: "Málaga", region: "Andalucía", slug: "malaga", lat: 36.7213, lng: -4.4214, vehicles: ["e-scooter", "e-bike"] },
  { name: "Bilbao", region: "País Vasco", slug: "bilbao", lat: 43.263, lng: -2.935, vehicles: ["e-scooter"] },
  { name: "Palma", region: "Islas Baleares", slug: "palma", lat: 39.5696, lng: 2.6502, vehicles: ["e-scooter", "e-bike"] },
  { name: "Alicante", region: "Comunidad Valenciana", slug: "alicante", lat: 38.3452, lng: -0.481, vehicles: ["e-scooter", "e-bike"] },
  { name: "Zaragoza", region: "Aragón", slug: "zaragoza", lat: 41.6488, lng: -0.8891, vehicles: ["e-scooter"], comingSoon: true },
];

export const activeCityCount = cities.filter((c) => !c.comingSoon).length;