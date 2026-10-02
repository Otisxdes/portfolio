/* Draws the homepage background: a panoramic landscape of Bukhara's old
   city — a large mosque dome, the Kalyan minaret and Mir-i-Arab — composed
   from scratch and dithered into a single repeated mark.

   Run:  npm run ascii
   Out:  src/data/ascii-art.ts  (generated — don't edit by hand, re-run instead)

   How it works:
   1. Each monument is built from simple, exact shapes (pointed arches,
      domes, a tapered shaft) in a strict, symmetric layout, lit from the
      left in three steps: lit, mid, shadow.
   2. Every tone is snapped to a small set of fixed values. Each surface
      therefore gets one clean, regular dither pattern — no noise, no
      gradients that would scatter marks randomly.
   3. Monument centre lines sit exactly on the grid, so left and right
      halves dither identically.
   4. Ordered (Bayer) dither: each cell gets the mark or stays empty.
   The result is stored as packed bits (1 = draw the mark).

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

// ---- Tones ---------------------------------------------------------------------
// The whole palette. Multiples of 1/16 give clean, regular dither patterns.
const T = {
  roofline: 2 / 16, // distant flat roofs
  wall: 2 / 16, // plain brick
  plaza: 3 / 16,
  frame: 4 / 16, // tile frames, panels, parapets
  band: 6 / 16, // borders and bands
  script: 7 / 16, // calligraphy band
  niche: 11 / 16, // arched openings
  iwan: 12 / 16, // the deep portal arch
  door: 15 / 16,
};

// ---- Helpers ---------------------------------------------------------------
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Put a centre line exactly in the middle of a grid cell, so shapes
// mirrored around it land on mirrored cells.
const snap = (x) => (Math.round(x / CELL - 0.5) + 0.5) * CELL;

// ---- Shape primitives ------------------------------------------------------
const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1;

// Pointed (two-centred) arch standing on `base`, `w` wide, `h` tall:
// straight sides, then two circular arcs that meet in a point.
const inArch = (x, y, cx, base, w, h) => {
  const half = w / 2;
  const R = half * 1.6; // arc radius
  const off = R - half; // arc centres sit this far from the middle
  const rise = Math.sqrt(R * R - off * off); // spring line → apex
  const top = base - h;
  const spring = Math.max(top + rise, top);
  if (y > base || y < top) return false;
  if (y >= spring) return Math.abs(x - cx) <= half;
  return Math.hypot(x - (cx + off), y - spring) <= R && Math.hypot(x - (cx - off), y - spring) <= R;
};

// Dome sitting on `base`: a smooth half-ellipse, radius r, height h.
// Returns the horizontal position across the dome (-1…1), or null.
const inDome = (x, y, cx, base, r, h) => {
  if (y > base || y < base - h) return null;
  const t = (base - y) / h; // 0 at base → 1 at the crown
  const width = r * Math.sqrt(1 - t * t);
  const dx = x - cx;
  return Math.abs(dx) <= width ? dx / (width || 1) : null;
};

// Light from the left in three clean steps: 0 (lit), ½ (mid), 1 (shadow).
const step = (rel) => (rel < -0.35 ? 0 : rel < 0.35 ? 0.5 : 1);
const shade = (rel, amount) => step(rel) * amount;

// ---- Axes ----------------------------------------------------------------------
// Each monument is symmetric around its own centre line. The dither is
// mirrored there too, so left and right halves get identical marks.
const AXES = [
  { x: snap(16), half: 17 }, // large mosque
  { x: snap(W * 0.3), half: 7 }, // Kalyan minaret
  { x: snap(W * 0.77), half: 34 }, // Mir-i-Arab
];
const [MOSQUE, MINARET, MIR] = AXES.map((a) => a.x);

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

// A dome on a drum with a finial: the shared form for every dome.
const domeOnDrum = (x, y, { cx, drumTop, r, h, drumHalf, drumH, base }) => {
  const d = inDome(x, y, cx, drumTop, r, h);
  if (d !== null) {
    // Shade as a sphere lit from the upper left, in three steps, so the
    // light and shadow areas curve with the surface.
    const t = (drumTop - y) / h;
    const nx = d * Math.sqrt(1 - t * t);
    const light = -0.75 * nx + 0.66 * t;
    return base + (light > 0.3 ? 0 : light > -0.2 ? 2 / 16 : 4 / 16);
  }
  if (Math.abs(x - cx) < CELL && y < drumTop - h && y > drumTop - h - r * 0.4) return T.band; // finial
  if (Math.abs(x - cx) <= drumHalf && y >= drumTop && y <= drumTop + drumH) {
    return y < drumTop + 1 ? T.band : base + shade((x - cx) / drumHalf, 0.12);
  }
  return null;
};

// One bay of a two-storey arcade: a tile frame (6 cells either side of the
// centre) around a pointed niche (4 cells either side). Bays sit every
// BAY_PITCH — a multiple of the 8-cell dither tile — so every bay is drawn
// with exactly the same marks.
const BAY_PITCH = 16 * CELL;
const bay = (x, y, cx, base, h) => {
  if (inArch(x, y, cx, base, 8 * CELL, h)) return T.niche;
  if (inRect(x, y, cx - 6 * CELL, base - h - 1, cx + 6 * CELL, base)) return T.frame;
  return null;
};

// 1. Distant roofline — low, flat roofs with small domes at an even pitch,
//    seen only in the gaps between the monuments.
paint((x, y) => {
  if (y >= GROUND || y < GROUND - 7) return null;
  if (y >= GROUND - 4) return T.roofline;
  const pitch = 12;
  const cx = snap(Math.round(x / pitch) * pitch);
  return inDome(x, y, cx, GROUND - 4, 1.8, 2.4) !== null ? T.roofline : null;
});

// 2. Large mosque dome over a symmetric arcade, left edge.
paint((x, y) => {
  const cx = MOSQUE;
  const wallTop = GROUND - 15.5;
  const drumTop = wallTop - 3.5;
  const dome = domeOnDrum(x, y, {
    cx, drumTop, r: 12.5, h: 13.5, drumHalf: 11, drumH: 3.5, base: 3 / 16,
  });
  if (dome !== null) return dome;
  if (!inRect(x, y, cx - 16, wallTop, cx + 16, GROUND)) return null;
  if (y < wallTop + 1) return T.frame; // parapet
  // Five bays, the middle one on the dome's axis.
  for (const k of [-2, -1, 0, 1, 2]) {
    const bx = cx + k * BAY_PITCH;
    const v = bay(x, y, bx, GROUND, 6.2) ?? bay(x, y, bx, GROUND - 8, 5.4);
    if (v !== null) return v;
  }
  return T.wall;
});

// 3. Kalyan minaret (Minorai Kalon) — the tower that defines Bukhara's
//    skyline. Top to bottom: small cone, flared stalactite cornice, lantern
//    with a ring of arched windows, a band of fine brickwork, a thin tile
//    band, then a strongly tapered shaft wrapped in bands of brick pattern.
paint((x, y) => {
  const cx = MINARET;
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
    // Windows every 4 cells, one centred on the axis.
    const span = 4 * CELL;
    const local = ((Math.abs(dx) + span / 2) % span) - span / 2;
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
  const u = Math.abs(dx) * 1.6; // mirrored, so diagonals read as chevrons
  const v = y * 1.6;
  const pattern = [
    Math.abs(((u + v) % 2 + 2) % 2 - 1) < 0.35, // diagonal lattice
    Math.abs(((u - v) % 2 + 2) % 2 - 1) < 0.35 || Math.abs(((u + v) % 2 + 2) % 2 - 1) < 0.35, // diamonds
    Math.sin(v * 2.2) > 0.5, // horizontal courses
    (Math.floor(u) + Math.floor(v)) % 2 === 0, // chequer
  ][band % 4];
  return 0.18 + lit(half) + (pattern ? 0.22 : 0);
});

// 4. Mir-i-Arab — the portal (pishtaq) between twin domes, with two-storey
//    arcaded wings and corner towers. Everything mirrors around `cx`.
paint((x, y) => {
  const cx = MIR;
  const dx = Math.abs(x - cx); // distance from the centre line
  const wallTop = GROUND - 16;
  const portal = { half: 26 * CELL, top: GROUND - 37 };
  const firstBay = 36 * CELL; // centre of the bay nearest the portal
  const wing = firstBay + 2 * BAY_PITCH + 8 * CELL; // end of the wing

  // Portal
  if (dx <= portal.half && y >= portal.top && y <= GROUND) {
    // The iwan: one deep pointed arch, a door and small niches inside it.
    if (inArch(x, y, cx, GROUND, 11, 27)) {
      if (dx <= 1.2 && y >= GROUND - 5) return T.door;
      for (const nx of [-3.2, 3.2]) {
        if (inArch(x, y, cx + nx, GROUND - 1, 2, 4.4) || inArch(x, y, cx + nx, GROUND - 8, 2, 4.4)) {
          return T.band;
        }
      }
      return y < GROUND - 16 ? T.iwan + 2 / 16 : T.iwan;
    }
    if (inArch(x, y, cx, GROUND, 13.4, 28.4)) return T.band; // border hugging the arch
    const fromEdge = Math.min(portal.half - dx, y - portal.top);
    if (fromEdge < 1.2) return T.band; // outer frame
    if (y >= portal.top + 2.2 && y <= portal.top + 4.6) return T.script; // calligraphy
    // Blind niches stacked on each side of the arch, three high.
    for (const base of [GROUND - 1, GROUND - 9, GROUND - 17]) {
      if (inArch(dx, y, 20 * CELL, base, 4 * CELL, 5.5)) return T.frame;
    }
    return T.wall;
  }

  // Twin domes on drums, well clear of the portal.
  for (const side of [-1, 1]) {
    const dome = domeOnDrum(x, y, {
      cx: cx + side * 54 * CELL, drumTop: wallTop - 5, r: 6.2, h: 7, drumHalf: 5.6, drumH: 5, base: 3 / 16,
    });
    if (dome !== null) return dome;
  }

  // Corner towers (guldasta) at both ends.
  const tower = wing + 2 * CELL;
  if (Math.abs(dx - tower) <= 4 * CELL) {
    if (y >= wallTop - 3 && y <= GROUND) return T.frame;
    const cap = inDome(dx, y, tower, wallTop - 3, 4 * CELL, 2);
    if (cap !== null) return T.band;
  }

  // Wings: three bays per side in two storeys, a pier between each.
  if (dx <= wing && y >= wallTop && y <= GROUND) {
    if (y < wallTop + 1) return T.frame; // parapet
    for (const k of [0, 1, 2]) {
      const bx = firstBay + k * BAY_PITCH;
      const v = bay(dx, y, bx, GROUND, 6.5) ?? bay(dx, y, bx, GROUND - 8.5, 5.8);
      if (v !== null) return v;
    }
    return T.wall;
  }
  return null;
});

// 5. Plaza — paved ground in front, slightly denser toward the bottom.
paint((x, y) => (y < GROUND ? null : y < (GROUND + H) / 2 ? T.plaza : T.frame));

// ---- Snap every tone to the palette grid (1/16 steps) -----------------------
for (let i = 0; i < field.length; i++) field[i] = Math.round(clamp(field[i]) * 16) / 16;

// ---- Ordered dither → bits ---------------------------------------------------
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
    // Inside a monument, count columns outward from its axis (mirrored).
    const x = (col + 0.5) * CELL;
    const axis = AXES.find((a) => Math.abs(x - a.x) <= a.half);
    const c = axis ? Math.abs(col - Math.round(axis.x / CELL - 0.5)) : col;
    if (field[i] > (BAYER[row % 8][c % 8] + 0.5) / 64) {
      bytes[i >> 3] |= 1 << (i & 7);
      marks++;
    }
  }

const file = `/* GENERATED by scripts/ascii-art.mjs — edit the script, not this file.
   Bukhara old city, ${COLS}×${ROWS} cells, dithered to one mark.
   \`bits\`: base64, row-major, 1 bit per cell (1 = draw the mark). */
export const asciiArt = {
  cols: ${COLS},
  rows: ${ROWS},
  bits: '${Buffer.from(bytes).toString('base64')}',
};
`;

writeFileSync(OUT, file);
console.log(`→ ${OUT} (${COLS}×${ROWS}, ${marks} marks)`);
