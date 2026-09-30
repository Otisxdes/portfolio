// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.otisxdes.com',
  // Prefetch linked pages on hover so page transitions feel instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
