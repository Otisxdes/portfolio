/* Ornaments for the homepage LED layer (see components/LedOrnaments.astro).

   To add one: drop a PNG in public/ornaments/, then add a row below.
   - Transparent PNG: the opaque part is the shape.
   - Opaque PNG: dark ink on a light ground is the shape. Set `invert: true`
     if your artwork is light ink on a dark ground.
   - Any size works. It is sampled down to `cols` LED tiles wide, so a
     clean, bold, high-contrast drawing reads best at this scale.

   Placement is by margin, so ornaments never sit on the text:
   - side    which margin of the reading column
   - y       0 to 1, how far down the screen (top edge of the ornament)
   - t       0 to 1 across the margin: 0 = by the screen edge, 1 = by the text
   Motion:
   - angle   direction the light travels, in degrees (0 = left to right)
   - period  seconds per cycle (light travels for under half of it, then rests)
   - delay   0 to 1, offsets the cycle so ornaments don't light up together */

export type Ornament = {
  src: string;
  cols: number;
  side: 'left' | 'right';
  y: number;
  t: number;
  invert?: boolean;
  angle?: number;
  period?: number;
  delay?: number;
  extend?: Extend;
  fragment?: Fragment;
};

/* Fragment: a small, faint crop of an ornament's own lattice, scattered
   across the margins. There is no solid core: the whole piece dissolves
   from its centre out, with the same crumbled, coastline-like edge.
   `src`, `cols`, `angle`, `period` and `delay` work as for any ornament
   (use the same `cols` as the main one so the tiles match it exactly).
   `y` is the top of its box and `t` how far across the margin, as above.
   - reps      1 to 1.5: how many repetitions of the pattern show
   - ox, oy    tiles: which part of the lattice is cropped (varies the look)
   - scale     tile size relative to the main ornaments (0.7 to 1)
   - drift     scroll drift relative to the main ornaments (1 = same speed)
   - strength  0 to 1: peak opacity, so fragments stay secondary
   - rough, grain, seed   edge character, as in Extend */
export type Fragment = {
  reps: number;
  ox?: number;
  oy?: number;
  scale?: number;
  drift?: number;
  strength?: number;
  rough?: number;
  grain?: number;
  seed?: number;
};

/* Extension: the ornament's own pattern continuing around it, as a lattice
   (neighbouring copies share their outer tips), inside an irregular patch
   with a coastline-like edge that fades and crumbles into the page.
   The original keeps its exact look; its light travels on through the patch.
   - rx, ry   reach of the patch from the ornament's centre, in tiles
   - rough    0 to 1: how jagged the edge is (0 = a plain oval)
   - grain    size of the edge's bays and islands (smaller = bigger features)
   - soft     0 to 1: width of the fade at the edge
   - seed     change it to get a different coastline */
export type Extend = { rx: number; ry: number; rough?: number; grain?: number; soft?: number; seed?: number };

export const ornaments: Ornament[] = [
  {
    src: '/ornaments/diamond-cross.png', cols: 13, side: 'left', y: 0.14, t: 0.35, angle: 25, period: 15, delay: 0,
    extend: { rx: 25, ry: 20, rough: 0.95, grain: 0.065, soft: 0.38, seed: 3 },
  },
  {
    src: '/ornaments/rosette.png', cols: 15, side: 'right', y: 0.70, t: 0.55, angle: 150, period: 17, delay: 0.35,
    extend: { rx: 28, ry: 23, rough: 0.95, grain: 0.065, soft: 0.38, seed: 11 },
  },
];

/* Small scattered fragments. Deliberately uneven: three on the left, three on
   the right, at different heights, sizes and distances from the screen edge,
   each cropping a different part of the lattice. The two main ornaments
   above stay where they are, and these keep clear of them. */
export const fragments: Ornament[] = [];

/* Option B (components/LedField.astro): the same ornaments scattered over the
   whole page at very low strength; hovering one wakes it. Only `src`, `cols`
   and `invert` above are used there (placement comes from this scatter).
   - slot        css px: the screen is split into slots about this size;
                 each holds at most one ornament
   - fill        0 to 1: share of slots that get an ornament
   - pitch       css px: tile size (pitchSmall on phones)
   - seed        change it to reshuffle the scatter */
export const field = { slot: 200, fill: 0.55, pitch: 5, pitchSmall: 4, seed: 7 };
