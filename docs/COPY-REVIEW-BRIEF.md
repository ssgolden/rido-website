# Copy review brief (Phase F)

For the native English and Spanish copywriter(s). The goal is a final pass on
every visitor-facing string before launch in Torrevieja: tone, idiom, and
consistency between EN and ES. Not a rewrite of the facts.

## Voice

- Local, plain, confident. "Run by people who live here", not corporate.
- Sentence case for every heading, label and button ("Join the waitlist",
  "How it works"). No Title Case, no ALL CAPS.
- Spanish is Spain Spanish (tú, "patinete", "aparcar"), not Latin American.
- English is British (en_GB): "kerb", "favourite", "licence".

## Hard rules (do not change without checking with Stephen)

- No invented numbers, ratings, testimonials, press or partner names.
- No fares: prices are announced at launch. "You'll see the price before
  every ride" is the only pricing promise.
- Only Torrevieja is named. The Costa del Sol towns stay unnamed until their
  announcement day.
- Legal identity: Go2 Place S.L., NIF B01745405, Orihuela Costa,
  info@rido.bike.
- Legal pages (Privacy, Terms, Cookie Policy) are reviewed by the lawyer, not
  in this pass.

## Where the copy lives

Every component keeps its EN and ES strings side by side in a `copy` object
near the top of the file, so each pair can be compared line by line.

| Page area | File |
|-----------|------|
| Navigation | `src/components/layout/Navbar.tsx` |
| Hero (homepage top) | `src/components/sections/Hero.tsx` |
| Where we're launching | `src/components/sections/Launch.tsx` |
| How it works | `src/components/sections/HowItWorks.tsx` |
| Phone mock-up screens | `src/components/ui/PhoneScreens.tsx` |
| The fleet | `src/components/sections/Vehicles.tsx` and `src/data/vehicles.ts` |
| Safety and trust | `src/components/sections/Safety.tsx` |
| FAQ | `src/components/sections/FAQ.tsx` and `src/data/faq.ts` |
| Closing waitlist block | `src/components/sections/DownloadCTA.tsx` |
| Waitlist form, success and errors | `src/components/ui/WaitlistForm.tsx` |
| Share after sign-up | `src/components/ui/ShareInvite.tsx` |
| Confirmation page | `src/components/sections/WaitlistConfirmed.tsx` |
| Confirmation email | `netlify/functions/waitlist.mjs` (`confirmCopy`) |
| Torrevieja page, its FAQ and search titles | `src/app/(en)/[city]/city-landing.tsx` |
| Partners page | `src/components/sections/Partners.tsx` |
| Cookie banner | `src/components/ui/CookieConsent.tsx` |
| Footer | `src/components/layout/Footer.tsx` |
| 404 page | `src/components/layout/NotFoundView.tsx` |
| Search titles and descriptions (homepage) | `src/app/(en)/layout.tsx`, `src/app/(es)/layout.tsx` |

## How to hand back edits

Easiest: a document with the file name, the current text and the new text
for each change. Claude or a developer applies them and checks the layout at
phone and desktop widths (longer Spanish strings can wrap differently).
