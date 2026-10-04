/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Canonical origin. NEXT_PUBLIC_SITE_URL is public by design, so it is
 * safe to reference here. Falls back to the Vercel production domain.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gokulkrishana.vercel.app').replace(
  /\/$/,
  '',
);

/**
 * Content-Security-Policy.
 *
 * Built from what the site actually needs — no broad wildcards:
 *   • script-src  — Next.js runtime + GSAP/Framer/Three (three.js is
 *     code-split and only fetched on capable devices, but it must be
 *     allowed up front).
 *   • style-src   — inline styles are required by Framer Motion and
 *     the GSAP-driven inline transforms, so 'unsafe-inline' is
 *     unavoidable here; scripts remain locked down.
 *   • img-src     — self + data: (inline SVG/canvas) + blob: (object
 *     URLs for any generated media).
 *   • media-src   — self only; all footage is served from /public.
 *   • connect-src — self only. Nothing is fetched from a third party
 *     at runtime: fonts are self-hosted by next/font at build time.
 *   • frame-src   — 'self' only, and only because the resume viewer
 *     frames the self-hosted PDF. Nothing third-party can be framed.
 *   • object-src — 'self', same reason: the PDF plugin document.
 */
const csp = [
  "default-src 'self'",
  // Next.js injects inline bootstrap scripts; hashes are impractical to
  // maintain across builds, so we keep 'unsafe-inline' here ONLY.
  // 'unsafe-eval' is required by React Refresh in dev and is absent
  // in production, which is where this policy actually matters.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

/**
 * CSP for the resume PDF itself.
 *
 * Identical to the site policy EXCEPT it drops `frame-ancestors 'none'`.
 *
 * Why: the premium resume viewer embeds this PDF in an <iframe>. A
 * `frame-ancestors 'none'` (and the matching X-Frame-Options: DENY)
 * instructs the browser to REFUSE to render the document inside a frame
 * at all, which is what produced the blank/broken document area in the
 * viewer. Every other protection is kept, so the file still cannot be
 * framed by any other origin, scripted, or used as an object.
 *
 * Only the PDF gets this policy. All real pages keep frame-ancestors
 * 'none' + X-Frame-Options: DENY, so clickjacking protection is
 * unchanged everywhere that actually matters.
 */
const cspEmbeddable = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  // NOTE: no frame-ancestors — this document is meant to be framed by
  // the resume viewer on this same origin.
  'upgrade-insecure-requests',
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,

  // Production source maps would publish the full component tree.
  // Errors are handled server-side instead.
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // Explicitly deny camera, microphone and geolocation. The
            // FaceRecognitionAI section is a showcase only — nothing
            // here ever requests a device permission.
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), ' +
              'interest-cohort=(), browsing-topics=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          {
            key: 'Strict-Transport-Security',
            // TLS is terminated by the host (Vercel), which also
            // performs the HTTP -> HTTPS redirect.
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // The resume PDF must be framable by the viewer on this origin.
        // It keeps the full CSP, nosniff, referrer and permissions
        // policy — but no X-Frame-Options and no frame-ancestors, both of
        // which made browsers refuse to display it and left the viewer
        // showing a blank document.
        source: '/resume/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspEmbeddable },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), ' +
              'interest-cohort=(), browsing-topics=()',
          },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // API responses are same-origin only; never wildcard CORS.
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: SITE_URL },
          { key: 'Vary', value: 'Origin' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ];
  },
};

export default nextConfig;