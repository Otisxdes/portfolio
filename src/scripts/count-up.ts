/* Count-up: a number marked [data-count] counts from 0 to its value once,
   when it scrolls into view. Used for the case study impact numbers.

   Only the leading number moves; whatever follows stays as written, so
   "1.6M AED" counts 0.0M AED → 1.6M AED and "60 days" counts 0 → 60 days.
   Text that doesn't start with a number is left alone.
   Skipped for reduced motion (the final value is already in the HTML). */
import { animate, inView } from 'motion';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const run = () => {
  if (reduceMotion) return;
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const full = el.textContent ?? '';
    const match = full.match(/^(\d+(?:\.\d+)?)(.*)$/s);
    if (!match) return;
    const end = parseFloat(match[1]);
    const decimals = match[1].split('.')[1]?.length ?? 0;
    const rest = match[2];
    // Hold the final width, so neighbours don't shift while it counts.
    el.style.minWidth = `${el.offsetWidth}px`;
    el.textContent = (0).toFixed(decimals) + rest;
    inView(
      el,
      () => {
        animate(0, end, {
          duration: 1.1,
          delay: 0.15,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (v) => (el.textContent = v.toFixed(decimals) + rest),
          onComplete: () => (el.textContent = full),
        });
      },
      { amount: 0.6 }
    );
  });
};

document.addEventListener('astro:page-load', run);
