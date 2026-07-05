"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BatteryMedium,
  Bike,
  CheckCircle2,
  Gauge,
  MapPin,
  ParkingCircle,
  QrCode,
  Route,
  Search,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

interface ScreenProps {
  reduced: boolean;
}

/* Stylized product visualizations — deliberately illustrative, not fake
   app screenshots. Pure CSS/Tailwind + lucide icons in the brand look. */

function ScreenLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="absolute top-12 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-weak">
      {children}
    </p>
  );
}

/* Step 1 — Sign up: map with nearby pins + create-account card */
function MapScreen() {
  const pins = [
    { top: "26%", left: "22%" },
    { top: "38%", left: "62%" },
    { top: "56%", left: "38%" },
  ];
  return (
    <div className="absolute inset-0 bg-rido-navy">
      {/* map grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      {/* stylized roads */}
      <div className="absolute -left-10 top-[34%] w-[150%] h-7 bg-white/[0.04] -rotate-12" />
      <div className="absolute -left-10 top-[60%] w-[150%] h-4 bg-white/[0.04] rotate-6" />
      {/* pins */}
      {pins.map((pin) => (
        <div key={`${pin.top}-${pin.left}`} className="absolute -translate-x-1/2 -translate-y-full" style={pin}>
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-6 h-6 rounded-full bg-rido-magenta/25 animate-pulse-slow" />
          <MapPin className="relative w-5 h-5 text-rido-magenta fill-rido-magenta/30" />
        </div>
      ))}
      {/* search pill */}
      <div className="absolute top-11 left-4 right-4 h-9 rounded-full glass flex items-center gap-2 px-4">
        <Search className="w-3.5 h-3.5 text-muted" />
        <span className="text-[11px] text-muted">Find a Rido near you</span>
      </div>
      {/* sign-up card */}
      <div className="absolute bottom-5 left-4 right-4 rounded-2xl glass-strong p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rido-magenta/20 flex items-center justify-center shrink-0">
            <Bike className="w-4.5 h-4.5 text-rido-magenta" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white">Create your account</p>
            <p className="text-[10px] text-muted">Be first in line at launch</p>
          </div>
        </div>
        <div className="mt-3 h-8 rounded-lg bg-rido-magenta flex items-center justify-center text-[11px] font-semibold text-white">
          Sign up
        </div>
      </div>
    </div>
  );
}

/* Step 2 — Scan & Unlock: QR scan frame with sweeping scan line */
function ScanScreen({ reduced }: ScreenProps) {
  const scanLine = (
    <div className="absolute left-2 right-2 top-1/2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-rido-magenta to-transparent" />
  );
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-rido-navy-light to-rido-navy">
      <ScreenLabel>Scan to unlock</ScreenLabel>
      {/* scan frame */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-36 h-36">
        <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-rido-magenta rounded-tl-xl" />
        <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-rido-magenta rounded-tr-xl" />
        <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-rido-magenta rounded-bl-xl" />
        <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-rido-magenta rounded-br-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <QrCode className="w-14 h-14 text-white/25" />
        </div>
        {reduced ? (
          scanLine
        ) : (
          <motion.div
            aria-hidden="true"
            animate={{ y: [-52, 52, -52] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-1/2"
          >
            {scanLine}
          </motion.div>
        )}
      </div>
      {/* helper card */}
      <div className="absolute bottom-5 left-4 right-4 rounded-2xl glass-strong p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rido-magenta/20 flex items-center justify-center shrink-0">
          <QrCode className="w-4.5 h-4.5 text-rido-magenta" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-white">Point at the QR code</p>
          <p className="text-[10px] text-muted">On the handlebar of any Rido</p>
        </div>
      </div>
    </div>
  );
}

/* Step 3 — Ride: live riding stats with a route trace */
function RideScreen() {
  return (
    <div className="absolute inset-0 bg-rido-navy">
      <ScreenLabel>Riding</ScreenLabel>
      {/* speed */}
      <div className="absolute top-[18%] left-0 right-0 flex flex-col items-center">
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-black text-white">17</span>
          <span className="text-xs font-semibold text-muted">km/h</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-rido-magenta-light">
          <Gauge className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold">Cruising</span>
        </div>
      </div>
      {/* route trace */}
      <svg
        viewBox="0 0 200 80"
        className="absolute top-[42%] left-4 right-4 w-[calc(100%-2rem)] h-20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 66 C 55 20, 110 88, 190 18"
          stroke="#DE0498"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="7 7"
          opacity="0.8"
        />
        <circle cx="10" cy="66" r="4" fill="#DE0498" />
        <circle cx="190" cy="18" r="4" fill="#F23DB5" />
      </svg>
      {/* stat tiles */}
      <div className="absolute bottom-[4.5rem] left-4 right-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl glass p-2.5 flex flex-col items-center gap-1">
          <Route className="w-4 h-4 text-rido-magenta" />
          <span className="text-[11px] font-bold text-white">2.4 km</span>
        </div>
        <div className="rounded-xl glass p-2.5 flex flex-col items-center gap-1">
          <Timer className="w-4 h-4 text-rido-magenta" />
          <span className="text-[11px] font-bold text-white">12:36</span>
        </div>
        <div className="rounded-xl glass p-2.5 flex flex-col items-center gap-1">
          <BatteryMedium className="w-4 h-4 text-rido-green" />
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-rido-green" />
          </div>
        </div>
      </div>
      {/* end-ride pill */}
      <div className="absolute bottom-5 left-4 right-4 h-9 rounded-xl border border-white/15 flex items-center justify-center text-[11px] font-semibold text-muted-strong">
        End ride
      </div>
    </div>
  );
}

/* Step 4 — Park & End: designated parking zone + ride-complete check */
function ParkScreen() {
  return (
    <div className="absolute inset-0 bg-rido-navy">
      <ScreenLabel>Park &amp; end</ScreenLabel>
      {/* parking zone */}
      <div className="absolute top-[17%] left-6 right-6 h-36 rounded-2xl border-2 border-dashed border-rido-magenta/50 bg-rido-magenta/[0.06] flex flex-col items-center justify-center gap-2">
        <ParkingCircle className="w-8 h-8 text-rido-magenta" />
        <span className="text-[10px] font-semibold text-muted-strong">Designated parking zone</span>
        <Bike className="w-4 h-4 text-muted" />
      </div>
      {/* ride complete */}
      <div className="absolute bottom-[5.5rem] left-4 right-4 rounded-2xl glass-strong p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-rido-green shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-white">Ride complete</p>
            <p className="text-[10px] text-muted">Pay only for what you used</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted">Ride time</span>
            <span className="h-2 w-10 rounded-full bg-white/15" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted">Distance</span>
            <span className="h-2 w-8 rounded-full bg-white/15" />
          </div>
        </div>
      </div>
      {/* done pill */}
      <div className="absolute bottom-5 left-4 right-4 h-9 rounded-xl bg-rido-magenta flex items-center justify-center text-[11px] font-semibold text-white">
        Done
      </div>
    </div>
  );
}

const SCREENS: { key: string; Component: React.ComponentType<ScreenProps> }[] = [
  { key: "map", Component: MapScreen },
  { key: "scan", Component: ScanScreen },
  { key: "ride", Component: RideScreen },
  { key: "park", Component: ParkScreen },
];

export const PHONE_SCREEN_COUNT = SCREENS.length;

interface PhoneMockupProps {
  /** Index of the active step/screen (0–3). Clamped internally. */
  activeStep: number;
  className?: string;
}

/**
 * Decorative CSS phone mockup whose screen crossfades to match the active
 * How-It-Works step. Same frame language as the DownloadCTA mockup
 * (280×560, rounded-[40px], notch) but built independently.
 * Purely decorative — always render with the surrounding step copy visible.
 */
export function PhoneMockup({ activeStep, className }: PhoneMockupProps) {
  const reduced = useReducedMotion() ?? false;
  const active = Math.min(SCREENS.length - 1, Math.max(0, activeStep));

  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      <div className="relative w-[260px] h-[520px] lg:w-[280px] lg:h-[560px] rounded-[40px] border-4 border-white/20 bg-rido-navy shadow-2xl shadow-rido-magenta/20 overflow-hidden">
        {/* notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-rido-navy rounded-b-[20px] z-20" />
        {SCREENS.map(({ key, Component }, i) => (
          <motion.div
            key={key}
            className="absolute inset-0 pointer-events-none"
            initial={false}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
          >
            <Component reduced={reduced} />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 -z-10 rounded-[40px] bg-rido-magenta/20 blur-3xl scale-125" />
      <p className="mt-4 text-center text-[11px] text-muted-weak">Illustrative app preview</p>
    </div>
  );
}
