/* ==========================================================================
   Case study content. One entry per project slug (matches site.ts).
   The page template at src/pages/work/[slug].astro renders these.

   Visuals: `file` is a name WITHOUT extension. Drop the real file in and it
   replaces the placeholder automatically:
     - image (.png / .jpg / .webp / .avif) → src/assets/projects/<slug>/
     - video (.mp4, plus <name>-poster.jpg)  → public/media/projects/<slug>/
   Until a file exists, a placeholder shows the `brief` and the file name.
   ========================================================================== */

export interface Visual {
  /** File name without extension, e.g. 'hero-card' → hero-card.png or hero-card.mp4. */
  file: string;
  /** What the visual shows, for screen readers. */
  alt: string;
  /** What to put here. Shown on the placeholder only. */
  brief: string;
  caption?: string;
  /** Placeholder shape, e.g. '16 / 9'. Real images keep their own ratio. */
  aspect?: string;
  /** Version for light mode, e.g. 'journey-diagram-light'. When set, `file`
      is treated as the dark-mode version (transparent, light lines). Until
      the light file exists, light mode shows `file` on a dark panel. */
  fileLight?: string;
  /** Serve the file exactly as exported (no recompression). For diagrams. */
  crisp?: boolean;
  /** No background or rounded corners added — for exports with their own
      (transparent) rounded frame. */
  plain?: boolean;
}

export interface Gallery {
  visuals: Visual[];
  /** Side-by-side count on desktop. Collapses on small screens. */
  columns?: 1 | 2 | 3;
  /** 'carousel' = one visual at a time, sliding on a loop (always on a stage). */
  layout?: 'grid' | 'carousel';
  /** Dark panel behind the visuals, same in both themes. For transparent
      exports made to sit on dark, like device mockups and the flow diagram. */
  stage?: boolean;
  /** Small screens: keep the visual large and let it scroll sideways.
      For dense diagrams whose labels would be too small to read. */
  pan?: boolean;
}

export interface Chapter {
  heading: string;
  /** One string per paragraph. */
  body: string[];
  galleries?: Gallery[];
}

export interface CaseStudy {
  slug: string;
  /** The one sentence a hiring manager should remember. */
  headline: string;
  facts: { label: string; value: string }[];
  outcome: { value: string; label: string }[];
  hero: Visual;
  intro: string[];
  chapters: Chapter[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'shukran-credit-card',
    headline:
      'Selling a credit card inside a shopping journey without hurting checkout conversion',
    facts: [
      { label: 'Role', value: 'Senior Product Designer' },
      { label: 'Year', value: '2024–25' },
      { label: 'Project type', value: 'Acquisition, Landing page, Cross-brand touchpoints, 3D' },
      { label: 'Tools', value: 'Figma, Cinema 4D' },
    ],
    outcome: [
      { value: '1.6M AED', label: 'revenue' },
      { value: '6.4k', label: 'card applications' },
      { value: '6 months', label: 'timeframe' },
    ],
    hero: {
      file: 'hero-card',
      alt: '3D render of the Shukran ADCB credit card',
      brief: '3D card render (existing hero image)',
      aspect: '16 / 9',
    },
    intro: [
      "Landmark Group and ADCB launched the Shukran ADCB credit card. Every purchase earns Shukran, inside Landmark brands and beyond.",
      'My job was to make our e-commerce sites the card’s main acquisition channel. I owned it end to end, from brief to launch, and led the work with ADCB, the product owner, developers and three brand e-commerce teams.',
      'There was a catch. These are shopping sites. Every banner that sells a card competes with the thing that pays the bills: the order.',
    ],
    chapters: [
      {
        heading: 'The shopper’s mindset',
        body: [
          'Attention changes as people move through a store. So should the ask.',
          'On the homepage, there’s no task yet. A pop-up meets people when they’re most open.',
          'On product pages, they’re browsing. A banner with a link nudges them without pulling them away.',
          'In basket and checkout, they’re paying. The message stays visible but isn’t clickable. Nothing should take them out of the flow.',
          'After the order, on the thank-you page and in My account, the ask comes back. The job is done, and they’re open again.',
          'Everyone agreed early: checkout was off-limits for a click. That one rule shaped every other placement.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'journey-diagram',
                alt: 'User flow: on app or website launch a homepage pop-up appears. Know more leads to the landing page; close continues to the homepage, product page, basket and thank-you page, or My account. Every path leads to sign-in, then bank onboarding.',
                brief: 'User flow diagram',
                aspect: '2000 / 548',
                fileLight: 'journey-diagram-light',
                crisp: true,
              },
            ],
            pan: true,
          },
          {
            layout: 'carousel',
            visuals: [
              {
                file: 'touchpoint-home',
                alt: 'Homepage pop-up promoting the card, on tablet',
                brief: 'Touchpoint: homepage pop-up',
                aspect: '3192 / 2304',
              },
              {
                file: 'touchpoint-pdp',
                alt: 'Product page banner with a link to the card, on tablet',
                brief: 'Touchpoint: product page banner',
                aspect: '3192 / 2304',
              },
              {
                file: 'touchpoint-basket',
                alt: 'Non-clickable card message in the basket, on tablet',
                brief: 'Touchpoint: basket (visible, not clickable)',
                aspect: '3192 / 2304',
              },
              {
                file: 'touchpoint-account',
                alt: 'Card promotion in My account, on tablet',
                brief: 'Touchpoint: My account',
                aspect: '3192 / 2304',
              },
              {
                file: 'touchpoint-thank-you',
                alt: 'Card promotion on the order thank-you page, on tablet',
                brief: 'Touchpoint: thank-you page',
                aspect: '3192 / 2304',
              },
            ],
          },
        ],
      },
      {
        heading: 'One number',
        body: [
          'The card had a long list of perks. A list is easy to skip.',
          'Every competitor led with a single number, and for good reason. I did the same. 10% value back leads. Everything else supports it.',
          'I made all the 3D assets in Cinema 4D, from the card renders on the page to the visuals in every banner. A premium card had to feel premium before anyone read a word.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'landing-hero',
                alt: 'Landing page hero: “More reasons to say Shukran” with an Apply now button above a 3D render of the card',
                brief: 'Landing page hero, desktop (existing)',
                aspect: '2000 / 1806',
                plain: true,
              },
              {
                file: 'landing-benefits',
                alt: 'Key benefits grid, with 10% back as the largest tile alongside the welcome bonus, Platinum tier upgrade, instant digital card and free movie tickets',
                brief: 'Landing page benefits section, desktop (existing)',
                aspect: '1994 / 2000',
                plain: true,
              },
            ],
          },
        ],
      },
      {
        heading: 'Easy to apply',
        body: [
          'The rest of the page answers the two questions that stop people applying: is this hard, and where can I use it?',
          'Three steps take you from applying to spending. A rail shows the brands where the card earns more. The page closes on the 10% again, with an FAQ for anything left.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'landing-how-it-works',
                alt: 'How it works: four steps from applying to earning Shukrans, followed by a rail of partner brand logos',
                brief: 'How it works + brand rail (existing)',
                aspect: '2000 / 1806',
                plain: true,
              },
            ],
          },
        ],
      },
      {
        heading: 'Two brands, too many voices',
        body: [
          'The shopping journey was the easy part. Alignment was harder.',
          'Landmark leadership and ADCB weren’t happy with the card design, and the debate went back and forth over email. I took it out of the inbox. I designed new directions, aligned on them internally, then presented them to ADCB. That gave everyone a clear direction, and after a few more rounds we landed the final card.',
          // TODO (optional): add one concrete example of feedback you pushed back on.
          'The landing page had a different problem: too many voices, especially on the copy. The copy team wrote it, and feedback came from every side. I took on what made the page better and pushed back on what didn’t.',
          'When the feedback kept conflicting, I changed the process instead of the page. I brought everyone into one review, walked through the design and copy together, and asked them to send me one agreed list.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'landing-mobile',
                alt: 'The landing page on mobile: hero, key benefits, 10% back, digital card, movie tickets and brand rail',
                brief: 'Mobile screens as one curated row',
                aspect: '2000 / 1391',
              },
            ],
          },
        ],
      },
      {
        heading: 'Impact',
        body: [
          'In six months, the channels I designed brought in 6.4k card applications and 1.6M AED in revenue.',
          'This project had a lot of stakeholders on both sides. Designing the solution was only half the job. The other half was communicating, aligning and pushing it forward until it shipped.',
        ],
      },
    ],
  },
];
