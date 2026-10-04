'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * ============================================================
 *  RESUME DOCUMENT — real PDF pages rendered to <canvas>.
 * ============================================================
 *
 * Why canvas instead of <iframe>:
 *
 * An <iframe src="....pdf"> relies entirely on the browser's built-in PDF
 * plugin. That is not dependable:
 *   • iOS Safari never renders a PDF in a frame at all — it discards the
 *     frame and hands the file to its native full-screen viewer;
 *   • mobile browsers and Firefox vary in whether they will render it at
 *     all, and will happily show a blank frame when they decide not to.
 *
 * PDF.js draws the page into a canvas we own, so the pages are visible
 * everywhere and cannot be taken over by a native viewer.
 *
 * The worker is served from /pdf.worker.min.mjs (copied into public/ by
 * scripts/copy-pdf-worker.mjs) rather than a CDN, because the site ships a
 * strict CSP (`script-src 'self'`) that would block a remote worker.
 */

type Props = {
  /** URL of the PDF */
  file: string;
  /** 1-based page to render */
  page: number;
  /** total pages, once known */
  numPages: number;
  /** report the real page count back up, once the document parses */
  onLoaded?: (pages: number) => void;
  /** zoom scale applied on top of the fitted size */
  scale?: number;
  className?: string;
};

type Status = 'loading' | 'ready' | 'error';

export function ResumeDocument({
  file,
  page,
  numPages,
  onLoaded,
  scale = 1,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<{ cancel?: () => void } | null>(null);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);
  const [errorText, setErrorText] = useState('');

  /* ---------------------------------------------------------------- */
  /* load the document once                                           */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    let loaded: Awaited<ReturnType<typeof loadPdf>> | null = null;

    setStatus('loading');
    setErrorText('');

    (async () => {
      try {
        loaded = await loadPdf(file);
        if (cancelled) {
          void loaded?.destroy?.();
          return;
        }
        docRef.current = loaded;
        setStatus('ready');
        onLoadedRef.current?.(loaded.numPages);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setErrorText(err instanceof Error ? err.message : 'Unable to load resume');
      }
    })();

    return () => {
      cancelled = true;
      // Tear the document down so the worker is not kept alive after the
      // viewer closes.
      void loaded?.destroy?.();
      docRef.current = null;
    };
  }, [file, attempt]);

  /* ---------------------------------------------------------------- */
  /* paint the current page                                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const doc = docRef.current;
    if (!canvas || !doc || status !== 'ready') return;

    let cancelled = false;

    (async () => {
      try {
        const pdfPage = await doc.getPage(Math.min(Math.max(page, 1), numPages || page));
        if (cancelled) return;

        const viewport = pdfPage.getViewport({ scale });

        // Cap the backing store so a high-DPI phone does not allocate a
        // multi-megapixel canvas for no visible gain.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssWidth = viewport.width;
        const cssHeight = viewport.height;

        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is unavailable in this browser');

        const renderViewport = pdfPage.getViewport({ scale: scale * dpr });

        renderTaskRef.current?.cancel?.();
        const task = pdfPage.render({ canvasContext: ctx, viewport: renderViewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && /cancel/i.test(err.message)) return; // superseded render
        setStatus('error');
        setErrorText(err instanceof Error ? err.message : 'Unable to render resume');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, numPages, scale, status]);

  /* ---------------------------------------------------------------- */
  /* render states                                                     */
  /* ---------------------------------------------------------------- */

  if (status === 'error') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-center ${className}`}
        style={{ minHeight: 240 }}
        role="alert"
      >
        <p className="kicker text-[9px] text-sun">UNABLE TO LOAD RESUME</p>
        <p className="max-w-xs text-[11px] leading-relaxed text-slate-400">
          {errorText || 'The document could not be displayed.'}
        </p>
        <button
          type="button"
          onClick={() => setAttempt((a) => a + 1)}
          className="rounded-full border border-white/20 px-6 py-3 font-display text-[10px] font-bold tracking-[0.18em] text-white transition-colors hover:border-baby hover:text-baby"
        >
          RETRY
        </button>
        <p className="pt-2 text-[10px] text-slate-500">
          You can still{' '}
          <a href={file} download className="text-baby underline underline-offset-4">
            download the PDF
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {status === 'loading' && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-navy/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-baby" aria-hidden="true" />
          <p className="kicker text-[9px] text-baby-dim">LOADING RESUME</p>
          <p className="kicker text-[8px] text-slate-600">GOKUL KRISHANA</p>
        </div>
      )}
      {/* the rendered page. role="img" with a label because a canvas has no
          intrinsic accessible content of its own. */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Gokul Krishana resume, page ${page} of ${numPages}`}
        className="mx-auto rounded-xl border border-white/15 bg-white shadow-2xl"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* loader                                                             */
/* ------------------------------------------------------------------ */

/**
 * Imports PDF.js lazily on the client and points it at our self-hosted
 * worker. Kept out of module scope so nothing touches `window` during SSR.
 */
async function loadPdf(file: string): Promise<PDFDocumentProxy> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const task = pdfjs.getDocument({
    url: file,
    // Avoid `eval` inside the worker and don't prefetch the whole file.
    isEvalSupported: false,
    disableAutoFetch: true,
  });

  return task.promise;
}