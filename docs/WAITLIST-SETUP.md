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

## This launch: Netlify Function (live on www.rido.bike)

`www.rido.bike` is a static export on Netlify, so the Next.js route in
`src/app/api/waitlist` does not exist there. Instead,
`netlify/functions/waitlist.mjs` answers **`POST /api/waitlist`** and stores
every sign-up in **Netlify Blobs** (store `waitlist`, one entry per email, so
re-submits are de-duplicated). It needs no setup and no env vars to start
collecting — leave `NEXT_PUBLIC_WAITLIST_URL` unset and both forms post there.

**See the sign-ups**

- Netlify UI → the site → **Blobs** → store `waitlist`.
- Or set `WAITLIST_ADMIN_TOKEN` (Site configuration → Environment variables,
  any long random string), redeploy, then:

  ```bash
  curl -H "Authorization: Bearer $WAITLIST_ADMIN_TOKEN" \
    "https://www.rido.bike/api/waitlist?format=csv" -o rido-waitlist.csv
  ```

  Without the token the export endpoint returns 401.

**Double opt-in confirmation email (recommended):**

1. In Resend, add and verify the `rido.bike` domain (DNS records in Resend →
   Domains).
2. In Netlify → Environment variables set `RESEND_API_KEY` and
   `EMAIL_FROM` to an address on that domain, e.g. `Rido <hola@rido.bike>`.
   Resend's default `onboarding@resend.dev` can only email the Resend account
   owner, so confirmations to riders would fail.
3. Redeploy.

With the key set, each new sign-up is stored with `confirmed: false` and gets
an EN or ES email. Its link opens `/waitlist-confirmed` (or
`/es/waitlist-confirmed`) with the address and a token; the visitor presses
**Confirm**, which marks the entry confirmed. Opening the link alone confirms
nothing, so email security scanners that open links (e.g. Outlook Safe Links)
cannot confirm on the visitor's behalf. The form tells the visitor to check
their inbox. A re-submit re-sends the email at most every 10 minutes. The CSV
export gains `confirmed` (`yes` / `no` / blank for sign-ups from before double
opt-in) and `confirmed_at` columns: send launch news only to `yes` (and blank,
legacy) rows. If sending fails, the sign-up is kept and the visitor sees an
error; a later re-submit retries the email.

**Abuse limits (no setup needed):**

- A hidden honeypot field drops most bots silently.
- At most 200 sign-ups a day trigger emails (`WAITLIST_DAILY_EMAIL_LIMIT` to
  change it). Over the limit the sign-up is kept and the visitor is asked to
  try again later.
- The API never says whether an address is already on the list.
- `/api/events` stores at most 5,000 events a day (`EVENTS_DAILY_LIMIT`).
- For stronger protection, add a rate-limit rule for `/api/*` in the Netlify
  dashboard (Site configuration → Firewall / rate limiting, where your plan
  offers it).

The same key also emails each new sign-up to `NOTIFY_EMAIL` (default
info@rido.bike).

**Conversion counts:** `netlify/functions/events.mjs` (`/api/events`) stores
anonymous, consent-gated events (waitlist form viewed / submitted / succeeded /
failed, share clicks) per placement (`hero`, `closing`, `city-hero`,
`confirmed`) in the Blobs store `events`. Read daily counts with the same admin
token:

```bash
curl -H "Authorization: Bearer $WAITLIST_ADMIN_TOKEN" \
  "https://www.rido.bike/api/events?days=30"
```

The GitHub Pages mirror has no functions; there the forms show the
"email info@rido.bike" fallback instead of a false success.

The Google Apps Script below remains an alternative (a Google Sheet as the
store). Setting `NEXT_PUBLIC_WAITLIST_URL` switches both forms to it and
bypasses the Netlify Function.

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
