import { NextResponse } from 'next/server';
import { profile } from '@/data/content';
import { MAX_BODY_BYTES, isBot, validateContact } from '@/lib/contact';
import { clientKey, rateLimit } from '@/lib/rateLimit';

/**
 * POST /api/contact
 *
 * A public, unauthenticated endpoint — so it is treated as hostile by
 * default. In order, this route:
 *   1. rejects any method other than POST;
 *   2. requires a JSON content type;
 *   3. enforces a hard request-size ceiling;
 *   4. rate limits per IP;
 *   5. validates against a closed allowlist, on the server;
 *   6. silently drops honeypot submissions;
 *   7. never returns internal detail — errors are generic by design.
 *
 * Delivery: if RESEND_API_KEY is configured the message is relayed
 * server-side. If it is not, the endpoint reports `fallback` and the
 * client opens a prefilled mail draft instead. No credential is ever
 * exposed to the browser, and no secret is required for the site to
 * work.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Generous enough to never inconvenience a real visitor. */
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/**
 * Allowed browser origin. This endpoint is intentionally
 * unauthenticated, so same-origin enforcement is what prevents a
 * third-party site from driving submissions through a visitor's
 * browser (CSRF). Requests with no Origin header — curl, monitoring,
 * server-to-server — are not browser-driven and are allowed through.
 */
const ALLOWED_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin');
  // No Origin = not a browser form post.
  if (!origin) return true;

  const host = request.headers.get('host');
  try {
    const originHost = new URL(origin).host;
    // Same-origin deployment: compare against the live host.
    if (host && originHost === host) return true;
  } catch {
    return false;
  }

  // Fall back to the configured canonical origin.
  return ALLOWED_ORIGIN.length > 0 && origin === ALLOWED_ORIGIN;
}

/** Constant generic message — never leaks why a request failed. */
function error(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export async function POST(request: Request) {
  // 1. Method enforcement (Next only routes POST here, but an explicit
  //    guard keeps the contract obvious and survives refactors).
  if (request.method !== 'POST') {
    return error(405, 'Method not allowed.');
  }

  // 2. Same-origin (CSRF) + content type
  if (!originAllowed(request)) {
    return error(403, 'Forbidden.');
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return error(415, 'Unsupported media type.');
  }

  // 3. Request size — checked before parsing so a huge body is never
  //    buffered or JSON-parsed.
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return error(413, 'Submission too large.');
  }

  // 4. Rate limiting
  const ip = clientKey(request.headers);
  const limit = rateLimit(ip, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many messages. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limit.retryAfter),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  // 5. Parse + validate
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return error(413, 'Submission too large.');
    raw = JSON.parse(text);
  } catch {
    return error(400, 'Could not read submission.');
  }

  const result = validateContact(raw);
  if (!result.ok || !result.value) {
    // Field-level detail is safe here: it describes our own rules, not
    // our internals, and lets the form highlight the right input.
    return error(422, 'Please check the highlighted fields.', { fields: result.errors });
  }

  // 6. Honeypot — bots fill every input. Respond exactly as on success
  //    so the bot learns nothing, but deliver nothing.
  if (isBot(result.value)) {
    return NextResponse.json({ ok: true, delivered: 'discarded' });
  }

  const { name, email, projectType, message } = result.value;
  const to = process.env.CONTACT_TO_EMAIL || profile.email;

  // 7. Optional server-side delivery.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
          to: [to],
          reply_to: email, // user-supplied but constrained to a valid address
          subject: `[Portfolio] ${projectType} — ${name}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Project type: ${projectType}`,
            '',
            message,
          ].join('\n'),
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        // Log server-side only; the visitor sees the mailto fallback.
        console.error('[contact] delivery failed with status', res.status);
        return NextResponse.json({ ok: true, delivered: 'fallback', to });
      }

      return NextResponse.json({ ok: true, delivered: 'sent' });
    } catch (error) {
      console.error('[contact] delivery error', error);
      return NextResponse.json({ ok: true, delivered: 'fallback', to });
    }
  }

  // No mail credential configured — hand back a safe fallback.
  return NextResponse.json({ ok: true, delivered: 'fallback', to });
}

/** Anything other than POST is rejected explicitly. */
export async function GET() {
  return error(405, 'Method not allowed.');
}
export async function PUT() {
  return error(405, 'Method not allowed.');
}
export async function PATCH() {
  return error(405, 'Method not allowed.');
}
export async function DELETE() {
  return error(405, 'Method not allowed.');
}
export async function OPTIONS() {
  return error(405, 'Method not allowed.');
}
export async function HEAD() {
  return new NextResponse(null, { status: 405 });
}