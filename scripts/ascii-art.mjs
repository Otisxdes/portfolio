/* Draws the homepage background: one oversized, softly abstracted
   Mir-i-Arab portal (pishtaq) with its dome, dithered into a single mark.

   Run:  npm run ascii
   Out:  src/data/ascii-art.ts  (generated — don't edit by hand, re-run instead)

   How it works:
   1. Compose the monument as soft tonal masses on a square grid (0 = empty,
      1 = densest): portal face, the deep pointed arch, the dome, the arcade.
      Light comes from the left. No outlines, no fine detail.
   2. Blur the field so every edge and transition is soft.
   3. Calm the middle (where the text column sits) and fade toward the top.
   4. Ordered (Bayer) dither → each cell is either a mark or empty. Tone is
      carried purely by how many marks there are, like a halftone print.
   The result is stored as packed bits (1 = draw the mark). */
import { writeFileSync } from 'node:fs';

const OUT = 'src/data/ascii-art.ts';

// ---- Grid -------------------------------------------------------------------
const COLS = 360; // ≈4px cells on a 1440px screen
const ROWS = 180;
const W = COLS;
const H = ROWS;

// ---- Composition (grid units, y grows downward) ------------------------------
const PORTAL = { cx: W * 0.72, half: 92, top: 6 }; // runs past the right edge & bottom
const ARCH = { half: 56, top: 44 }; // the iwan opening, base below the bottom edge
const DOME = { cx: W * 0.37, base: 96, r: 50, h: 58 };
const DRUM = { half: 40, bottom: 128 };
const WING_TOP = 122; // arcade roofline, running off the left edge

// ---- Helpers ------------------------------------------------------------------
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Pointed (two-centred) arch: true inside. `top` is the apex. Each side is
// a circular arc of radius 1.6 × half-width, centred on the far side, so the
// curves meet in a point instead of rounding over.
const inArch = (x, y, cx, half, top, base = Infinity) => {
  const R = half * 1.6;
  const off = R - half; // arc centres sit this far from the middle
  const rise = Math.sqrt(R * R - off * off); // spring line → apex
  const spring = top + rise;
  if (y < top || y > base) return false;
  if (y >= spring) return Math.abs(x - cx) <= half;
  return (
    Math.hypot(x - (cx + off), y - spring) <= R && Math.hypot(x - (cx - off), y - spring) <= R
  );
};

// Dome: returns horizontal position (-1…1) for shading, or null.
const inDome = (x, y) => {
  const { cx, base, r, h } = DOME;
  if (y > base || y < base - h) return null;
  const t = (base - y) / h;
  const width = r * (1 + 0.06 * Math.sin(t * Math.PI)) * Math.sqrt(clamp(1 - t * t));
  const dx = x - cx;
  return Math.abs(dx) <= width ? dx / width : null;
};

// ---- 1. Tonal masses --------------------------------------------------------
const field = new Float32Array(COLS * ROWS);
for (let row = 0; row < ROWS; row++)
  for (let col = 0; col < COLS; col++) {
    const x = col + 0.5;
    const y = row + 0.5;
    let v = 0;

    const inPortal = Math.abs(x - PORTAL.cx) <= PORTAL.half && y >= PORTAL.top;
    if (inPortal) {
      const across = (x - (PORTAL.cx - PORTAL.half)) / (PORTAL.half * 2); // 0 left → 1 right
      if (inArch(x, y, PORTAL.cx, ARCH.half, ARCH.top)) {
        // The iwan: deepest high in the vault, lit on its left wall.
        const depth = smooth(H, ARCH.top, y);
        const wall = (x - PORTAL.cx) / ARCH.half; // -1 … 1
        v = 0.66 + depth * 0.16 + smooth(-0.6, 0.4, wall) * 0.06;
        // A small inner arch (doorway niche) at the bottom.
        if (inArch(x, y, PORTAL.cx, 14, H - 44)) v = 0.95;
      } else if (inArch(x, y, PORTAL.cx, ARCH.half + 9, ARCH.top - 10)) {
        v = 0.2; // tile band hugging the arch
      } else {
        v = 0.06 + across * 0.08; // portal face, lit from the left
        // Border band framing the whole portal.
        const edge = Math.min(x - (PORTAL.cx - PORTAL.half), PORTAL.cx + PORTAL.half - x, y - PORTAL.top);
        if (edge < 5) v = 0.3;
        // Soft tiled panels either side of the arch, and the calligraphy band.
        const side = Math.abs(x - PORTAL.cx);
        if (side > ARCH.half + 18 && side < PORTAL.half - 10 && y > 40) v += 0.1;
        if (y > PORTAL.top + 10 && y < PORTAL.top + 24 && side < PORTAL.half - 10) v += 0.2;
      }
    } else {
      const d = inDome(x, y);
      if (d !== null) {
        // Sphere shading: lit upper-left, shadow lower-right.
        const t = (DOME.base - y) / DOME.h;
        v = 0.26 + smooth(-0.7, 1, d) * 0.42 + (1 - t) * 0.06;
      } else if (Math.abs(x - DOME.cx) < 1.5 && y > DOME.base - DOME.h - 9 && y < DOME.base - DOME.h) {
        v = 0.5; // finial
      } else if (Math.abs(x - DOME.cx) <= DRUM.half && y > DOME.base && y <= DRUM.bottom) {
        v = 0.2 + (y < DOME.base + 8 ? 0.3 : 0); // drum with a band at the top
      } else if (y >= WING_TOP && x < PORTAL.cx) {
        // Arcade wing: two storeys of soft arched niches.
        v = 0.14;
        const span = 30;
        const local = ((x % span) + span) % span;
        if (inArch(local, y, span / 2, 9, WING_TOP + 10, WING_TOP + 32)) v = 0.55;
        if (inArch(local, y, span / 2, 9, WING_TOP + 40, H)) v = 0.62;
      }
    }
    field[row * COLS + col] = v;
  }

// ---- 2. Soften: separable box blur, two light passes ---------------------------
const blur = (src, radius) => {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const k = radius * 2 + 1;
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      let s = 0;
      for (let i = -radius; i <= radius; i++) s += src[y * COLS + Math.min(COLS - 1, Math.max(0, x + i))];
      tmp[y * COLS + x] = s / k;
    }
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      let s = 0;
      for (let i = -radius; i <= radius; i++) s += tmp[Math.min(ROWS - 1, Math.max(0, y + i)) * COLS + x];
      out[y * COLS + x] = s / k;
    }
  return out;
};
let soft = field;
for (let i = 0; i < 2; i++) soft = blur(soft, 1);

// ---- 3. Composition: calm middle, fade toward the top ------------------------
for (let row = 0; row < ROWS; row++)
  for (let col = 0; col < COLS; col++) {
    const fx = col / COLS - 0.5;
    const centre = Math.exp(-((fx / 0.16) ** 2)); // text column
    const top = smooth(0, H * 0.4, row); // airy at the top
    soft[row * COLS + col] *= (1 - centre * 0.3) * (0.75 + 0.25 * top);
  }

// ---- 4. Ordered dither → bits ---------------------------------------------------
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
const bytes = new Uint8Array(Math.ceil((COLS * ROWS) / 8));
let marks = 0;
for (let row = 0; row < ROWS; row++)
  for (let col = 0; col < COLS; col++) {
    const i = row * COLS + col;
    const threshold = (BAYER[row % 8][col % 8] + 0.5) / 64;
    if (soft[i] > threshold) {
      bytes[i >> 3] |= 1 << (i & 7);
      marks++;
    }
  }

const file = `/* GENERATED by scripts/ascii-art.mjs — edit the script, not this file.
   Mir-i-Arab portal and dome, ${COLS}×${ROWS} cells, dithered to one mark.
   \`bits\`: base64, row-major, 1 bit per cell (1 = draw the mark). */
export const asciiArt = {
  cols: ${COLS},
  rows: ${ROWS},
  bits: '${Buffer.from(bytes).toString('base64')}',
};
`;

writeFileSync(OUT, file);
console.log(`→ ${OUT} (${COLS}×${ROWS}, ${marks} marks)`);
