# rido.bike Vercel Deployment Checklist

Follow these phases in order. Check each box as you complete it.

---

## Phase 1: GitHub & Vercel (before DNS)

- [ ] Go to [vercel.com](https://vercel.com) → sign in (or create account)
- [ ] Go to **Settings → Git → Connected Services**
- [ ] Install/connect the **GitHub App** to `ssgolden/rido-website`
- [ ] Go to [vercel.com/import](https://vercel.com/import) → find `ssgolden/rido-website` → **Import**
- [ ] Configure:
  - **Framework = Next.js**
  - **Build Command = `npm run build`**
  - **Output Directory = `.next`**
- [ ] Add Environment Variable: `NEXT_OUTPUT` = `export`
- [ ] Add Environment Variable: `CUSTOM_DOMAIN` = `true`
- [ ] Click **Deploy**
- [ ] Copy the **deployment URL** (e.g. `rido-website-xxx.vercel.app`)

---

## Phase 2: Squarespace DNS (after initial Vercel deploy)

- [ ] Log into **Squarespace** → Account → Domain Management
- [ ] Find `rido.bike` → **DNS Settings / Advanced**
- [ ] Add **A record**:
  - **Host = `@`**
  - **Value = `76.76.21.21`**
  - **TTL = auto**
- [ ] Add **CNAME record**:
  - **Host = `www`**
  - **Value = `cname.vercel-dns.com`**
  - **TTL = auto**
- [ ] **Save** DNS settings

---

## Phase 3: Vercel Domain Connection

- [ ] Go to **Vercel Dashboard → project → Settings → Domains**
- [ ] Add `rido.bike`
- [ ] Wait for **"Valid Configuration"** (allow 5–30 minutes)
- [ ] Click **"Set as Primary"**

---

## Phase 4: Verification

- [ ] Run: `nslookup rido.bike` → should resolve to `76.76.21.21`
- [ ] Run: `curl -I https://rido.bike` → should return **HTTP 200**
- [ ] Visit [https://rido.bike](https://rido.bike) in a browser → all sections load correctly
- [ ] Check all **images** (vehicles, bikes) are visible
- [ ] Test **navigation** (Hero → How It Works → etc.)
- [ ] Test `/privacy` page
- [ ] Test `/terms` page

---

**All items checked? You're done.**