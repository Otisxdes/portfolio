/* ==========================================================================
   Schema.org structured data (JSON-LD). Tells search engines and AI tools,
   in a machine-readable way, who this site is about. Facts come from
   site.ts, so the page and the data can't disagree.
   Validate at https://validator.schema.org after changes.
   ========================================================================== */

import { site, socials, experience } from './site';

const personId = `${site.url}/#person`;
const websiteId = `${site.url}/#website`;

/** You, plus the website. Added to every page by Base.astro. */
export const person = (imageUrl: string) => [
  {
    '@type': 'Person',
    '@id': personId,
    name: site.name,
    jobTitle: site.role,
    worksFor: { '@type': 'Organization', name: experience[0].org },
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location.city,
      addressCountry: 'AE',
    },
    url: `${site.url}/`,
    image: imageUrl,
    sameAs: socials.map((s) => s.href),
  },
  {
    '@type': 'WebSite',
    '@id': websiteId,
    name: site.name,
    url: `${site.url}/`,
    author: { '@id': personId },
  },
];

/** A case study page, written by you. */
export const article = (opts: {
  url: string;
  headline: string;
  description: string;
  imageUrl: string;
}) => ({
  '@type': 'Article',
  '@id': `${opts.url}#article`,
  mainEntityOfPage: opts.url,
  headline: opts.headline,
  description: opts.description,
  image: opts.imageUrl,
  author: { '@id': personId, '@type': 'Person', name: site.name, url: `${site.url}/` },
  isPartOf: { '@id': websiteId },
});
