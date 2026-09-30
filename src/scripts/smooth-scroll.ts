/* Smooth scroll with Lenis — the "soft" scroll feel from the reference.
   Skipped entirely for people who ask their OS for reduced motion. */
import Lenis from 'lenis';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

if (!reduceMotion) {
  lenis = new Lenis({
    // Lower = softer / more glide. 0.1 is Lenis's default and close to the reference.
    lerp: 0.1,
    wheelMultiplier: 1,
    // Leave touch scrolling native on phones — it already feels right there.
    syncTouch: false,
    autoRaf: true,
  });

  // After a page transition, jump to the top instantly and re-measure the page.
  document.addEventListener('astro:after-swap', () => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    lenis?.resize();
  });
}

export { lenis };
