/* The tile wall behind the homepage (components/TileWall.astro).

   `pattern` is one repeat of the mosaic, tiled edge to edge across the page.
   Rebuilt from the glazed panel reference: a quincunx of stepped diamonds.
     G  ground   (turquoise field in the reference)
     M  motif    (the cobalt diamonds)
     H  halo     (ivory ring and dots)
     C  core     (the dark cross in each diamond)
   Each letter's colour comes from the theme's --wall-* tokens, not from here.
   Any square size works; keep it seamless (left edge continues the right).

   - pitch       css px per tile (pitchSmall on phones)
   - gap         share of each tile left as grout
   - brush       css px: thickness of the trail the cursor paints
   - fade        0 to 1: how much of the trail survives each frame (higher =
                 longer trail; 0.982 fades in about a second and a half) */
export const tileWall = {
  pattern: [
    'HCMMHGHGHMMC',
    'CMMHGGGGGHMM',
    'MMHGGGHGGGHM',
    'MHGGGHMHGGGH',
    'HGGGHMMMHGGG',
    'GGGHMMCMMHGG',
    'HGHMMCHCMMHG',
    'GGGHMMCMMHGG',
    'HGGGHMMMHGGG',
    'MHGGGHMHGGGH',
    'MMHGGGHGGGHM',
    'CMMHGGGGGHMM',
  ],
  pitch: 9,
  pitchSmall: 7,
  gap: 0.14,
  brush: 56,
  fade: 0.982,
};
