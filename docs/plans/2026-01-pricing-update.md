# Pricing Update — €1 Unlock + €0.35/min

**Date:** 2026-01  
**Change:** All pricing data updated across site  
**Old:** €0.50 unlock / €0.15/min (Pay Go), Free unlock / €0.10/min (Pass), €9.99 Day Pass  
**New:** €1.00 unlock / €0.35/min (Pay Go), Free unlock / €0.25/min (Pass), €14.99 Day Pass

---

## Files to Update

| # | File | Change |
|---|------|--------|
| 1 | `src/data/pricing.ts` | Update all 3 tiers: pricingTiers + calculator rates |
| 2 | `src/components/sections/Pricing.tsx` | Update calculator `rates` object |
| 3 | `src/app/terms/page.tsx` | Verify pricing references (legal text uses "per-minute fee" generically — no specific amounts to change) |
| 4 | `BRAIN.md` | Update pricing key decisions |

## Pricing Changes

### Pay As You Go
- Unlock Fee: €0.50 → **€1.00**
- Per Minute: €0.15 → **€0.35**

### Rido Pass
- Unlock Fee: Free (unchanged)
- Per Minute: €0.10 → **€0.25**
- Popular badge: Keep

### Day Pass
- Price: €9.99 → **€14.99**
- Unlock Fee: Free (unchanged)
- Per Minute: Included (unchanged)

### Calculator Rates
- paygo: `{ unlock: 0.5, perMin: 0.15 }` → `{ unlock: 1.0, perMin: 0.35 }`
- pass: `{ unlock: 0, perMin: 0.1 }` → `{ unlock: 0, perMin: 0.25 }`
- day: `{ unlock: 0, perMin: 0, flatRate: 9.99 }` → `{ unlock: 0, perMin: 0, flatRate: 14.99 }`

### No-Surprise Guarantees (unchanged)
- No minimum top-up required
- No hidden fees after your ride
- Free refund of unused balance
- Exact pricing shown before every ride

### Legal Pages (unchanged)
- Terms use generic "per-minute fee" language — no specific amounts
- Damage fee €2,000, return fee €500, collection €50, parking photo €30 — unchanged