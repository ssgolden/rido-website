# brand-palette-extractor — Skill

**Trigger:** When you need to extract exact brand colors from image assets, verify a website's color palette against real brand images, or build a design system from visual brand identity.

**Purpose:** Programmatically extract precise color palettes from brand assets (logos, app screenshots, product photos) using Python PIL, then compare against website design tokens and generate upgrade recommendations.

---

## Workflow

### Step 1: Identify Brand Assets

Locate all brand image files in the project. Common locations:
- `images/` or `public/images/` in project root
- `assets/` directory
- Any folder specified by the user

### Step 2: Extract Colors Programmatically

Use Python PIL (Pillow) to extract colors from each image:

```python
from PIL import Image
from collections import Counter

def extract_brand_palette(image_path, name):
    """Extract saturated brand colors from an image."""
    img = Image.open(image_path)
    w, h = img.size
    
    brand_colors = {}  # hue_family -> {pixels, top, avg}
    
    for y in range(0, h, 2):  # sample every 2nd pixel for speed
        for x in range(0, w, 2):
            r, g, b = img.getpixel((x, y))
            max_c = max(r, g, b)
            min_c = min(r, g, b)
            sat = (max_c - min_c) / max(1, max_c)
            
            # Skip near-black (backgrounds)
            if max_c < 15:
                continue
            # Skip near-white (backgrounds)
            if min_c > 240:
                continue
            # Skip low-saturation (grays, tints)
            if sat < 0.3:
                continue
            
            # Classify by hue family
            hex_color = f"#{r:02X}{g:02X}{b:02X}"
            
            if r > 150 and b > 80 and g < r * 0.7 and b > g:
                family = "magenta_pink"
            elif r > 150 and (r - g) > 60 and b < 100:
                family = "coral_orange_red"
            elif g > 150 and r < 100 and b < 150:
                family = "green"
            elif r > 200 and g > 200 and b < 200:
                family = "yellow_cream"
            elif r > 150 and g > 150 and b > 150:
                family = "other_saturated"
            else:
                family = "other_saturated"
            
            if family not in brand_colors:
                brand_colors[family] = {"pixels": [], "count": 0}
            brand_colors[family]["pixels"].append((r, g, b))
            brand_colors[family]["count"] += 1
    
    # Summarize each family
    print(f"\n=== {name} ({w}x{h}) ===")
    for family, data in sorted(brand_colors.items(), key=lambda x: -x[1]["count"]):
        pixels = data["pixels"]
        avg = tuple(sum(p[i] for p in pixels)//len(pixels) for i in range(3))
        c = Counter(pixels)
        top = c.most_common(1)[0]
        print(f"  {family:20s}: {len(pixels):6d}px, avg=#{avg[0]:02X}{avg[1]:02X}{avg[2]:02X}, top=#{top[0][0]:02X}{top[0][1]:02X}{top[0][2]:02X} ({top[1]}px)")
    
    return brand_colors
```

### Step 3: Determine Canonical Brand Colors

Cross-reference colors across ALL brand images. The color that appears:
- Most consistently across all assets
- With the highest pixel count in the app screenshot (most controlled color environment)
- At the exact same hue across lighting conditions

is the **canonical primary brand color**.

**Rules for canonical selection:**
1. App screenshot values take priority (studio-rendered, no lighting variation)
2. If multiple images show same hue at different brightness, use the one from the app
3. Round to the nearest clean hex value that the app uses (exact pixel match preferred)
4. Never "guess" or "eye-dropper" — always use programmatic extraction

### Step 4: Derive Design System Tokens

From the canonical primary, derive the full design system:

```python
def derive_design_system(primary_hex):
    """Derive a full design system from a primary brand color."""
    r = int(primary_hex[1:3], 16)
    g = int(primary_hex[3:5], 16)
    b = int(primary_hex[5:7], 16)
    
    tokens = {
        "primary": primary_hex,
        # Darker variant: reduce each channel by ~12-15%
        "primary_dark": f"#{max(0,int(r*0.85)):02X}{max(0,int(g*0.85)):02X}{max(0,int(b*0.85)):02X}",
        # Lighter variant: increase each channel toward 255 by ~30%
        "primary_light": f"#{min(255,int(r+(255-r)*0.35)):02X}{min(255,int(g+(255-g)*0.35)):02X}{min(255,int(b+(255-b)*0.35)):02X}",
        # Surface dark (from app text color analysis)
        "surface_dark": "#0F172A",
        "surface_dark_alt": "#1E293B",
        # Green for eco/success (from app analysis or standard green)
        "green": "#22C55E",
        # Yellow accent (from app, if applicable)
        "yellow_accent": None,  # Set from extraction if found
        # White (app background)
        "white": "#FFFFFF",
    }
    return tokens
```

### Step 5: Compare Against Current Website

List current design tokens from `globals.css` and compare:

| Aspect | Process |
|--------|---------|
| Primary color | Exact hex comparison |
| Hue family | Is current color in same hue family as extracted? |
| Delta | Calculate color distance (Euclidean RGB distance) |
| Verdict | PASS if <5% delta, WARN if 5-20%, FAIL if >20% |

### Step 6: Generate Upgrade Report

Output a markdown report with:

```markdown
# Brand Palette Audit Report

## Extracted Colors
| Image | Primary Color | Hue Family | Pixel Count |
|-------|-------------|------------|-------------|
| app.png | #DE0498 | magenta_pink | 20,694 |
| scooter.jpg | #FF31B7 | magenta_pink | 35,891 |

## Canonical Brand Color: #DE0498

## Current vs Required
| Token | Current | Required | Delta | Status |
|-------|---------|----------|-------|--------|
| primary | #FF5733 | #DE0498 | 47% | ❌ WRONG HUE |
| ... | ... | ... | ... | ... |

## Recommended Design System
| Token | Hex | Usage |
|-------|-----|-------|
| rido-magenta | #DE0498 | Primary brand, CTAs, headings |
| rido-magenta-dark | #C10385 | Hover/active states |
| rido-magenta-light | #F23DB5 | Badges, subtle backgrounds |
| ... | ... | ... |
```

---

## Critical Rules

1. **Never trust visual assessment** — always extract colors programmatically with PIL
2. **App screenshot values are canonical** — they are rendered in controlled conditions
3. **Cross-reference ALL images** — a color must appear consistently across assets
4. **Don't round to "nice" hex values** — use the exact extracted value unless it's a JPEG artifact
5. **Hue family matters more than brightness** — a dark pink and a bright pink are the same brand; an orange and a pink are NOT
6. **Always check the pixel count** — a color with 20,000+ pixels is significant; one with 50 pixels might be JPEG noise

## Dependencies

- Python 3.x
- Pillow (`pip install Pillow`)