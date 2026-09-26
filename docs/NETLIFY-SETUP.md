# Netlify Deployment Guide for Rido

Deploy **rido.bike** via Netlify using the GitHub App connection.

---

## 1. Why Netlify

- **Free tier** includes unlimited static sites
- **Simple GitHub App integration** — auto-deploys on push
- **Auto-SSL** via Let's Encrypt (free, automatic)
- **Custom domain** management in one place
- **Instant rollbacks** via deploy history
- **Redirect rules** handled natively. On the live site the apex (`https://rido.bike`) 301s to the canonical host `https://www.rido.bike`

---

## 2. Netlify DNS Values (for Squarespace)

Point your domain's DNS to Netlify's load balancer.

| Type   | Name | Value                      | Purpose                        |
|--------|------|----------------------------|--------------------------------|
| A      | @    | `75.2.60.5`                 | Root domain → Netlify LB       |
| CNAME  | www  | `rido-bike.netlify.app`    | Redirect or proxy www          |

> **Note:** Netlify will provide your actual subdomain URL after setup (e.g. `random-name-123.netlify.app`). Replace `rido-bike` with your actual subdomain throughout.

### Canonical host (already live)

The public origin is **`https://www.rido.bike`**. Netlify 301-redirects the apex `https://rido.bike` to www. Canonicals, the sitemap, robots, and JSON-LD in this repo use www so they match that redirect.

No DNS change is required for this. Do not add a rule that sends www back to the apex — that would fight the canonical.

Both hostnames should keep resolving (apex A record, www CNAME). Netlify's domain settings perform the apex → www redirect.

---

## 3. Step-by-Step Netlify Setup

### Phase 1: Create Site from GitHub

1. Go to [app.netlify.com](https://app.netlify.com) and sign up/login with **GitHub**
2. Click **"Add new site"** → **"Import from Git"**
3. Find the repository: **`ssgolden/rido-website`**
4. Select the branch to deploy (default: `main`)
5. Netlify will detect Next.js automatically — **override with manual settings**:

### Phase 2: Configure Build

6. Click **"Show advanced"** → **"Add environment variable"**:

   | Key              | Value       |
   |------------------|-------------|
   | `NEXT_OUTPUT`    | `export`    |
   | `CUSTOM_DOMAIN`  | `true`      |
   | `NEXT_PUBLIC_WAITLIST_URL` | Apps Script `/exec` URL (required for the live waitlist and signup count) |
   | `NEXT_PUBLIC_GSC_VERIFICATION` | Optional Search Console token. Leave unset to omit the meta tag. |

   `NEXT_PUBLIC_*` values are inlined at build time. Set them before the first production deploy of `https://www.rido.bike`, then redeploy if they change. See section 8 and `docs/WAITLIST-SETUP.md`.

7. Set build settings:

   | Setting           | Value         |
   |-------------------|---------------|
   | Build command     | `npm run build` |
   | Publish directory  | `out`         |

   > **Critical:** This project uses `NEXT_OUTPUT=export` which outputs static files to the `out/` directory — **not** `.next/`. Using the wrong publish directory is the most common deployment failure.

8. Click **"Deploy site"**

### Phase 3: Claim Custom Domain

9. After the first deploy completes, go to **Site settings** → **Domain management** → **Add custom domain**
10. Enter `rido.bike` and click **Verify**
11. Netlify will display the **DNS records to add** to your DNS provider (Squarespace)
12. Click **Add domain** to confirm ownership (Netlify will offer a TXT verification record if needed)

### Phase 4: Configure DNS in Squarespace

See Section 5 below.

### Phase 5: Wait for SSL

13. Netlify automatically provisions an SSL certificate via Let's Encrypt after DNS propagates
14. This typically takes **5–30 minutes**
15. You will receive an email when SSL is active

---

## 4. Important: Output Directory

This project uses **static export mode**:

```
NEXT_OUTPUT=export  →  output goes to  /out
```

In Netlify's build settings, **always use**:

- **Publish directory:** `out`

Never use `.next` or `standalone` output — those are for server-rendered deployments.

If you see **404 errors** after deploy, this is almost certainly the wrong publish directory.

---

## 5. Squarespace DNS Configuration

### Steps

1. Log into [Squarespace](https://account.squarespace.com) → **Domain Management** → select **`rido.bike`**
2. Click **DNS Settings** or **Advanced DNS**
3. **Delete any existing A records** for `@` (old hosting records)
4. Add the following records:

   | Type   | Name  | Value            | TTL      |
   |--------|-------|------------------|----------|
   | A      | `@`   | `75.2.60.5`      | `Auto`   |
   | CNAME  | `www` | `rido-bike.netlify.app` | `Auto`  |

   > Replace `rido-bike` with your actual Netlify subdomain.

5. **Save** the DNS records
6. Wait for propagation (can take up to 48 hours, usually < 30 minutes)

### Host redirect

Rely on Netlify for the redirect. If a host-level rule is also configured, it must point the same way as production:

- `https://rido.bike/*` → `https://www.rido.bike/:splat` (301)

A Squarespace rule that sends `www.rido.bike` to `https://rido.bike` would undo the canonical. Leave DNS records as they are.

---

## 6. Verification Commands

### Check DNS Resolution

```bash
nslookup rido.bike
```

Expected output: `Address: 75.2.60.5`

### Check www Resolution

```bash
nslookup www.rido.bike
```

Expected output: `Address: rido-bike.netlify.app` (or your actual subdomain)

### Check SSL

Visit [https://www.rido.bike](https://www.rido.bike) — the browser should show a valid certificate. The apex URL should bounce here rather than stay on the bare domain.

### Check the apex redirect

```bash
curl -I https://rido.bike
```

Expected: `HTTP/2 301` with `location: https://www.rido.bike/` (or the same host with a trailing path).

```bash
curl -I https://www.rido.bike
```

Expected: `HTTP/2 200`.

---

## 7. Troubleshooting

### 404 Errors on All Pages

- **Cause:** Wrong publish directory
- **Fix:** Verify Netlify settings → Build & Deploy → Build settings → Publish directory = `out`
- Also verify `NEXT_OUTPUT=export` environment variable is set

### SSL Certificate Not Issued

- **Cause:** DNS not fully propagated, or domain verification pending
- **Fix:**
  1. Wait 30 minutes after DNS changes
  2. Run `nslookup rido.bike` to confirm DNS points to `75.2.60.5`
  3. In Netlify: **Domain management** → click **Verify DNS configuration**
  4. Check for pending domain verification emails from Netlify

### Site Shows Wrong Content / Old Content

- **Cause:** Stale deploy or cached assets
- **Fix:**
  1. Netlify dashboard → **Deploys** → find the latest successful deploy → click **Preview**
  2. Click **Clear cache and retry deploy**
  3. Hard refresh the browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

### Deploy Not Triggering

- **Cause:** GitHub App not installed for the repo, or branch not connected
- **Fix:**
  1. Netlify: **Site settings** → **Build & Deploy** → **Continuous Deployment** → **Build hooks**
  2. Verify the GitHub repository is connected
  3. Check GitHub repo settings → **Branches** to confirm the branch is protected if applicable

### Domain Shows "Site Not Found" on Netlify

- **Cause:** Domain not properly added in Netlify
- **Fix:**
  1. Netlify: **Site settings** → **Domain management** → **Custom domains**
  2. Click **Add custom domain** → enter `rido.bike`
  3. Follow the verification steps

---

## 8. Netlify Configuration File (Optional)

You can add a `netlify.toml` to the repo root to codify these settings:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NEXT_OUTPUT = "export"
  CUSTOM_DOMAIN = "true"

[[redirects]]
  from = "https://rido.bike/*"
  to = "https://www.rido.bike/:splat"
  status = 301
  force = true
```

> This eliminates the need to configure build settings manually in the Netlify UI. Netlify reads `netlify.toml` automatically on each deploy. The redirect above documents the live direction (apex → www). Netlify domain settings already do this; adding the snippet does not require a DNS change.

Also set these in the Netlify UI (they are inlined at **build time**, so change them and redeploy):

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_WAITLIST_URL` | Apps Script `/exec` URL. Required for the production waitlist and the live signup count on `https://www.rido.bike`. If unset, emails stay in the visitor's browser and the count stays hidden. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Optional Google Search Console token. The meta tag is omitted when this is unset. Do not commit the token. |

Register Search Console for `https://www.rido.bike/`. See `docs/WAITLIST-SETUP.md` for the waitlist script.

---

## 9. Quick Reference

| Item              | Value / Instruction                           |
|-------------------|-----------------------------------------------|
| GitHub repo       | `ssgolden/rido-website`                        |
| Build command     | `npm run build`                               |
| Publish directory | `out`                                         |
| Env: `NEXT_OUTPUT`| `export`                                      |
| Env: `CUSTOM_DOMAIN` | `true`                                    |
| Netlify subdomain | Your site's `*.netlify.app` URL (from Step 8) |
| DNS A record      | `@` → `75.2.60.5`                             |
| DNS CNAME (www)   | `www` → `*.netlify.app`                       |
| SSL               | Automatic via Let's Encrypt                   |
| Canonical origin  | `https://www.rido.bike` (apex 301s here)      |
| `NEXT_PUBLIC_WAITLIST_URL` | Apps Script `/exec` URL, set at build time |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Optional Search Console token, build time |

---

## 10. Getting Help

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community:** [community.netlify.com](https://community.netlify.com)
- **Next.js on Netlify:** [ntl.fyi/nextjs-netlify](https://ntl.fyi/nextjs-netlify)
