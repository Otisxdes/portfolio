# otisxdes.com

Personal portfolio of Otabek Mukhsinov. Built with [Astro](https://astro.build), deployed on Vercel.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build into dist/
npm run check    # type-check
```

## Where things live

| Want to change… | Edit |
| --- | --- |
| Any copy, projects, experience, links | `src/data/site.ts` |
| Colors, type scale, spacing, dark mode | `src/styles/tokens.css` |
| Base element styles (links, focus, reset) | `src/styles/global.css` |
| `<head>`, theme bootstrapping, page shell | `src/layouts/Base.astro` |
| Header (nav, clock, theme toggle) | `src/components/Header.astro` |
| A project row in lists | `src/components/ProjectRow.astro` |
| Smooth scroll feel (Lenis) | `src/scripts/smooth-scroll.ts` → `lerp` |
| Reveal-on-scroll motion | `src/scripts/reveal.ts` |
| Pages | `src/pages/` — each file is a URL |
| Images and videos | see `src/assets/README.md` |
| Optimised image / video loop | `src/components/Media.astro`, `VideoLoop.astro` |

## Principles

- **Tokens first.** Components only use CSS variables from `tokens.css`.
- **Motion supports reading.** Reveals are subtle; everything respects `prefers-reduced-motion`.
- **Content is data.** Copy lives in `src/data/`, not in markup.
- **Reserved for later:** `--font-display`, `--color-accent`, `--ornament` in `tokens.css` are slots for the Central Asian layer.
