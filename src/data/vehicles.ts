export interface Vehicle {
  id: string;
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
      "Front and rear lights",
      "Phone holder with charging",
      "Dual brakes (front + rear)",
      "Turn signals",
      "Beginner mode (15 km/h)",
      "GPS tracking & geofencing",
    ],
    image: "/images/scooter/rido-scooter-product.jpg",
    images: ["/images/scooter/rido-scooter-product.jpg"],
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