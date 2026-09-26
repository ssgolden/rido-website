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

## This launch

Do not set a waitlist backend for the current www launch. Leave `NEXT_PUBLIC_WAITLIST_URL` unset on Netlify. The public site is **`https://www.rido.bike`** (the apex 301s to www).

With the variable unset, the form saves the email in that browser's `localStorage` only, and the hero shows "Waitlist now open — be first to ride" with no number. That fallback is intentional. A live count waits for a later change that actually connects a backend.

## Wire into the site (later)

When a backend exists, the URL is a **build-time** env var. Next inlines it into the static export, so changing it requires a new deploy. Do not invent a URL here.

```bash
# .env.local (local dev, only after a real web app URL exists)
# NEXT_PUBLIC_WAITLIST_URL=<deployed web app /exec URL>
```

**Netlify:** Site configuration → Environment variables, next to `NEXT_OUTPUT=export` and `CUSTOM_DOMAIN=true`. Not required for this launch.

## What you get

- **Emails collected** → Google Sheet "Rido Waitlist" with columns
  `timestamp | email | locale | userAgent`. Deduplicated server-side.
- **Count endpoint** → `GET <URL>` returns `{ "count": N }` — used by `WaitlistProof`
  in the Hero to render "N people on the waitlist" with an avatar stack. When the
  env var is unset, the kicker falls back to "Waitlist now open — be first to ride"
  (no number, no fabrication). Live proof stays off until a backend is connected.
- **CORS**: Apps Script handles it via the `text/plain` JSON body.

## Local dev / static preview

Without `NEXT_PUBLIC_WAITLIST_URL` set, the form saves to `localStorage` as before.
That's intentional — local dev and this production launch should not depend on a sheet.

## Viewing collected emails

Open the linked Google Sheet (script.google.com → project → Sheets icon), or from
anywhere: `GET <deployed URL>?count=1` for just the count.
