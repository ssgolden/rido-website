# Vercel Deployment Guide for Rido.bike

Follow these steps to deploy Rido to rido.bike on Vercel.

---

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com) - free tier works)
- GitHub account with access to `ssgolden/rido-website`
- Domain registrar access for rido.bike (to configure DNS)

---

## Step 1: Get Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name it: `Rido Deploy`
4. Copy the token (looks like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

---

## Step 2: Add Vercel Token to GitHub

1. Go to GitHub: `https://github.com/ssgolden/rido-website/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: Paste the token from Step 1
5. Click **Add secret**

---

## Step 3: Import Project to Vercel

1. Go to [vercel.com/import](https://vercel.com/import)
2. Click **Import Git Repository**
3. Find `ssgolden/rido-website`
4. Configure project:
   - **Framework Preset:** Next.js (detected automatically)
   - **Root Directory:** `.` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. Click **Deploy**

---

## Step 4: Connect Custom Domain

1. After deployment, go to your project dashboard
2. Click **Settings** → **Domains**
3. Enter `rido.bike`
4. Click **Add**

Vercel will show you the DNS records to add.

---

## Step 5: Configure DNS at Your Registrar

Your DNS provider (where you bought rido.bike) needs these records:

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| **A** | `@` | `76.76.21.21` | Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | www redirect |

### Quick DNS Config by Registrar:

**Cloudflare:**
- A record: Name `@`, Content `76.76.21.21`, Proxy status: DNS only
- CNAME: Name `www`, Content `cname.vercel-dns.com`, Proxy: DNS only

**GoDaddy:**
- A record: Name `@`, Value `76.76.21.21`
- CNAME: Name `www`, Value `cname.vercel-dns.com`

**Namecheap:**
- A record: Host `@`, Value `76.76.21.21`
- CNAME: Host `www`, Value `cname.vercel-dns.com`

---

## Step 6: Wait for SSL

Vercel auto-provisions SSL certificates. This takes 5-30 minutes after DNS.

Check status at: **Settings → Domains → rido.bike**

Should show: **Valid Configuration** ✅

---

## Step 7: Enable Auto-Deploy (Already Configured!)

The GitHub Actions workflow is already set up at `.github/workflows/deploy.yml` with a `deploy-vercel` job that triggers on every push to `master`.

✅ **Every push to master will auto-deploy!**

---

## Verification

```bash
# Check if site is live
curl -I https://rido.bike

# Check SSL
openssl s_client -connect rido.bike:443 -servername rido.bike
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Domain not verified" | Wait 5-30 min for DNS propagation |
| SSL error | Force HTTPS in browser, wait 30 min |
| Deployment failed | Check GitHub Actions logs |
| 404 on pages | Check next.config.ts basePath setting |

---

## Alternative: GitHub Pages (Already Works!)

If you prefer not to use Vercel, the site is already configured for GitHub Pages:

1. Go to `https://github.com/ssgolden/rido-website/settings/pages`
2. Custom domain: `rido.bike`
3. Check **Enforce HTTPS**

DNS records for GitHub Pages (4 A records required):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `ssgolden.github.io` |

---

## Done! 🎉

Once DNS propagates, your site will be live at **https://rido.bike**!