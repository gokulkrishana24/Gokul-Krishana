import { NextResponse } from 'next/server';
import { CURATED_FEED, isAllowedSocialUrl, type SocialEntry } from '@/lib/socialFeed';

/**
 * SOCIAL FEED — server-side only.
 *
 * Returns already-curated, sanitised entries. There is no scraping and
 * no credential of any kind in this file or in the bundle it produces.
 *
 * The response shape is deliberately the same shape a real integration
 * would return, so connecting Instagram/LinkedIn later means replacing
 * the body of `readFeed()` — not touching the gallery.
 */

export const dynamic = 'force-static';

/** Headers applied to every response from this route. */
const HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
} as const;

/**
 * The single place the feed's contents come from.
 *
 * To move to a live API later:
 *   - read server-only credentials from process.env (never NEXT_PUBLIC_*)
 *   - fetch, then map into SocialEntry[]
 *   - set `live: true` on those entries
 */
async function readFeed(): Promise<SocialEntry[]> {
  return CURATED_FEED;
}

/** Drop anything that would let the UI render or link somewhere untrusted. */
function sanitise(entries: SocialEntry[]): SocialEntry[] {
  return entries
    .filter((e) => isAllowedSocialUrl(e.href))
    .map((e) => ({
      id: e.id,
      network: e.network,
      title: e.title.slice(0, 120),
      caption: e.caption.slice(0, 400),
      href: e.href,
      image: e.image,
      date: e.date,
      live: e.live,
    }));
}

export async function GET() {
  try {
    const entries = sanitise(await readFeed());
    return NextResponse.json(
      { entries, live: entries.some((e) => e.live), updatedAt: new Date().toISOString() },
      { headers: HEADERS },
    );
  } catch {
    // A feed is never worth breaking the page over.
    return NextResponse.json({ entries: [], live: false }, { headers: HEADERS, status: 200 });
  }
}