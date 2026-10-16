#!/usr/bin/env python3
# Usage: python3 scripts/make-cutout.py public/images/scooter/x.jpg public/images/cutouts/x.webp
# Needs Pillow and numpy. Assumes the uniform #F7F7F7 studio background of the current renders.
"""Key the uniform #F7F7F7 studio background out of product renders.

Only near-background pixels connected to the image border are keyed, so
white details inside the vehicle (logo text, reflections) stay opaque.
Soft shadows become partial alpha. Edge colours are decontaminated.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image

BG = 247.0
LO, HI = 4.0, 30.0  # distance from BG: <=LO fully transparent, >=HI opaque

def cutout(src, dst, max_width=1400):
    im = Image.open(src).convert("RGB")
    if im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    d = np.abs(a - BG).max(axis=2)
    near = d < HI
    h, w = near.shape
    # Flood fill from the border through near-background pixels.
    conn = np.zeros_like(near)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x] and not conn[y, x]:
                conn[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x] and not conn[y, x]:
                conn[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not conn[ny, nx]:
                conn[ny, nx] = True; q.append((ny, nx))
    # Enclosed gaps (e.g. between wheel spokes): exact studio grey, large area.
    # White logo text (~255) is not within EXACT of 247, so it is never keyed.
    EXACT, MIN_AREA = 3.0, 300
    cand = (d <= EXACT) & ~conn
    seen = np.zeros_like(cand)
    for sy, sx in zip(*np.nonzero(cand)):
        if seen[sy, sx]:
            continue
        comp = [(sy, sx)]; seen[sy, sx] = True; i = 0
        while i < len(comp):
            y, x = comp[i]; i += 1
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True; comp.append((ny, nx))
        if len(comp) >= MIN_AREA:
            ys, xs = zip(*comp)
            conn[list(ys), list(xs)] = True
    alpha = np.ones((h, w), np.float32)
    ramp = np.clip((d - LO) / (HI - LO), 0.0, 1.0)
    alpha[conn] = ramp[conn]
    # Decontaminate: remove the grey background mixed into partial pixels.
    a_safe = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.clip((a - BG * (1 - alpha[..., None])) / a_safe, 0, 255)
    rgb[alpha <= 0.0] = 0
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getbbox()
    if bbox:  # trim with a small margin
        m = 24
        img = img.crop((max(bbox[0] - m, 0), max(bbox[1] - m, 0), min(bbox[2] + m, w), min(bbox[3] + m, h)))
    img.save(dst, "WEBP", quality=88, method=6)
    print(f"{src} -> {dst} {img.size} transparent={float((alpha < 0.05).mean()):.0%}")

if __name__ == "__main__":
    cutout(sys.argv[1], sys.argv[2])
