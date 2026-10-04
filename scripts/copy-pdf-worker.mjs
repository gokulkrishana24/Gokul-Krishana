/**
 * Copies the PDF.js worker out of node_modules into public/ at build time.
 *
 * Why this exists: the site ships a strict CSP (`script-src 'self'`), so
 * pointing PDF.js at a CDN worker would be blocked outright. The worker
 * has to be served from our own origin. Next.js does not copy files out
 * of node_modules for us, so we do it here — wired into `postinstall` and
 * `prebuild` so it is always present before a build or a fresh install.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destDir = join(root, 'public');
const dest = join(destDir, 'pdf.worker.min.mjs');

if (!existsSync(src)) {
  // pdfjs-dist not installed (e.g. production-only install without dev
  // deps) — nothing to do, and the viewer degrades to its error state.
  console.log('[pdf-worker] pdfjs-dist not present, skipping.');
  process.exit(0);
}

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log('[pdf-worker] copied pdf.worker.min.mjs -> public/');