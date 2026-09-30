/* Reveal-on-scroll: elements with [data-reveal] fade up once as they enter
   the viewport. Subtle on purpose — motion supports reading, it isn't the show. */
import { animate, inView, stagger } from 'motion';

// The `js-motion` class that hides [data-reveal] before animating is set by
// the inline script in Base.astro's <head>, so there's no flicker.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const run = () => {
  if (reduceMotion) return;

  // Groups: a [data-reveal-group] staggers its direct [data-reveal] children.
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>(':scope > [data-reveal]');
    inView(
      group,
      () => {
        animate(
          items,
          { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
          { duration: 0.6, delay: stagger(0.06), ease: [0.22, 1, 0.36, 1] }
        );
      },
      { amount: 0.1 }
    );
  });

  // Standalone reveals (not inside a group).
  document
    .querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-group] > [data-reveal])')
    .forEach((el) => {
      inView(
        el,
        () => {
          animate(
            el,
            { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
            { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          );
        },
        { amount: 0.1 }
      );
    });
};

// Runs on first load and after every page transition.
document.addEventListener('astro:page-load', run);
