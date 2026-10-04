/**
 * ============================================================
 *  SOCIAL FEED — curated content with a swappable data source.
 * ============================================================
 *
 * This module deliberately does NOT scrape Instagram or LinkedIn.
 * Both platforms forbid unauthenticated frontend scraping, and doing
 * it would require exposing credentials in the browser — which this
 * project treats as unacceptable (see the security notes in
 * app/api/contact/route.ts and .env.example).
 *
 * Instead the feed is served from a single server-side route that
 * returns already-sanitised, curated entries. Each entry is marked
 * with `source` and `live` so the UI can be honest about what is
 * curated versus what a future API integration would provide.
 *
 * To connect a real integration later:
 *   1. add server-only credentials to the environment
 *      (never NEXT_PUBLIC_*, never VITE_*)
 *   2. fetch and normalise into SocialEntry[] inside
 *      app/api/social-feed/route.ts
 *   3. flip `live: true` on the returned entries
 * No change is needed in the gallery or anywhere in the UI.
 */

import { profile } from '@/data/content';

export type SocialNetwork = 'instagram' | 'linkedin';

export type SocialEntry = {
  id: string;
  network: SocialNetwork;
  /** Curated title — never raw third-party HTML. */
  title: string;
  /** Short editorial caption. */
  caption: string;
  /** Where this entry points. Always an allow-listed profile URL. */
  href: string;
  /** Optional local image under /images. */
  image?: string;
  /** ISO date, when the moment is known. */
  date?: string;
  /**
   * True only when the entry came from a real server-side API call.
   * Curated entries stay false so the UI never implies a live sync
   * that does not exist.
   */
  live: boolean;
};

/**
 * The only two hosts the UI is ever allowed to link to for social
 * entries. Anything else is rejected by the route.
 */
export const SOCIAL_HOSTS = ['instagram.com', 'www.instagram.com', 'linkedin.com', 'www.linkedin.com'] as const;

/** True when `url` points at an allow-listed social profile. */
export function isAllowedSocialUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (SOCIAL_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Curated moments. These are hand-written highlights, NOT a mirror of
 * the profiles — the profiles themselves remain the source of truth and
 * are linked directly from every entry.
 */
export const CURATED_FEED: SocialEntry[] = [
  {
    id: 'ig-hackathon',
    network: 'instagram',
    title: 'SMART INDIA HACKATHON 2026',
    caption:
      'Backend and data track — building under time pressure with a team, shipping something that had to actually work on the day.',
    href: profile.instagram,
    date: '2026',
    live: false,
  },
  {
    id: 'ig-college',
    network: 'instagram',
    title: 'SRM — VADAPALANI CAMPUS',
    caption:
      'Four years of B.Tech CSE, Cybersecurity. The nights that turned coursework into things people could actually run.',
    href: profile.instagram,
    date: '2024-2028',
    live: false,
  },
  {
    id: 'ig-facerec',
    network: 'instagram',
    title: 'FACE RECOGNITION AI',
    caption:
      'Detection, tracking, recognition — and the moment 500K embeddings stopped being a theory and started being a benchmark.',
    href: profile.instagramAlt,
    date: '2026',
    live: false,
  },
  {
    id: 'li-profile',
    network: 'linkedin',
    title: 'GOKUL KRISHANA',
    caption:
      'Professional profile — experience, certifications and the writing that goes with building things.',
    href: profile.linkedin,
    live: false,
  },
  {
    id: 'li-security',
    network: 'linkedin',
    title: 'CYBERSECURITY FOCUS',
    caption:
      'Packet analysis, secure defaults and the habit of treating every input as hostile until proven otherwise.',
    href: profile.linkedin,
    live: false,
  },
];