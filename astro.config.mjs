// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.otisxdes.com',
  // One URL per page, without a trailing slash (/work, not /work/).
  // 'file' builds work.html instead of work/index.html; Vercel serves it at
  // /work and redirects /work/ there (see vercel.json).
  trailingSlash: 'never',
  build: { format: 'file' },
  // Prefetch linked pages on hover so page transitions feel instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
