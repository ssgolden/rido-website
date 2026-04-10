# Rido Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, enterprise-grade frontend website for Rido — a shared micro-mobility business in Spain — to drive brand awareness and app downloads.

**Architecture:** Next.js 15 App Router with React 19, TypeScript, and Tailwind CSS 4. Dark-mode-first cinematic design. Static generation for performance. Bilingual ES/EN support.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, Framer Motion, Lucide React, Inter font

---

## Task 1: Project Scaffold & Configuration

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd "C:\Users\steph\OneDrive\Desktop\Rido"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Accept defaults. This creates the full scaffold.

- [ ] **Step 2: Verify scaffold runs**

```bash
npm run dev
```

Expected: `localhost:3000` loads with Next.js default page.

- [ ] **Step 3: Install additional dependencies**

```bash
npm install framer-motion lucide-react
```

- [ ] **Step 4: Configure Tailwind with Rido brand tokens**

Replace `tailwind.config.ts` content:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        rido: {
          coral: "#FF6B4A",
          "coral-dark": "#E5553A",
          navy: "#1A1F36",
          "navy-light": "#2A2F4A",
          gold: "#FFB84D",
          green: "#2DD4BF",
          cloud: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 74, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 107, 74, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Set up globals.css with dark-mode defaults**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 248 250 252;
    --foreground: 15 23 42;
  }

  .dark {
    --background: 15 23 42;
    --foreground: 248 250 252;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-rido-navy text-white font-sans antialiased;
  }
}

@layer utilities {
  .text-gradient-coral {
    @apply bg-gradient-to-r from-rido-coral to-rido-gold bg-clip-text text-transparent;
  }

  .glass {
    @apply bg-white/5 backdrop-blur-xl border border-white/10;
  }

  .glass-strong {
    @apply bg-white/10 backdrop-blur-2xl border border-white/20;
  }
}
```

- [ ] **Step 6: Configure layout.tsx with dark mode and Inter font**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Rido — Shared E-Scooters & E-Bikes in Spain",
  description:
    "Move freely across Spain with Rido's shared e-scooters and e-bikes. Download the app, scan, and ride. Zero emissions, zero hassle.",
  keywords: [
    "rido", "e-scooter", "e-bike", "shared mobility", "Spain",
    "electric scooter", "electric bike", "micromobility", "rent scooter",
  ],
  openGraph: {
    title: "Rido — Shared E-Scooters & E-Bikes in Spain",
    description: "Move freely across Spain with Rido's shared e-scooters and e-bikes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Create utility file**

Create `src/lib/utils.ts`:

```typescript
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 8: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit scaffold**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 project with Rido brand tokens"
```

---

## Task 2: UI Component Library

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/AnimatedCounter.tsx`

- [ ] **Step 1: Write failing test for Button component**

Create `src/components/ui/__tests__/Button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Download App</Button>);
    expect(screen.getByText("Download App")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalled();
  });

  it("applies primary variant styles", () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByText("Primary");
    expect(btn.className).toContain("bg-rido-coral");
  });

  it("applies secondary variant styles", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByText("Secondary");
    expect(btn.className).toContain("glass");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/ui/__tests__/Button.test.tsx
```

Expected: FAIL — module not found

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest
```

Create `jest.config.ts`:

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
```

Create `jest.setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Implement Button component**

Create `src/components/ui/Button.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer",
          "hover:scale-105 active:scale-95",
          variant === "primary" &&
            "bg-rido-coral hover:bg-rido-coral-dark text-white shadow-lg shadow-rido-coral/25",
          variant === "secondary" &&
            "glass text-white hover:bg-white/15",
          variant === "outline" &&
            "border-2 border-rido-coral text-rido-coral hover:bg-rido-coral/10",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --run src/components/ui/__tests__/Button.test.tsx
```

Expected: PASS

- [ ] **Step 6: Implement Badge component**

Create `src/components/ui/Badge.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "coral" | "green" | "gold" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        variant === "coral" && "bg-rido-coral/15 text-rido-coral border border-rido-coral/25",
        variant === "green" && "bg-rido-green/15 text-rido-green border border-rido-green/25",
        variant === "gold" && "bg-rido-gold/15 text-rido-gold border border-rido-gold/25",
        variant === "default" && "bg-white/10 text-white/80 border border-white/15",
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 7: Implement Card component**

Create `src/components/ui/Card.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        hover && "transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-rido-coral/5 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 8: Implement AnimatedCounter component**

Create `src/components/ui/AnimatedCounter.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
```

- [ ] **Step 9: Run full test suite**

```bash
npm test -- --run
```

Expected: All tests pass.

- [ ] **Step 10: Commit UI library**

```bash
git add .
git commit -m "feat: add Button, Badge, Card, AnimatedCounter UI components with tests"
```

---

## Task 3: Data Layer

**Files:**
- Create: `src/data/cities.ts`
- Create: `src/data/vehicles.ts`
- Create: `src/data/pricing.ts`

- [ ] **Step 1: Create cities data**

Create `src/data/cities.ts`:

```typescript
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
export const totalCityCount = cities.length;
```

- [ ] **Step 2: Create vehicles data**

Create `src/data/vehicles.ts`:

```typescript
export interface Vehicle {
  id: string;
  name: string;
  type: "e-scooter" | "e-bike";
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  features: string[];
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
    imageAlt: "Rido e-scooter in a Spanish city",
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
    imageAlt: "Rido e-bike on a Mediterranean street",
  },
];
```

- [ ] **Step 3: Create pricing data**

Create `src/data/pricing.ts`:

```typescript
export interface PricingTier {
  name: string;
  description: string;
  unlockFee: string;
  perMinute: string;
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Pay as you go",
    description: "No commitment. Ride when you need it.",
    unlockFee: "€0.50",
    perMinute: "€0.15/min",
  },
  {
    name: "Rido Pass",
    description: "Unlimited unlocks + reduced per-minute rate.",
    unlockFee: "Free",
    perMinute: "€0.10/min",
    popular: true,
  },
  {
    name: "Day Pass",
    description: "Unlimited rides for 24 hours.",
    unlockFee: "Free",
    perMinute: "Included",
  },
];

export const noSurpriseGuarantees = [
  "No minimum top-up required",
  "No hidden fees after your ride",
  "Free refund of unused balance",
  "Exact pricing shown before every ride",
];
```

- [ ] **Step 4: Commit data layer**

```bash
git add src/data/
git commit -m "feat: add cities, vehicles, and pricing data layers"
```

---

## Task 4: Navbar & Footer Layout

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write failing test for Navbar**

Create `src/components/layout/__tests__/Navbar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Navbar } from "../Navbar";

describe("Navbar", () => {
  it("renders the Rido brand name", () => {
    render(<Navbar />);
    expect(screen.getByText("Rido")).toBeInTheDocument();
  });

  it("renders a download button", () => {
    render(<Navbar />);
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("Vehicles")).toBeInTheDocument();
    expect(screen.getByText("Cities")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --run src/components/layout/__tests__/Navbar.test.tsx
```

- [ ] **Step 3: Implement Navbar component**

Create `src/components/layout/Navbar.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/Button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Vehicles", href: "#vehicles" },
  { label: "Cities", href: "#cities" },
  { label: "Safety", href: "#safety" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-4 left-4 right-4 z-50 rounded-2xl px-6 py-3 transition-all duration-300",
        scrolled ? "glass-strong shadow-lg" : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <a href="#" className="text-2xl font-black tracking-tight text-white">
          Rido<span className="text-rido-coral">.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-rido-coral transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Button size="sm">Download</Button>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-white/70 hover:text-rido-coral transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4">
            <Button size="sm" className="w-full">Download</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --run src/components/layout/__tests__/Navbar.test.tsx
```

- [ ] **Step 5: Implement Footer component**

Create `src/components/layout/Footer.tsx`:

```tsx
import { cn } from "@/lib/utils";

const footerLinks = {
  Product: [
    { label: "E-Scooter", href: "#vehicles" },
    { label: "E-Bike", href: "#vehicles" },
    { label: "Pricing", href: "#pricing" },
    { label: "Cities", href: "#cities" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Safety", href: "#safety" },
    { label: "Sustainability", href: "#sustainability" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-rido-navy">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-2xl font-black text-white">
              Rido<span className="text-rido-coral">.</span>
            </p>
            <p className="mt-3 text-sm text-white/50 leading-relaxed">
              Shared micro-mobility for Spain.<br />
              Move freely. Ride responsibly.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-rido-coral transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Rido. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30">ES</span>
            <span className="text-xs text-white/50 font-semibold">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Wire up page.tsx with layout**

Replace `src/app/page.tsx`:

```tsx
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Sections will be added in subsequent tasks */}
        <div className="h-screen flex items-center justify-center">
          <h1 className="text-4xl font-black text-gradient-coral">Rido</h1>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 7: Verify dev server renders layout**

```bash
npm run dev
```

Expected: Navbar and Footer visible with brand styling.

- [ ] **Step 8: Commit layout components**

```bash
git add .
git commit -m "feat: add Navbar and Footer layout components"
```

---

## Task 5: Hero Section

**Files:**
- Create: `src/components/sections/Hero.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Hero section**

Create `src/components/sections/Hero.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rido-navy via-rido-navy to-rido-coral/20" />
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-rido-coral/10 blur-3xl" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-rido-green/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <Badge variant="coral" className="mb-6">
          Now available across Spain
        </Badge>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]">
          Move{" "}
          <span className="text-gradient-coral">Freely</span>
          <br />
          Across Spain
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          Shared e-scooters and e-bikes in Spain&apos;s most vibrant cities.
          Download the app, scan, and ride. Zero emissions, zero hassle.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="animate-pulse-glow">
            Download the App
          </Button>
          <Button variant="secondary" size="lg">
            See How It Works
          </Button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-12 text-white/40">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">8+</p>
            <p className="text-sm">Cities</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">2</p>
            <p className="text-sm">Vehicle Types</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-sm">Emissions</p>
          </div>
        </div>
      </div>

      <a
        href="#how-it-works"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
}
```

- [ ] **Step 2: Add Hero to page.tsx**

Modify `src/app/page.tsx` to import and render `<Hero />` between Navbar and the placeholder.

- [ ] **Step 3: Verify Hero renders**

```bash
npm run dev
```

Expected: Full-screen cinematic hero with gradient, tagline, stats, and CTAs.

- [ ] **Step 4: Commit Hero section**

```bash
git add .
git commit -m "feat: add cinematic Hero section with gradient and CTAs"
```

---

## Task 6: How It Works Section

**Files:**
- Create: `src/components/sections/HowItWorks.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement HowItWorks section**

Create `src/components/sections/HowItWorks.tsx` with 3 animated steps: Download & Create → Scan & Unlock → Ride & Park. Use Framer Motion for staggered reveal. Each step gets a numbered circle, icon (Lucide), title, description, and connecting dotted line between steps.

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Verify section renders in browser**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add How It Works section with 3-step animated flow"
```

---

## Task 7: Vehicles Section

**Files:**
- Create: `src/components/sections/Vehicles.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Vehicles section**

Create `src/components/sections/Vehicles.tsx` using the `vehicles` data from `src/data/vehicles.ts`. Render two glass cards (one for E-Scooter, one for E-Bike), each showing: name, tagline, description, spec grid (Range, Speed, Weight, Battery), and feature list with checkmark icons. Add a tab toggle or side-by-side layout. Use Framer Motion for hover expansion.

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Verify section renders**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add Vehicles section with e-scooter and e-bike showcase"
```

---

## Task 8: Cities Section

**Files:**
- Create: `src/components/sections/Cities.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Cities section**

Create `src/components/sections/Cities.tsx` using the `cities` data. Display an interactive grid/map of Spanish cities where Rido operates. Each city card shows: city name, region, available vehicle badges ("E-Scooter", "E-Bike"), and a "Coming Soon" badge for future cities. Add a subtle Spanish map outline or coordinate-based dot map as background.

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Verify section renders**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add Cities section with interactive city grid"
```

---

## Task 9: Safety Section

**Files:**
- Create: `src/components/sections/Safety.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Safety section**

Create `src/components/sections/Safety.tsx` with 4 safety principles in glass cards: Helmet First, Ride Solo, Stay Sober, Park Responsibly. Each card gets a Lucide icon, title, and description. Add a "Beginner Mode" callout with explanation (speed capped at 15 km/h for first 5 rides). Include a stat bar: "99.7% safe rides" or similar.

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Verify section renders**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add Safety section with principles and beginner mode callout"
```

---

## Task 10: Sustainability Section

**Files:**
- Create: `src/components/sections/Sustainability.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Sustainability section**

Create `src/components/sections/Sustainability.tsx` using `AnimatedCounter` to show live-impact stats: "X tonnes CO₂ saved", "X car trips replaced", "X km ridden emission-free". Add a green gradient background accent. Include 3 commitment cards: Carbon Neutral Operations, Swappable Batteries, Responsible Recycling.

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Verify section renders**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add Sustainability section with animated counters"
```

---

## Task 11: Pricing Section

**Files:**
- Create: `src/components/sections/Pricing.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Pricing section**

Create `src/components/sections/Pricing.tsx` using the `pricingTiers` data. Render 3 pricing cards (Pay as you go, Rido Pass, Day Pass) with the "popular" tier highlighted with a coral border and "Most Popular" badge. Below the cards, show the no-surprise guarantee list with green checkmark icons. Include a note: "Exact pricing shown before every ride. No surprises."

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Verify section renders**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add Pricing section with transparent tiers and no-surprise guarantees"
```

---

## Task 12: About, Download CTA & Final Assembly

**Files:**
- Create: `src/components/sections/About.tsx`
- Create: `src/components/sections/DownloadCTA.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement About section**

Create `src/components/sections/About.tsx` with company story: "Born in Spain, built for Spanish cities." Include mission statement, and 3 value pillars (Freedom, Safety, Sustainability). Clean, story-driven layout.

- [ ] **Step 2: Implement Download CTA section**

Create `src/components/sections/DownloadCTA.tsx` with a full-width gradient background (navy → coral), large headline "Ready to Ride?", subtext, and two large App Store / Google Play download buttons. Make the CTA impossible to miss.

- [ ] **Step 3: Assemble full page.tsx**

Replace `src/app/page.tsx` with all sections in order:

```tsx
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Vehicles } from "@/components/sections/Vehicles";
import { Cities } from "@/components/sections/Cities";
import { Safety } from "@/components/sections/Safety";
import { Sustainability } from "@/components/sections/Sustainability";
import { Pricing } from "@/components/sections/Pricing";
import { About } from "@/components/sections/About";
import { DownloadCTA } from "@/components/sections/DownloadCTA";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Vehicles />
        <Cities />
        <Safety />
        <Sustainability />
        <Pricing />
        <About />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Verify full page renders end-to-end**

```bash
npm run dev
```

Expected: All 10 sections render in order with smooth scrolling.

- [ ] **Step 5: Run build to verify no errors**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit final assembly**

```bash
git add .
git commit -m "feat: complete Rido website with all sections assembled"
```

---

## Task 13: Polish & Performance

**Files:**
- Modify: Various section components for animation refinement
- Modify: `next.config.ts` for optimization

- [ ] **Step 1: Add smooth scroll-triggered animations**

Wrap each section's content in a Framer Motion `motion.div` with `whileInView` for fade-in and slide-up effects. Use `viewport={{ once: true, margin: "-100px" }}` for performance.

- [ ] **Step 2: Add responsive design QA**

Test at 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop). Fix any overflow, text truncation, or layout breaks.

- [ ] **Step 3: Optimize images and fonts**

Ensure `next/font` is used for Inter. Add `next/image` placeholders for any future images. Verify Lighthouse score targets:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

- [ ] **Step 4: Run Lighthouse audit**

```bash
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

Expected: All scores 90+.

- [ ] **Step 5: Commit polish**

```bash
git add .
git commit -m "feat: polish animations, responsive design, and performance optimization"
```

---

## Task 14: Deployment

**Files:**
- Create: `vercel.json` (if needed)

- [ ] **Step 1: Deploy to Vercel**

```bash
npx vercel
```

Follow prompts. Link to Git repository for automatic deployments.

- [ ] **Step 2: Verify production deployment**

Check the deployed URL. Verify:
- All sections render correctly
- Mobile navigation works
- Smooth scrolling works
- All links functional
- Meta tags present (check with `view-source:`)

- [ ] **Step 3: Commit deployment config**

```bash
git add .
git commit -m "feat: deploy to Vercel with production configuration"
```

---

## Execution Summary

| Task | Component | Estimated Steps |
|------|-----------|----------------|
| 1 | Scaffold & Config | 9 |
| 2 | UI Library | 10 |
| 3 | Data Layer | 4 |
| 4 | Navbar & Footer | 8 |
| 5 | Hero Section | 4 |
| 6 | How It Works | 4 |
| 7 | Vehicles | 4 |
| 8 | Cities | 4 |
| 9 | Safety | 4 |
| 10 | Sustainability | 4 |
| 11 | Pricing | 4 |
| 12 | About + Download CTA + Assembly | 6 |
| 13 | Polish & Performance | 5 |
| 14 | Deployment | 3 |
| **Total** | | **73 steps** |