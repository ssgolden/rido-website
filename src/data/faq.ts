export type Category = "getting-started" | "pricing" | "safety" | "legal";

export const faqItems = [
  {
    question: "What age do I need to be to ride a Rido?",
    answer:
      "You must be at least 18 years old to ride a Rido e-scooter or e-bike. You'll need to verify your age when creating an account in the app.",
    category: "getting-started" as Category,
  },
  {
    question: "How do I find and unlock a Rido vehicle?",
    answer:
      "Open the Rido app, find a vehicle near you on the map, scan the QR code on the handlebar, and you're ready to ride. The app shows real-time availability and battery levels.",
    category: "getting-started" as Category,
  },
  {
    question: "Do I need a driver's license?",
    answer:
      "For e-scooters: no license is required in most Spanish cities for speeds up to 25 km/h. For e-bikes: no license is required as they are classified as pedal-assist bicycles under Spanish law. Always check local regulations.",
    category: "getting-started" as Category,
  },
  {
    question: "What happens if I damage a vehicle?",
    answer:
      "You are responsible for up to €2,000 in damage as outlined in our Terms of Service. We recommend riding carefully and parking responsibly. Our tandem detection system monitors for misuse.",
    category: "legal" as Category,
  },
  {
    question: "Can I ride in bike lanes?",
    answer:
      "Yes! In Spain, e-scooters and e-bikes are permitted in bike lanes and on roads with speed limits up to 30 km/h. Always avoid sidewalks and pedestrian zones.",
    category: "safety" as Category,
  },
  {
    question: "Where do I park when I'm done?",
    answer:
      "Park in designated areas shown in the app. These are typically bike rack zones or marked parking areas. Keep sidewalks clear for pedestrians and accessibility.",
    category: "safety" as Category,
  },
  {
    question: "Do I need to wear a helmet?",
    answer:
      "We strongly recommend wearing a helmet for every ride. In many Spanish cities, helmets are legally required for e-scooter riders. We include a helmet with every scooter and offer helmet rewards in the app.",
    category: "safety" as Category,
  },
  {
    question: "How much does it cost?",
    answer:
      "Pay As You Go: €1.00 unlock + €0.35 per minute. Rido Pass: Free unlock + €0.25 per minute. Day Pass: €14.99 for unlimited 24-hour rides. No minimum top-up, no hidden fees.",
    category: "pricing" as Category,
  },
  {
    question: "What is the Rido Pass?",
    answer:
      "The Rido Pass gives you free unlocks and a reduced per-minute rate of €0.25/min (instead of €0.35/min). It's perfect for frequent riders who want to save on every ride.",
    category: "pricing" as Category,
  },
  {
    question: "Can I get a refund for unused balance?",
    answer:
      "Yes! We offer free refunds of unused balance. No minimum top-up required, and you can request a refund at any time through the app. See our Terms of Service for details.",
    category: "pricing" as Category,
  },
  {
    question: "What if the battery dies during my ride?",
    answer:
      "Our app shows real-time battery levels so you can choose a fully charged vehicle. If a battery runs low during your ride, you can end it at any designated parking area — no extra charge.",
    category: "safety" as Category,
  },
  {
    question: "Is my ride insured?",
    answer:
      "Yes, every Rido ride includes basic insurance coverage. Our e-scooters and e-bikes are insured against third-party liability. For full details, see our Terms of Service.",
    category: "legal" as Category,
  },
];