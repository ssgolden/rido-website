# DNS Setup for Rido.bike

This document describes how to configure DNS for the custom domain **rido.bike** to point to your deployment (Vercel or GitHub Pages).

---

## Option A: Vercel Deployment (Recommended)

Vercel provides the easiest DNS configuration for custom domains with automatic HTTPS.

### Steps

1. **Add domain in Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project → **Settings** → **Domains**
   - Add `rido.bike` and click **Add**

2. **Configure DNS Records**

   Your DNS provider (GoDaddy, Namecheap, Cloudflare, etc.) needs these records:

   | Type | Name | Value | Purpose |
   |------|------|-------|---------|
   | **A** | `@` | `76.76.21.21` | Vercel IPv4 |
   | **AAAA** | `@` | `2a12:5940:8912::1` | Vercel IPv6 (optional) |
   | **CNAME** | `www` | `cname.vercel-dns.com` | www subdomain redirect |

   > **Important:** Replace `@` with your DNS provider's convention for the root domain.

3. **Wait for SSL Certificate**
   - Vercel automatically provisions an SSL certificate
   - This typically takes 5-30 minutes
   - The domain status will show "Verified" when ready

4. **Add Redirect for www (optional)**
   In Vercel → Domains → rido.bike → **Redirect to...** → `https://rido.bike`

---

## Option B: GitHub Pages Deployment

### Steps

1. **Enable GitHub Pages Custom Domain**
   - Go to your repo: `https://github.com/ssgolden/rido-website`
   - **Settings** → **Pages** → **Custom domain**: `rido.bike`
   - Check **Enforce HTTPS**

2. **Configure DNS Records**

   | Type | Name | Value | Purpose |
   |------|------|-------|---------|
   | **A** | `@` | `185.199.108.153` | GitHub Pages |
   | **A** | `@` | `185.199.109.153` | GitHub Pages |
   | **A** | `@` | `185.199.110.153` | GitHub Pages |
   | **A** | `@` | `185.199.111.153` | GitHub Pages |
   | **CNAME** | `www` | `ssgolden.github.io` | www subdomain |

   > **A records:** GitHub requires ALL 4 IP addresses above.

3. **Add CNAME file (if not already present)**
   
   The repository should contain a `public/CNAME` file:
   ```
   rido.bike
   ```

4. **Wait for SSL Certificate**
   - GitHub automatically provisions Let's Encrypt certificates
   - Takes ~5 minutes after DNS propagation
   - Check "Enforce HTTPS" once certificate is active

---

## DNS Provider-Specific Instructions

### Cloudflare

1. Go to Cloudflare Dashboard → your domain → **DNS** → **Records**
2. Add A records with:
   - **Name:** `@` (or select your domain from dropdown)
   - **IPv4 address:** See table above (IP for your host)
3. Add CNAME for www:
   - **Name:** `www`
   - **Target:** `cname.vercel-dns.com` (Vercel) or `ssgolden.github.io` (GitHub)

### GoDaddy

1. Go to **My Products** → **DNS** → **Manage**
2. Under **Records**, click **Add** to add each A record
3. For each A record:
   - **Type:** A
   - **Name:** `@`
   - **Value:** IP address from table above
4. Add CNAME for www:
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** `cname.vercel-dns.com` or `ssgolden.github.io`

### Namecheap

1. Go to **Dashboard** → **Domain List** → **Manage** → **Advanced DNS**
2. Add A records using:
   - **Type:** A
   - **Host:** `@`
   - **Value:** IP address from table above
   - **TTL:** automatic
3. Add CNAME for www:
   - **Type:** CNAME
   - **Host:** `www`
   - **Value:** `cname.vercel-dns.com` or `ssgolden.github.io`

---

## Verification

### Check DNS Propagation

```bash
# Check A record
dig rido.bike A +short

# Check CNAME
dig www.rido.bike CNAME +short
```

Expected results:
- **Vercel:** `76.76.21.21` or similar
- **GitHub Pages:** One of `185.199.108-111.153`

### Check SSL Certificate

```bash
# Check HTTPS
curl -I https://rido.bike

# Verify certificate
openssl s_client -connect rido.bike:443 -servername rido.bike
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSL not working | Wait 5-30 min after DNS changes. Force HTTPS in browser. |
| DNS not propagating | Clear DNS cache: `ipconfig /flushdns` (Win) or `sudo dscacheutil -flushcache` (Mac) |
| Domain says "Not verified" | Check DNS records match exactly. Use `dig` to verify. |
| www not redirecting | Ensure CNAME for www points to your host's CNAME endpoint |
| Mixed content warnings | Ensure all internal links use relative paths or correct full URLs |

---

## Quick Reference

### Vercel Domains
- Vercel IP: `76.76.21.21`
- CNAME endpoint: `cname.vercel-dns.com`

### GitHub Pages
- IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- CNAME: `ssgolden.github.io`

---

## Need Help?

- **Vercel:** [vercel.com/docs/concepts/projects/custom-domains](https://vercel.com/docs/concepts/projects/custom-domains)
- **GitHub Pages:** [docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)