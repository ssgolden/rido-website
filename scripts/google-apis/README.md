# Google APIs — Search Console + GA4 scripts

These scripts connect your Rido Google Cloud OAuth client to:
- Google Search Console API (`webmasters.readonly`)
- Google Analytics 4 Data API (`analytics.readonly`)

## Setup

1. Download the OAuth client JSON from Google Cloud (the JSON behind the **Download JSON** button in the OAuth client modal).
2. Copy `.env.example` to `.env`:
   ```bash
   cd scripts/google-apis
   cp .env.example .env
   ```
3. Fill in `.env`:
   - `GOOGLE_CLIENT_ID` — already known: `373429157801-2ur804m8v7u7l1n4gdga2aierncg2asg.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET` — from the downloaded JSON
   - `GA4_PROPERTY_ID` — from GA4 admin (format `properties/123456789`)
   - `GSC_SITE_URL` — `https://rido.bike/`
4. Install deps:
   ```bash
   npm install googleapis @google-analytics/data
   ```
5. Authenticate (one-time, gets a refresh token):
   ```bash
   node scripts/google-apis/auth.mjs
   ```
6. Paste the printed `refresh_token` into `.env` as `GOOGLE_REFRESH_TOKEN`.

## Run reports

```bash
# Search Console: top queries/pages last 28 days
node scripts/google-apis/gsc-query.mjs

# GA4: sessions, users, page views last 28 days
node scripts/google-apis/ga4-query.mjs
```

## Use in cron or CI

A refresh token is long-lived. Keep it in GitHub secrets or a `.env` file.
For server-side/scheduled jobs, a service account is more robust than OAuth.

## Important

- The OAuth client is in "testing" mode until you publish the consent screen.
  Refresh tokens from test users expire after 7 days unless you publish.
- For production dashboards, publish the OAuth app or switch to a service account.
- Do NOT commit `.env` or the downloaded JSON to git.
