/* sitemap.xml: every public page, built from the same data as the nav and
   the project lists, so a new case study shows up here automatically. */
import type { APIRoute } from 'astro';
import { nav, projects, site } from '../data/site';

export const GET: APIRoute = () => {
  // Pages marked noindex stay out of the sitemap.
  const noindex = ['/experiments'];
  const paths = [
    ...nav.map((item) => item.href).filter((href) => !noindex.includes(href)),
    ...projects.filter((p) => p.hasCaseStudy).map((p) => `/work/${p.slug}`),
  ];

  const urls = paths
    .map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
