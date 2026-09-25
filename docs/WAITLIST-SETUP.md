# Waitlist Backend — Google Apps Script Setup

The production waitlist uses a **Google Apps Script web app** writing to a Google Sheet
in your Google account. Free, no API key, no database to manage. The form POSTs to the
script URL you deploy once.

## One-time deploy (~2 minutes)

1. Go to https://script.google.com/ and sign in with the Google account that should own
   the waitlist sheet.
2. Click **New project**, delete the default `Code.gs` contents, paste in
   `scripts/waitlist-apps-script.js` from this repo (root of repo, not this folder).
3. Save (Ctrl+S), name the project "Rido Waitlist".
4. Click **Deploy → New deployment**.
5. Type: **Web app**. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**. Google will ask for permissions — grant Sheets access.
7. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfycbz.../exec`).

## Wire into the site

Set the URL as a build-time env var and redeploy:

```bash
# .env.local (local dev)
NEXT_PUBLIC_WAITLIST_URL=https://script.google.com/macros/s/AKfy.../exec

# GitHub Pages deploy (GitHub repo → Settings → Secrets → Actions)
# Add repository variable: NEXT_PUBLIC_WAITLIST_URL = <the /exec URL>

# Vercel: Project Settings → Environment Variables → NEXT_PUBLIC_WAITLIST_URL
```

Then `npm run build` and deploy as usual.

## What you get

- **Emails collected** → Google Sheet "Rido Waitlist" with columns
  `timestamp | email | locale | userAgent`. Deduplicated server-side.
- **Count endpoint** → `GET <URL>` returns `{ "count": N }` — used by `WaitlistProof`
  in the Hero to render "N people on the waitlist" with an avatar stack. When the
  env var is unset, the kicker falls back to "Waitlist now open — be first to ride"
  (no number, no fabrication).
- **CORS**: Apps Script handles it via the `?postData.contents` JSON body.

## Local dev / static preview

Without `NEXT_PUBLIC_WAITLIST_URL` set, the form saves to `localStorage` as before.
That's intentional — local dev should not pollute the production sheet.

## Viewing collected emails

Open the linked Google Sheet (script.google.com → project → Sheets icon), or from
anywhere: `GET <deployed URL>?count=1` for just the count.

## Where the variable is read

`.github/workflows/deploy.yml` and `ci.yml` pass the **repository variable**
`NEXT_PUBLIC_WAITLIST_URL` into the export build. Until the variable is set,
`scripts/build.mjs` prints a warning and the live form keeps sign-ups only in
each visitor's own browser.
