import type { Locale } from "@/lib/i18n/config";

// Server-side copy for the How it works phone mock-up (passed down as props).
const en = {
  findNearby: "Find a Rido near you",
  createAccount: "Create your account",
  firstInLine: "Be first in line at launch",
  signUp: "Sign up",
  scanToUnlock: "Scan to unlock",
  pointAtQr: "Point at the QR code",
  onHandlebar: "On the handlebar of any Rido",
  riding: "Riding",
  cruising: "Cruising",
  endRide: "End ride",
  parkAndEnd: "Park & end",
  parkingZone: "Designated parking zone",
  rideComplete: "Ride complete",
  payForUse: "Pay only for what you used",
  rideTime: "Ride time",
  distance: "Distance",
  done: "Done",
  illustrative: "Illustrative app preview",
};

export type PhoneCopy = typeof en;

export const phoneCopy: Record<Locale, PhoneCopy> = {
  en,
  es: {
    findNearby: "Encuentra un Rido cerca",
    createAccount: "Crea tu cuenta",
    firstInLine: "Sé de los primeros en el lanzamiento",
    signUp: "Regístrate",
    scanToUnlock: "Escanea para desbloquear",
    pointAtQr: "Apunta al código QR",
    onHandlebar: "En el manillar de cualquier Rido",
    riding: "En marcha",
    cruising: "Ritmo de crucero",
    endRide: "Terminar viaje",
    parkAndEnd: "Aparca y termina",
    parkingZone: "Zona de aparcamiento",
    rideComplete: "Viaje terminado",
    payForUse: "Paga solo por lo que uses",
    rideTime: "Tiempo",
    distance: "Distancia",
    done: "Listo",
    illustrative: "Vista ilustrativa de la app",
  },
};
