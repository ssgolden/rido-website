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

The public site is **`https://www.rido.bike`** (the apex 301s to www). `NEXT_PUBLIC_WAITLIST_URL` is a **build-time** variable: Next inlines it into the static export. Set it, then redeploy. Changing it later does nothing until the next build.

```bash
# .env.local (local dev)
NEXT_PUBLIC_WAITLIST_URL=https://script.google.com/macros/s/AKfy.../exec
```

**Netlify (production):** Site configuration → Environment variables → add `NEXT_PUBLIC_WAITLIST_URL` = the `/exec` URL, next to `NEXT_OUTPUT=export` and `CUSTOM_DOMAIN=true`. Trigger a new deploy. This is what turns on both the waitlist POST and the live count on www.

GitHub Pages (fallback): repository variable `NEXT_PUBLIC_WAITLIST_URL` = the same `/exec` URL, then re-run the deploy workflow.

Without this variable on the Netlify build, production keeps the honest fallback: the form stores the email in that browser's `localStorage` only, and the hero shows "Waitlist now open" with no number.

## What you get

- **Emails collected** → Google Sheet "Rido Waitlist" with columns
  `timestamp | email | locale | userAgent`. Deduplicated server-side.
- **Count endpoint** → `GET <URL>?count=1` returns `{ "count": N }` — used by `WaitlistProof`
  in the Hero to render "N people on the waitlist" with an avatar stack. The same JSON
  is returned for a bare GET, so an already-deployed script works without a redeploy.
  When the env var is unset, the request fails, or the count is 0, the kicker falls back
  to "Waitlist now open — be first to ride" (no number, no fabrication).
- **CORS**: the browser sends `Content-Type: text/plain` so the POST stays a simple request
  (no preflight). If the `script.google.com` redirect hides the JSON response, the form
  retries once with `no-cors` so `doPost` still receives the body. The count request is a
  simple GET with no custom headers, for the same reason. Do not point the var at a URL
  that requires an OPTIONS preflight.

## Local dev / static preview

Without `NEXT_PUBLIC_WAITLIST_URL` set, the form saves to `localStorage` as before.
That's intentional — local dev should not pollute the production sheet. The same
fallback is what production shows until Netlify has the variable set and the site
is rebuilt.

## Viewing collected emails

Open the linked Google Sheet (script.google.com → project → Sheets icon), or from
anywhere: `GET <deployed URL>?count=1` for just the count.
