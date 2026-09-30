/* ==========================================================================
   Site content. Edit copy here — pages and components read from this file.
   Lines marked TODO need your input.
   ========================================================================== */

export const site = {
  name: 'Otabek Mukhsinov',
  shortName: 'Otabek',
  role: 'Product Designer',
  // TODO: replace with your final one-liner (15 words or fewer).
  description:
    'Otabek Mukhsinov — product designer in Dubai, designing e-commerce and loyalty experiences that move business numbers.',
  url: 'https://www.otisxdes.com',
  email: 'otabek.mukhsinov@gmail.com',
  location: { city: 'Dubai', timeZone: 'Asia/Dubai', zoneLabel: 'GST' },
};

export const nav = [
  { href: '/', label: './' },
  { href: '/work', label: './work' },
  { href: '/experiments', label: './experiments' },
];

export const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/otabek-mukhsinov-aa983b185/' },
  { label: 'Dribbble', href: 'https://dribbble.com/Otabek20' },
  { label: 'Instagram', href: 'https://www.instagram.com/otisxdes/' },
];

export type ProjectStatus = 'live' | 'in-progress';

export interface Project {
  slug: string;
  title: string;
  /** One-line outcome — the business number leads. */
  outcome: string;
  discipline: string;
  context: string;
  period: string;
  status: ProjectStatus;
  /** Case study exists yet? In-progress projects list without a link. */
  hasCaseStudy: boolean;
}

export const projects: Project[] = [
  {
    slug: 'returns-revamp',
    title: 'Returns Revamp',
    outcome: 'Redesigning the returns journey end to end',
    discipline: 'Product Design',
    context: 'Landmark Group',
    period: '2026',
    status: 'in-progress',
    hasCaseStudy: false,
  },
  {
    slug: 'shukran-credit-card',
    title: 'ADCB × Shukran Credit Card',
    outcome: '1.6M AED revenue in 6 months',
    discipline: 'Product Design',
    context: 'Landmark Group',
    period: '2024–2025',
    status: 'live',
    hasCaseStudy: true,
  },
  {
    slug: 'basket-upsell',
    title: 'Basket Upsell Experience',
    outcome: '+7.51% average order value in KSA',
    discipline: 'Product Design',
    context: 'Landmark Group',
    period: '2023–2024',
    status: 'live',
    hasCaseStudy: true,
  },
];

export const experience = [
  // TODO: confirm title and start year.
  { org: 'Landmark Group', role: 'Senior Product Designer', period: '20XX – Present' },
  // TODO: add earlier roles, or remove this comment if Landmark is the only one to show.
];
