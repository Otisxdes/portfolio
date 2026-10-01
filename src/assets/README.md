# Assets

## Where files go

| Type | Folder | Why |
| --- | --- | --- |
| Images (screens, mockups, portrait) | `src/assets/projects/<slug>/`, `src/assets/site/` | Astro optimises these at build: AVIF/WebP, multiple sizes |
| Videos (loops, walkthroughs) | `public/media/projects/<slug>/` | Served as-is, so export them already compressed |
| Favicon, OG images, fonts you self-host | `public/` | Must keep a fixed URL |

`<slug>` matches the project slug in `src/data/site.ts`, e.g. `shukran-credit-card`.

## Export settings

**Images**: export PNG or JPG at **2× the display size**, max ~2880px wide. Don't pre-compress; the build does that.
Name by content, not order: `hero-desktop.png`, `touchpoints-basket.png`, not `img-03.png`.

**Videos**: H.264 MP4, no audio track, ≤ 1600px wide, 24–30fps, aim for **under 3 MB** per loop.
Also export the first frame as a JPG with the same name + `-poster` (e.g. `loop.mp4` + `loop-poster.jpg`).

## Using them

```astro
---
import Media from '../components/Media.astro';
import VideoLoop from '../components/VideoLoop.astro';
import hero from '../assets/projects/shukran-credit-card/hero-desktop.png';
---
<Media src={hero} alt="Credit card landing page hero" priority />
<VideoLoop
  src="/media/projects/shukran-credit-card/loop.mp4"
  poster="/media/projects/shukran-credit-card/loop-poster.jpg"
  label="Scrolling the landing page on mobile" />
```
