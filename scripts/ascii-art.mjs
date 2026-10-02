/* Draws the homepage background: a panoramic ASCII landscape of Bukhara's
   old city, composed from scratch (no photo tracing).

   Run:  npm run ascii
   Out:  src/data/ascii-art.ts  (generated — don't edit by hand, re-run instead)

   How it works:
   1. A "scene" is painted back-to-front into a tone field (0 = empty,
      1 = densest). Each landmark is a small function of simple shapes —
      pointed arches, onion domes, tapered minarets — lit from the left.
   2. Atmosphere: far layers are fainter, the edges and the bottom denser,
      and the middle is calmed so the content column stays readable.
   3. Tone → character through a dither (ordered Bayer + a little random),
      so neighbouring cells blend between characters like a halftone print.

   Units: 1 unit = one row of text. A character is 0.6 units wide, so
   shapes keep their real proportions on screen. */
import { writeFileSync } from 'node:fs';

const OUT = 'src/data/ascii-art.ts';

// ---- Canvas & character set -----------------------------------------------
const COLS = 240;
const ROWS = 66;
const CHAR_W = 0.6; // character width ÷ line height
const RAMP = ' .,:;+*#%@'; // light → dense
const W = COLS * CHAR_W; // scene width in units (144)
const H = ROWS; // scene height in units
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
      const v = fn((col + 0.5) * CHAR_W, row + 0.5);
      if (v !== null && v !== undefined) field[row * COLS + col] = v;
    }
};

// Light comes from the left: rel -1 (left) … 1 (right) → darker on the right.
const shade = (rel, amount) => (rel + 1) * 0.5 * amount;

// 1. Sky — nearly empty, a faint haze thickening toward the horizon.
paint((x, y) => smooth(H * 0.5, GROUND, y) * 0.05 * noise(x * 0.05, y * 0.2));

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

// 4. Kalyan minaret — tall, tapered, banded brick, lantern near the top.
paint((x, y) => {
  const cx = W * 0.27;
  const top = GROUND - 46;
  if (y < top - 6 || y > GROUND) return null;
  const dx = x - cx;
  // Cap and finial above the lantern
  if (y < top) {
    const d = inDome(x, y, cx, top, 2.6, 3);
    if (d !== null) return 0.4 + shade(d, 0.25);
    if (inRect(x, y, cx - 0.2, top - 6, cx + 0.2, top - 3)) return 0.45;
    return null;
  }
  // Lantern (rotunda) with arched openings, slightly wider
  if (y <= top + 5) {
    const lh = 3.2;
    if (Math.abs(dx) > lh) return null;
    const opening = Math.abs(Math.sin((dx / lh) * Math.PI * 2)) > 0.6 && y > top + 1.5;
    return opening ? 0.88 : 0.45 + shade(dx / lh, 0.25);
  }
  // Shaft: 3.6 half-width at the base → 2.4 under the lantern
  const t = (GROUND - y) / (GROUND - top);
  const half = 3.6 - 1.2 * t;
  if (Math.abs(dx) > half) return null;
  // Ornamental brick bands, busier toward the top
  const band = Math.sin(y * 1.6) > 0.82 || (t > 0.7 && Math.sin(y * 3.1) > 0.7);
  return 0.32 + shade(dx / half, 0.3) + (band ? 0.12 : 0);
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
    const x = (col + 0.5) * CHAR_W;
    const y = row + 0.5;
    const fx = x / W - 0.5; // -0.5 … 0.5
    // Denser toward the outer edges and the bottom
    const edge = Math.abs(fx) * 2;
    let v = field[i] * (0.82 + 0.28 * edge ** 2) + 0.06 * smooth(GROUND - 6, H, y);
    // Calm the middle, where the content column sits
    const centre = Math.exp(-((fx / 0.17) ** 2));
    v *= 1 - centre * (y < GROUND ? 0.3 : 0.2);
    // A little organic grain everywhere
    if (v > 0.08) v += (noise(x * 0.9, y * 0.9) - 0.5) * 0.05;
    field[i] = clamp(v);
  }

// ---- Tone → characters with ordered dithering ------------------------------
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];
const steps = RAMP.length - 1;
const lines = [];
for (let row = 0; row < ROWS; row++) {
  let line = '';
  for (let col = 0; col < COLS; col++) {
    // Half ordered (halftone texture), half random (breaks up the grid so
    // light areas don't look mechanical).
    const threshold = 0.55 * ((BAYER[row % 8][col % 8] + 0.5) / 64) + 0.45 * hash(col * 1.3, row * 2.1);
    const level = Math.floor(field[row * COLS + col] * steps + threshold);
    line += RAMP[clamp(level, 0, steps)];
  }
  lines.push(line.replace(/\s+$/, ''));
}

const file = `/* GENERATED by scripts/ascii-art.mjs — edit the script, not this file.
   Bukhara old city, ${COLS}×${ROWS} characters, composed from scratch. */
export const asciiArt = {
  cols: ${COLS},
  rows: ${ROWS},
  charWidth: ${CHAR_W},
  lines: ${JSON.stringify(lines, null, 2)},
};
`;

writeFileSync(OUT, file);
console.log(`→ ${OUT} (${COLS}×${ROWS})`);
