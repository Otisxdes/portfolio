/* Draws the homepage background: a panoramic landscape of Bukhara's old
   city, composed from scratch (no photo tracing) and dithered into a
   single repeated mark.

   Run:  npm run ascii
   Out:  src/data/ascii-art.ts  (generated — don't edit by hand, re-run instead)

   How it works:
   1. A "scene" is painted back-to-front into a tone field (0 = empty,
      1 = densest). Each landmark is a small function of simple shapes —
      pointed arches, onion domes, tapered minarets — lit from the left.
   2. Atmosphere: far layers are fainter, the edges and the bottom denser,
      and the middle is calmed so the content column stays readable.
   3. Save the tone field (4 bits per cell). The browser dithers it into a
      single mark at a size that suits the screen (see AsciiBackground.astro):
      tone is carried purely by mark density, like a halftone print.

   Units: the scene is 144 × 66 units; each grid cell is CELL units square. */
import { writeFileSync } from 'node:fs';

const OUT = 'src/data/ascii-art.ts';

// ---- Scene & grid -----------------------------------------------------------
const W = 144; // scene width in units
const H = 66; // scene height in units
const CELL = 0.4; // grid cell size in units → 360 × 165 cells (≈4px on 1440px)
const COLS = Math.round(W / CELL);
const ROWS = Math.round(H / CELL);
const GROUND = H * 0.9; // where buildings meet the plaza
const SEED = 7; // change for a different far-skyline rhythm

// ---- Helpers ---------------------------------------------------------------
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Deterministic randomness, so every run draws the same city.
let seed = SEED;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Smooth value noise for organic, low-frequency variation in tone.
const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + SEED) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

// ---- Shape primitives ------------------------------------------------------
const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1;

// Pointed (two-centred) arch standing on `base`, `w` wide, `h` tall.
const inArch = (x, y, cx, base, w, h) => {
  const half = w / 2;
  const top = base - h;
  const spring = top + Math.min(h * 0.75, half * 1.35);
  if (y > base || y < top) return false;
  const dx = Math.abs(x - cx);
  if (y >= spring) return dx <= half;
  const rise = (spring - y) / (spring - top); // 0 at spring → 1 at the point
  return dx <= half * Math.sqrt(1 - rise ** 1.5);
};

// Onion-ish dome sitting on `base`: radius r, height h. Returns the
// horizontal position across the dome (-1…1) for shading, or null.
const inDome = (x, y, cx, base, r, h) => {
  if (y > base || y < base - h) return null;
  const t = (base - y) / h; // 0 at base → 1 at tip
  const bulge = 1 + 0.12 * Math.sin(t * Math.PI * 0.9); // slight swell
  const width = r * bulge * Math.sqrt(clamp(1 - t ** 2.2));
  const dx = x - cx;
  return Math.abs(dx) <= width ? dx / (width || 1) : null;
};

// ---- The scene -------------------------------------------------------------
// Tone field, painted back-to-front. Later layers cover earlier ones.
const field = new Float32Array(COLS * ROWS);

// paint(fn): fn(x, y) returns a tone (0–1) where the shape is, or null.
const paint = (fn) => {
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++) {
      const v = fn((col + 0.5) * CELL, (row + 0.5) * CELL);
      if (v !== null && v !== undefined) field[row * COLS + col] = v;
    }
};

// Light comes from the left: rel -1 (left) … 1 (right) → darker on the right.
const shade = (rel, amount) => (rel + 1) * 0.5 * amount;

// 1. Sky — empty, so every silhouette reads cleanly against it.
paint(() => 0);

// 2. Far skyline — the old city's rhythm: flat roofs, small domes, minarets.
{
  const buildings = [];
  let x = -4;
  while (x < W + 4) {
    const w = 5 + rand() * 11;
    const h = 3 + rand() * 6;
    const roll = rand();
    buildings.push({
      x0: x,
      x1: x + w,
      top: GROUND - 3 - h,
      dome: roll < 0.4 ? { r: 1.6 + rand() * 2.2 } : null,
      minaret: roll > 0.88 ? { h: 9 + rand() * 9 } : null,
    });
    x += w + rand() * 1.5;
  }
  paint((x, y) => {
    for (const b of buildings) {
      const tone = 0.26 + noise(x * 0.3, y * 0.3) * 0.06;
      if (inRect(x, y, b.x0, b.top, b.x1, GROUND)) return tone;
      const cx = (b.x0 + b.x1) / 2;
      if (b.dome) {
        const d = inDome(x, y, cx, b.top, b.dome.r, b.dome.r * 1.3);
        if (d !== null) return tone + shade(d, 0.12);
      }
      if (b.minaret && inRect(x, y, cx - 0.6, b.top - b.minaret.h, cx + 0.6, b.top)) return tone + 0.03;
    }
    return null;
  });
}

// 3. Left foreground — a large mosque dome and arcade, cut by the edge.
paint((x, y) => {
  const wallTop = GROUND - 15;
  const drumTop = wallTop - 4;
  const cx = 10;
  const d = inDome(x, y, cx, drumTop, 15, 17);
  if (d !== null) {
    const ribs = Math.abs(Math.sin((d + 1) * 7)) < 0.15 ? 0.08 : 0;
    return 0.2 + shade(d, 0.5) + ribs;
  }
  if (inRect(x, y, cx - 0.25, drumTop - 20, cx + 0.25, drumTop - 17)) return 0.5; // finial
  if (inRect(x, y, cx - 14, drumTop, cx + 14, wallTop)) return y < drumTop + 1.5 ? 0.55 : 0.42; // drum
  if (inRect(x, y, -2, wallTop, 30, GROUND)) {
    for (let i = 0; i < 6; i++) {
      const ax = 2.5 + i * 5;
      if (inArch(x, y, ax, GROUND, 3.4, 8)) return 0.86;
      if (inArch(x, y, ax, GROUND - 9, 3.4, 4.5)) return 0.74;
    }
    return 0.26 + noise(x * 0.5, y * 0.5) * 0.06;
  }
  return null;
});

// 4. Kalyan minaret (Minorai Kalon) — the tower that defines Bukhara's
//    skyline. Top to bottom: small cone, flared stalactite cornice, lantern
//    with a ring of arched windows, a band of fine brickwork, a thin tile
//    band, then a strongly tapered shaft wrapped in bands of brick pattern.
paint((x, y) => {
  const cx = W * 0.27;
  const crown = GROUND - 50; // top of the cornice
  const dx = x - cx;
  const lit = (half) => shade(dx / half, 0.3); // darker toward the right

  // Cone cap
  if (y < crown) {
    const t = (crown - y) / 6; // 0 at the cornice → 1 at the tip
    if (t > 1) return null;
    const half = 2 * (1 - t) ** 0.8;
    return Math.abs(dx) <= half ? 0.36 + lit(half || 1) : null;
  }
  // Stalactite cornice: widest at the top, stepping in toward the lantern,
  // with rows of little vertical cells.
  if (y < crown + 4) {
    const t = (y - crown) / 4;
    const half = 5.3 - t * 1.6;
    if (Math.abs(dx) > half) return null;
    const cell = Math.sin(dx * 2.4 + Math.floor(t * 3) * 1.3) > 0.3;
    return 0.34 + lit(half) + (cell ? 0.16 : 0);
  }
  // Lantern: a ring of tall arched windows between slim piers.
  if (y < crown + 9.5) {
    const half = 3.7;
    if (Math.abs(dx) > half) return null;
    const winTop = crown + 5;
    const winBase = crown + 8.6;
    const span = 1.45;
    const local = ((dx % span) + span * 1.5) % span - span / 2;
    if (inArch(local, y, 0, winBase, 0.75, winBase - winTop)) return 0.9;
    return 0.34 + lit(half);
  }
  // Shaft: tapers strongly, from 3.6 under the lantern to 6.4 at the ground.
  const t = (y - (crown + 9.5)) / (GROUND - (crown + 9.5)); // 0 top → 1 base
  const half = 3.6 + t * 2.8;
  if (Math.abs(dx) > half) return null;
  const depth = crown + 9.5;
  // Fine brick band just under the lantern, then the turquoise tile band.
  if (y < depth + 2.5) return 0.44 + lit(half) + (Math.sin(dx * 3) > 0.4 ? 0.1 : 0);
  if (y < depth + 3.5) return 0.8 + lit(half) * 0.4;
  // Bands of different brick patterns, separated by plain rings.
  const band = Math.floor((y - depth - 3.5) / 6.5);
  const inBand = (y - depth - 3.5) % 6.5;
  if (inBand < 0.9) return 0.56 + lit(half); // plain dividing ring
  const u = dx * 1.6;
  const v = y * 1.6;
  const pattern = [
    Math.abs(((u + v) % 2 + 2) % 2 - 1) < 0.35, // diagonal lattice
    Math.abs(((u - v) % 2 + 2) % 2 - 1) < 0.35 || Math.abs(((u + v) % 2 + 2) % 2 - 1) < 0.35, // diamonds
    Math.sin(v * 2.2) > 0.5, // horizontal courses
    (Math.floor(u) + Math.floor(v)) % 2 === 0, // chequer
  ][band % 4];
  return 0.18 + lit(half) + (pattern ? 0.22 : 0);
});

// 5. Mir-i-Arab — twin domes, the portal (pishtaq) and arcaded wings.
paint((x, y) => {
  const cx = W * 0.775; // portal centre line
  const wingL = cx - 30;
  const wingR = cx + 30;
  const wallTop = GROUND - 17;
  const portalHalf = 8.5;
  const portalTop = GROUND - 35;

  // Domes behind the portal, one each side
  for (const side of [-1, 1]) {
    const dx0 = cx + side * 16;
    const drumTop = wallTop - 6;
    const d = inDome(x, y, dx0, drumTop, 7.5, 10);
    if (d !== null) {
      const ribs = Math.abs(Math.sin((d + 1) * 6)) < 0.18 ? 0.07 : 0;
      return 0.2 + shade(d, 0.55) + ribs;
    }
    if (inRect(x, y, dx0 - 0.2, drumTop - 12.5, dx0 + 0.2, drumTop - 10)) return 0.5; // finial
    if (inRect(x, y, dx0 - 6.8, drumTop, dx0 + 6.8, wallTop)) {
      const script = y < drumTop + 2 && noise(x * 1.7, y * 2) > 0.45 ? 0.15 : 0; // calligraphy band
      return 0.44 + shade((x - dx0) / 6.8, 0.15) + script;
    }
  }

  // Portal
  if (inRect(x, y, cx - portalHalf, portalTop, cx + portalHalf, GROUND)) {
    const fromEdge = Math.min(x - (cx - portalHalf), cx + portalHalf - x, y - portalTop);
    if (inArch(x, y, cx, GROUND, 10, 25)) {
      // The iwan: deep, darkest high in the vault, small niches below
      if (inRect(x, y, cx - 1.1, GROUND - 4.5, cx + 1.1, GROUND)) return 0.97; // door
      for (const nx of [-3, 3]) {
        if (inArch(x, y, cx + nx, GROUND - 1, 2.2, 5)) return 0.6;
        if (inArch(x, y, cx + nx, GROUND - 8, 2.2, 4.5)) return 0.62;
      }
      return 0.84 + smooth(GROUND, GROUND - 25, y) * 0.16;
    }
    if (fromEdge < 1.2) return 0.5; // outer frame
    if (y < portalTop + 3.2) return noise(x * 1.8, y * 2.5) > 0.42 ? 0.5 : 0.3; // calligraphy
    if (inArch(x, y, cx, GROUND, 12.5, 27.5)) return 0.46; // tile border hugging the arch
    const panel = Math.abs(x - cx) > 6 && Math.sin(y * 0.55) > 0.2; // tiled panels
    return panel ? 0.26 : 0.16;
  }

  // Corner towers (guldasta) at the ends of the wings
  for (const tx of [wingL, wingR]) {
    if (inRect(x, y, tx - 2, wallTop - 3, tx + 2, GROUND)) return 0.4 + shade((x - tx) / 2, 0.22);
    const d = inDome(x, y, tx, wallTop - 3, 2, 2.4);
    if (d !== null) return 0.42 + shade(d, 0.2);
  }

  // Wings: two storeys of pointed niches with tiled spandrels
  if (inRect(x, y, wingL, wallTop, wingR, GROUND)) {
    const span = 5.4;
    for (const [base, h] of [[GROUND, 6.5], [GROUND - 8, 6]]) {
      for (let i = 0; i * span < 21; i++) {
        for (const side of [-1, 1]) {
          const ax = cx + side * (portalHalf + 3.4 + i * span);
          if (Math.abs(ax - cx) > 29) continue;
          if (inArch(x, y, ax, base, 3.6, h)) return 0.78;
          if (inRect(x, y, ax - 2.4, base - h - 1.2, ax + 2.4, base - h)) return 0.38;
        }
      }
    }
    if (y < wallTop + 1) return 0.5; // parapet
    return 0.2 + noise(x * 0.6, y * 0.6) * 0.05;
  }
  return null;
});

// 6. Plaza — the ground in front, densest at the bottom edge, paved.
paint((x, y) => {
  if (y < GROUND) return null;
  const t = (y - GROUND) / (H - GROUND);
  const paving = Math.sin(y * 3.2) > 0.85 ? 0.06 : 0;
  return 0.2 + t * 0.32 + paving + noise(x * 0.4, y) * 0.04;
});

// ---- Atmosphere & composition ----------------------------------------------
for (let row = 0; row < ROWS; row++)
  for (let col = 0; col < COLS; col++) {
    const i = row * COLS + col;
    const x = (col + 0.5) * CELL;
    const y = (row + 0.5) * CELL;
    const fx = x / W - 0.5; // -0.5 … 0.5
    // Denser toward the outer edges and the bottom
    const edge = Math.abs(fx) * 2;
    let v = field[i] * (0.82 + 0.28 * edge ** 2) + 0.06 * smooth(GROUND - 6, H, y);
    // Calm the middle, where the content column sits
    const centre = Math.exp(-((fx / 0.17) ** 2));
    v *= 1 - centre * (y < GROUND ? 0.3 : 0.2);
    field[i] = clamp(v);
  }

// ---- Output: tone, 4 bits per cell ---------------------------------------------
// The dither happens in the browser, so the mark size can suit each screen
// (fine on desktop, coarser on phones) while the whole scene always fits.
const LEVELS = 15;
const bytes = new Uint8Array(Math.ceil((COLS * ROWS) / 2));
for (let i = 0; i < COLS * ROWS; i++) {
  const q = Math.round(field[i] * LEVELS);
  bytes[i >> 1] |= (i & 1 ? q << 4 : q);
}

const file = `/* GENERATED by scripts/ascii-art.mjs — edit the script, not this file.
   Bukhara old city, ${COLS}×${ROWS} cells.
   \`tone\`: base64, row-major, 4 bits per cell (low nibble first), 0–${LEVELS}. */
export const asciiArt = {
  cols: ${COLS},
  rows: ${ROWS},
  levels: ${LEVELS},
  tone: '${Buffer.from(bytes).toString('base64')}',
};
`;

writeFileSync(OUT, file);
console.log(`→ ${OUT} (${COLS}×${ROWS})`);
