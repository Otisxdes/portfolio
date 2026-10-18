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
  /** No background or rounded corners added, for exports with their own
      (transparent) rounded frame. */
  plain?: boolean;
  /** Layered bento hero (still + phone-screen loop + frame overlay).
      See src/components/BentoHero.astro for the three files it needs. */
  bento?: boolean;
  /** Before / after slider: `file` is the After image, this is the Before
      (same size and framing), e.g. 'plp-before'. */
  before?: string;
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
  {
    slug: 'babyshop-rebrand',
    headline:
      'Bringing the Babyshop rebrand to three platforms in 60 days, without our usual iterations',
    facts: [
      { label: 'Role', value: 'Senior Product Designer' },
      { label: 'Year', value: '2026' },
      { label: 'Team', value: 'Three product designers and our lead product designer' },
      { label: 'Worked with', value: 'The brand agency and the development team' },
      { label: 'Platforms', value: 'App, Desktop web, Mobile web' },
    ],
    outcome: [
      { value: '60 days', label: 'brief to launch' },
      { value: '3 platforms', label: 'live on launch day' },
      { value: '60%', label: 'of the rebrand done through tokens' },
    ],
    hero: {
      file: 'bento-hero',
      alt: 'The new Babyshop app in an iPhone, surrounded by a basket card, 3D brand icons, the colour palette and design-system tokens',
      brief: 'Bento hero with looping phone screen',
      aspect: '1440 / 1024',
      bento: true,
    },
    intro: [
      'The new Babyshop brand was finished, and its launch date was fixed. There was no time for our normal phased approach, so we made each decision once and committed to it.',
    ],
    chapters: [
      {
        heading: 'A finished brand, a fixed date',
        body: [
          'In our first stakeholder meetings, the agency’s new Babyshop identity was already almost done. Our brief was to bring it to the app, desktop site and mobile web before the official launch.',
          'Normally we’d roll out a change like this over months, testing and refining as we went. This time, the plan had to be right from the start.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'brand-identity',
                alt: 'The agency’s new Babyshop identity: wordmark, B monogram, colour palette, line icons, B patterns, English and Arabic type, script lettering and campaign posters',
                brief: 'The agency’s brand identity board',
                aspect: '2000 / 1131',
              },
            ],
          },
        ],
      },
      {
        heading: 'Polish, not redesign',
        body: [
          'The structure of the old Babyshop experience worked, but the visual layer was dated and inconsistent. So we kept the structure and fixed the layer.',
          'We applied the fundamentals with discipline: hierarchy, contrast, spacing, rhythm and repetition. In 60 days, consistency would do more for Babyshop than reinvention.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'plp-after',
                before: 'plp-before',
                alt: 'Babyshop product listing page',
                brief: 'Product listing page, before / after slider',
                aspect: '16 / 10',
              },
            ],
          },
        ],
      },
      {
        heading: 'Tokens did most of the work',
        body: [
          'I helped build our design system, and we first shipped it on Max. That’s what made 60 days possible.',
          'I translated the agency’s guidelines into a Babyshop token set covering colour, typography, radius, spacing and layout. Around 60% of the rebrand was applying those tokens to existing components. The other 40% was new work, and I designed those components myself.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'tokens',
                alt: 'The Babyshop token set around the wordmark: colour swatches, spacing, radius and type tokens, with the components they style, such as category tabs, search, size picker, delivery promise and Add to basket',
                brief: 'Babyshop token set with the components it styles',
                aspect: '2000 / 1125',
              },
            ],
          },
        ],
      },
      {
        heading: 'Who did what',
        body: [
          'We split the work by experience. I took desktop, the biggest and slowest platform. My two peers took the app and mobile web.',
          'When a page needed something the system didn’t have, it came to me, so all three platforms stayed consistent. Our lead kept us moving and made calls quickly when we got stuck.',
        ],
      },
      {
        heading: 'Good enough, on purpose',
        body: [
          'The hardest part for me was the visuals. Good visual design has many layers, and with more time we’d have added more of them. Instead, I decided which layers to ship now and which could wait.',
          // TODO: add "For example, <one specific layer you deliberately held back, and where>."
          'We kept the bar high. We just spent our effort where people would notice it.',
        ],
        galleries: [
          {
            visuals: [
              {
                file: 'full-craft',
                alt: 'The rebranded Babyshop desktop journey: homepage, product listing, product page, basket and order confirmation',
                brief: 'Desktop journey video, home to order confirmation',
                aspect: '16 / 9',
              },
            ],
          },
        ],
      },
      {
        heading: 'Outcome',
        body: [
          'Live on app, desktop and mobile web on the brand’s official launch day. Conversion held steady through the switch.',
          // TODO: formal recognition or award? Name it if it has one.
          'Recognised by the leadership team at launch.',
          'At first, 60 days felt unrealistic. I didn’t think we’d make it. What got us there wasn’t working faster. It was agreeing early on what this project would and wouldn’t be, then committing to it.',
          'Iterating finds the best version. Sometimes the job is to find a good one and ship it.',
        ],
      },
    ],
  },
];
