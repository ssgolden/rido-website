# Legal review points (for the lawyer)

Open points found while updating the website's Terms, Privacy Policy and
Cookie Policy (October 2026). These are questions to answer, not legal
advice. The live pages are at `/terms`, `/privacy` and `/politica-cookies`
(source: `src/app/(en)/terms/page.tsx`, `privacy/page.tsx`,
`politica-cookies/page.tsx`).

## 1. The Terms cover e-scooters only

The Terms are written for e-scooter rental (their own summary says "terms
and conditions for e-scooter rental"), but the site markets shared e-bikes
in Torrevieja too. Decide whether the Terms should cover e-bikes now (helmet
rules, parking, fees and damage differ) or say e-bikes are covered by
separate terms at launch.

## 2. International data transfers

The Privacy Policy has no section on transfers outside the EEA. The website
currently uses US-based providers:

- Netlify (hosting, waitlist and event storage)
- Resend (waitlist confirmation emails, once switched on)
- Vercel (optional host, analytics after consent)

Confirm the transfer basis for each (EU-US Data Privacy Framework or
Standard Contractual Clauses), whether to name these processors, and add the
section.

## 3. Retention of end-of-ride photos

Section 6 gives retention periods for account, ride, waitlist and cookie
data, but not for end-of-ride and helmet photos (section 3). Photos can show
bystanders and number plates. Set a specific period (for example, until the
deadline for a municipal sanction has passed) and state it.

## 4. The €200 helmet fine (Terms, section 7)

The Terms state that riding without a helmet "carries a Local Police/DGT
fine of €200". Real Decreto 518/2026, de 24 de junio (BOE-A-2026-13889, in
force since 1 October 2026) makes the helmet compulsory for every VMP rider,
and the Ministry of the Interior describes the breach as a serious offence
fined at €200. Confirm that reference and whether the Terms should cite it.

## 5. Spanish versions of the legal pages

The legal pages exist only in English, while the site has a full Spanish
version for a Spanish market. Confirm whether Spanish-language Terms,
Privacy Policy and Cookie Policy are required before launch (consumer
contracts and general terms), and which version prevails if both exist.

## 6. Wording added in October 2026 (please check)

- Privacy Policy 3.2: the waitlist now sends one confirmation email and
  records whether and when the address was confirmed (double opt-in).
- Privacy Policy 4: "email delivery" added to the cloud and IT providers.
- Privacy Policy cookie paragraph and Cookie Policy: anonymous, first-party
  counts of waitlist-form views, submissions and share clicks, only after the
  visitor accepts the consent banner. No cookies, no IP, device identifier or
  email stored with them.

## 7. Minimum age: the law says 15, Rido says 18

Since 1 October 2026 (Real Decreto 518/2026) the national minimum age to
ride a VMP is 15, and pedal-assist e-bikes have no legal minimum. The site
and the Terms keep Rido's own minimum at 18 for both, on the basis that a
ride is a rental contract with insurance cover. The FAQ now states both
figures. Confirm that 18 is the right line (capacity of minors to contract,
the insurer's conditions), or whether 16–17 with parental consent should be
allowed, which would change the Terms, the app's age check and the FAQ.
