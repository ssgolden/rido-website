# Google APIs — Search Console + GA4 scripts

These scripts connect your Rido Google Cloud OAuth client to:
- Google Search Console API (`webmasters.readonly`)
- Google Analytics 4 Data API (`analytics.readonly`)

## Setup

### 1. Google Cloud Console (one-time)
- Go to **Google Cloud Console → APIs & Services → Credentials**
- Find the OAuth client with ID `373429157801-2ur804m8v7u7l1n4gdga2aierncg2asg.apps.googleusercontent.com`
- Click **Download JSON** — keep it safe, never commit it
- Ensure **Search Console API** and **Google Analytics Data API** are enabled
- Add `http://localhost:3001/oauth/callback` to **Authorized redirect URIs**

### 2. Search Console verification (one-time, separate from API access)
To verify ownership of `rido.bike` in Google Search Console:

**Option A — HTML meta tag (easiest, requires redeploy):**
1. In Search Console, add property `rido.bike`
2. Choose "HTML tag" verification method
3. Copy the `content` value (looks like `google-site-verification=abc123...`)
4. Set it as an environment variable when building:
   ```bash
   NEXT_PUBLIC_GSC_VERIFICATION=abc123... CUSTOM_DOMAIN=true NEXT_OUTPUT=export npm run build
   ```
5. Deploy — Google will verify within a few minutes

**Option B — DNS TXT record (no redeploy needed):**
1. In Search Console, choose "DNS record" method
2. Add the TXT record at your domain registrar (wherever `rido.bike` DNS is managed):
   ```
   @   TXT   google-site-verification=abc123...
   ```
3. Click verify in Search Console (may take up to 24h for DNS propagation)

### 3. Local env file
```bash
cd scripts/google-apis
cp .env.example .env
```
Fill in `.env`:
- `GOOGLE_CLIENT_ID` — already set: `373429157801-2ur804m8v7u7l1n4gdga2aierncg2asg.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET` — from the downloaded JSON (field `client_secret`)
- `GOOGLE_REDIRECT_URI` — must be `http://localhost:3001/oauth/callback`
- `GA4_PROPERTY_ID` — from GA4 admin (format `properties/123456789`)
- `GSC_SITE_URL` — `https://rido.bike/`

### 4. Install deps
```bash
npm install googleapis @google-analytics/data
```
(`googleapis` is already in `package.json` — this is a no-op if installed)

### 5. Authenticate (one-time, gets a refresh token)
```bash
node scripts/google-apis/auth.mjs
```
- Opens a local server on `http://localhost:3001`
- Prints a URL — open it in your browser
- Grant Search Console + Analytics read access
- Terminal prints `GOOGLE_REFRESH_TOKEN=...` — paste it into `.env`

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
- `NEXT_PUBLIC_GSC_VERIFICATION` is a `NEXT_PUBLIC_` env var so it's inlined
  at build time. Set it in your CI/deploy environment, not in `.env.local`.