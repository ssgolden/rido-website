import type { Locale } from "@/lib/i18n/config";

// Server-side copy: pages pass the active locale's object to <HowItWorks>,
// so each page's JS carries one language only.
const en = {
  ariaLabel: "How it works",
  label: "How it works",
  title: "Join, scan, ride, park. That's it.",
  stepsLabel: "Steps",
  /** {n} and {title} are filled in by the component. */
  goTo: "Go to step {n}: {title}",
  steps: [
    { title: "Sign up early", description: "Join the waitlist now and be first in line when the Rido app launches. Create your account in seconds when it's ready." },
    { title: "Scan & unlock", description: "Find a Rido nearby on the map, scan the QR code on the handlebar, and you're ready to roll." },
    { title: "Ride & enjoy", description: "Follow traffic rules, use cycle lanes and enjoy the ride. Helmet on — it's the law, and we include one." },
    { title: "Park & end ride", description: "Park responsibly in designated areas shown in the app. End your ride and pay only for what you used." },
  ],
};

export type HowItWorksCopy = typeof en;

export const howItWorksCopy: Record<Locale, HowItWorksCopy> = {
  en,
  es: {
    ariaLabel: "Cómo funciona",
    label: "Cómo funciona",
    title: "Apúntate, escanea, monta, aparca. Así de fácil.",
    stepsLabel: "Pasos",
    goTo: "Ir al paso {n}: {title}",
    steps: [
      { title: "Apúntate ya", description: "Únete ya a la lista de espera y sé de los primeros cuando llegue la app de Rido. Crea tu cuenta en segundos cuando esté lista." },
      { title: "Escanea y desbloquea", description: "Encuentra un Rido cerca en el mapa, escanea el código QR del manillar y listo: ya puedes circular." },
      { title: "Monta y disfruta", description: "Respeta las normas de tráfico, usa los carriles bici y disfruta del trayecto. Casco puesto: es obligatorio y lo incluimos." },
      { title: "Aparca y termina", description: "Aparca de forma responsable en las zonas indicadas en la app. Termina el trayecto y paga solo por lo que uses." },
    ],
  },
};
