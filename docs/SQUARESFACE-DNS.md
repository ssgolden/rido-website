# Squarespace DNS Setup Guide for rido.bike

Connect your Squarespace domain to Vercel for hosting.

---

## 1. DNS Records

| Type   | Name | Value                |
|--------|------|----------------------|
| A      | @    | `76.76.21.21`        |
| CNAME  | www  | `cname.vercel-dns.com` |

---

## 2. Squarespace Step-by-Step

1. Log into [Squarespace](https://login.squarespace.com) with your account
2. From the **Home Menu**, click **Domains**
3. Locate **rido.bike** in your domain list
4. Click the domain to open its settings page
5. Click **DNS Settings** or **Advanced Settings** (depending on your UI version)
6. Scroll to **Custom Records**
7. Add the **A Record**:
   - **Host/Name**: `@`
   - **Type**: `A`
   - **Value**: `76.76.21.21`
   - **TTL**: `Auto` (or `1 Hour` if custom)
8. Add the **CNAME Record**:
   - **Host/Name**: `www`
   - **Type**: `CNAME`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `Auto` (or `1 Hour` if custom)
9. Click **Save** to apply changes
10. Wait for DNS propagation (usually minutes, up to 48h globally)

---

## 3. Vercel Domain Setup

1. Log into [Vercel](https://vercel.com) and import your Rido project
2. Go to **Settings** (top-right corner of dashboard)
3. Click **Domains** in the left sidebar
4. Click **Add Domain** and enter `rido.bike`
5. Vercel will attempt to verify DNS configuration automatically
6. Once verified, Vercel provisions an SSL certificate for HTTPS
7. Configure redirect (optional): add `www` → non-`www` redirect in Vercel

---

## 4. Verification

Run these commands to confirm DNS is working:

```bash
# Check A record resolves to Vercel
nslookup rido.bike

# Confirm HTTPS is working
curl -I https://rido.bike
```

Expected `curl` response: `HTTP/2 200` or `HTTP/2 301` (redirect)

---

## 5. Troubleshooting

### Domain not verified
- Wait **30 minutes** after adding DNS records (propagation delay)
- Verify the A record value is exactly `76.76.21.21` (no extra spaces or dots)
- Re-run verification in Vercel dashboard

### SSL certificate issues
- Vercel auto-provisions SSL; wait **30 minutes** after domain is verified
- If SSL still missing, go to Vercel → Domains → **Recheck** DNS

### HTTPS not working
- Force HTTPS by adding a redirect rule in Vercel:
  ```
  Source: /(.well-known/*)?
  Destination: https://rido.bike/$1
  Status: 200
  ```

### DNS not propagating globally
- DNS changes can take **up to 48 hours** (Squarespace typically propagates in under 5 minutes)
- Use [dnschecker.org](https://dnschecker.org) to check global propagation status
- Clear local DNS cache:
  ```bash
  # Windows
  ipconfig /flushdns

  # macOS
  sudo dscacheutil -flushcache
  ```

### www not working
- Ensure the CNAME record points to exactly `cname.vercel-dns.com`
- Vercel dashboard should show `www.rido.bike` as verified alongside `rido.bike`