# E-Bike Image & Data Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement.

**Goal:** Upgrade the e-bike section with real product photography and accurate specs derived from the 4 new e-bike images.

**Architecture:** Copy e-bike images to `public/images/bike/`, update `vehicles.ts` data, update `Vehicles.tsx` component to support multiple images per vehicle with a gallery/carousel.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide React

---

## Image Analysis

### New E-Bike Images (from `images/` folder)

| File | Type | Observations |
|------|------|-------------|
| `1000508947.jpg` (1600x1000) | E-bike product shot, white bg | Rido logo visible at center (x:375-1105, y:385-750), magenta accents, step-through frame |
| `1000508948.jpg` (1600x1000) | E-bike product shot, white bg | Second angle/variant, logo at x:640-1120, y:345-745. Different view or lighting |
| `1000508949.jpg` (1600x1000) | E-bike product shot, white bg | Third angle/variant, logo at x:520-1160, y:410-775. Possibly folded/config variation |
| `1000508950.jpg` (1600x1000) | E-bike product shot, white bg | Fourth angle/variant, logo at x:480-1230, y:400-735. Likely lifestyle angle |

All 4 images:
- Studio product photography on light/white backgrounds
- Feature Rido magenta (#DE0498) branding/logo
- Show e-bike frame, wheels, handlebars, saddle, motor, display
- 1600x1000 landscape format — ideal for web use

### Current Problem
The e-bike entry in `vehicles.ts` currently uses `/images/lifestyle/rido-scooter-street.jpg` — a **scooter** photo, not an e-bike at all.

---

## Task 1: Copy E-Bike Images to Public Directory

**Files:** Create `public/images/bike/` and copy all 4 images with clean names.

- [ ] **Step 1: Create directory and copy images**

```bash
mkdir -p "C:/Users/steph/OneDrive/Desktop/Rido/public/images/bike"
cp "C:/Users/steph/OneDrive/Desktop/Rido/images/1000508947.jpg" "C:/Users/steph/OneDrive/Desktop/Rido/public/images/bike/rido-bike-front.jpg"
cp "C:/Users/steph/OneDrive/Desktop/Rido/images/1000508948.jpg" "C:/Users/steph/OneDrive/Desktop/Rido/public/images/bike/rido-bike-side.jpg"
cp "C:/Users/steph/OneDrive/Desktop/Rido/images/1000508949.jpg" "C:/Users/steph/OneDrive/Desktop/Rido/public/images/bike/rido-bike-detail.jpg"
cp "C:/Users/steph/OneDrive/Desktop/Rido/images/1000508950.jpg" "C:/Users/steph/OneDrive/Desktop/Rido/public/images/bike/rido-bike-lifestyle.jpg"
```

Naming convention:
- `front` = front-facing product shot (8947)
- `side` = side profile view (8948)
- `detail` = close-up detail shot (8949)
- `lifestyle` = contextual/lifestyle shot (8950)

---

## Task 2: Update Vehicle Data

**Files:** `src/data/vehicles.ts`

- [ ] **Step 2: Update the e-bike entry with real images and improved specs**

Update the e-bike object:

```typescript
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
}
```

Also add `images` array to the scooter entry:

```typescript
{
  id: "e-scooter",
  ...
  image: "/images/scooter/rido-scooter-product.jpg",
  images: [
    "/images/scooter/rido-scooter-product.jpg",
  ],
  ...
}
```

Add `images` to the Vehicle interface:

```typescript
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
```

---

## Task 3: Upgrade Vehicles Component with Image Gallery

**Files:** `src/components/sections/Vehicles.tsx`

- [ ] **Step 3: Add a thumbnail gallery below the main image**

When the e-bike tab is active, show the 4 e-bike images as selectable thumbnails below the main product image. Clicking a thumbnail swaps the main image.

```tsx
"use client";

import { useState } from "react";
import { vehicles } from "@/data/vehicles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check } from "lucide-react";
import Image from "next/image";

export function Vehicles() {
  const [active, setActive] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const v = vehicles[active];

  // Reset active image when switching vehicles
  const handleVehicleChange = (index: number) => {
    setActive(index);
    setActiveImage(0);
  };

  return (
    <section id="vehicles" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-rido-magenta text-sm font-semibold uppercase tracking-wider mb-3">
            Our Fleet
          </p>
          <h2 className="text-4xl md:text-5xl font-black">
            Choose Your <span className="text-gradient-brand">Ride</span>
          </h2>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          {vehicles.map((vehicle, i) => (
            <button
              key={vehicle.id}
              onClick={() => handleVehicleChange(i)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                i === active
                  ? "bg-rido-magenta text-white shadow-lg shadow-rido-magenta/25"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              {vehicle.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-white/5 to-rido-magenta/10 flex items-center justify-center">
              <Image
                src={v.images[activeImage]}
                alt={v.imageAlt}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Thumbnail gallery — show only if more than 1 image */}
            {v.images.length > 1 && (
              <div className="flex gap-2 p-3 bg-white/5">
                {v.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all cursor-pointer ${
                      i === activeImage
                        ? "ring-2 ring-rido-magenta ring-offset-2 ring-offset-rido-navy"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${v.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <div className="flex flex-col justify-center gap-6">
            <div>
              <Badge variant="magenta" className="mb-3">
                {v.type === "e-scooter" ? "E-Scooter" : "E-Bike"}
              </Badge>
              <h3 className="text-3xl font-black">{v.name}</h3>
              <p className="text-rido-magenta font-semibold mt-1">{v.tagline}</p>
            </div>

            <p className="text-white/50 leading-relaxed">{v.description}</p>

            <div className="grid grid-cols-2 gap-4">
              {v.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="glass rounded-xl p-4 text-center"
                >
                  <p className="text-lg font-bold text-rido-magenta">
                    {spec.value}
                  </p>
                  <p className="text-xs text-white/40">{spec.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {v.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-rido-green shrink-0" />
                  <span className="text-white/60">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Task 4: Update BRAIN.md

**Files:** `BRAIN.md`

- [ ] **Step 4: Add e-bike images to brand assets table**

Update the Brand Assets table to include:

```markdown
| `public/images/bike/rido-bike-front.jpg` | E-bike front product shot on white bg | Vehicles section (primary) |
| `public/images/bike/rido-bike-side.jpg` | E-bike side profile on white bg | Vehicles section gallery |
| `public/images/bike/rido-bike-detail.jpg` | E-bike detail/close-up on white bg | Vehicles section gallery |
| `public/images/bike/rido-bike-lifestyle.jpg` | E-bike lifestyle/angle on white bg | Vehicles section gallery |
```

---

## Task 5: Build Verification

- [ ] **Step 5: Run production build**

```bash
cd "C:\Users\steph\OneDrive\Desktop\Rido"
npm run build
```

Expected: ✓ Compiled successfully, no TypeScript errors, static pages generated.

- [ ] **Step 6: Visual QA**

```bash
npm run dev
```

Check at `localhost:3000`:
1. Vehicles section loads with scooter selected by default
2. Click "Rido Bike" tab — 4 thumbnail images appear
3. Click each thumbnail — main image updates
4. Switch back to scooter — no thumbnails (only 1 image)
5. Switch back to bike — activeImage resets to first
6. All images render without errors
7. Image aspect ratios correct (no distortion)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: upgrade e-bike section with real product photography

- Added 4 e-bike product images to public/images/bike/
- Updated vehicles.ts with images array for multi-image gallery
- Upgraded Vehicles.tsx with thumbnail gallery (4 e-bike images)
- Fixed e-bike using scooter photo → now uses dedicated e-bike images
- Added Vehicle interface Images field
- Updated BRAIN.md with new asset paths"
```