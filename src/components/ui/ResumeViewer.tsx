'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { profile, resumeConfig } from '@/data/content';
import { useReducedMotion } from '@/lib/useIsTouch';
import { useResume } from '@/lib/resume';
import { BackgroundVideo } from './BackgroundVideo';
import { ResumeDocument } from './ResumeDocument';

/**
 * RESUME VIEWER — the immersive viewer behind "VIEW / DOWNLOAD RESUME".
 *
 * The single most important rule this component enforces:
 *
 *   OPENING THE VIEWER NEVER DOWNLOADS OR OPENS THE PDF.
 *
 * The <iframe> is not even mounted until the visitor asks for it, so the
 * PDF is never fetched on page load. The only thing that touches the
 * download path is an explicit click on DOWNLOAD — which is a plain
 * anchor with `download`, so it also works with JS disabled and is
 * visible to the browser's own UI.
 *
 * Everything else is presentation layered *behind* the document, so the
 * resume itself always stays the focus:
 *   1. deep navy atmosphere
 *   2. baby-blue ambient light that drifts and follows the pointer
 *   3. sunshine-yellow particles
 *   4. a handful of controlled red accent particles
 *   5. a fine technical grid
 *   6. slow abstract light trails
 *   7. dedicated viewer footage (NOT hero.mp4 — that is the intro and the
 *      download loading sequence) at a whisper of opacity, desktop only
 *
 * Interaction:
 *   • mouse over the stage → subtle rotateX/rotateY (max ±2.5°) + a
 *     reflection that slides across the page
 *   • the DRAG strip under the document → touch parallax, spring back
 *   • zoom in / out / reset, page previous / next, all as real controls
 *
 * Page count is read from the PDF itself (a byte scan for page objects)
 * rather than hard-coded, so replacing the resume cannot desync the UI.
 */

/** Degrees. Beyond this the document stops reading as a physical sheet. */
const MAX_TILT = 2.5;
/** `'fit'` shows the whole page; numbers are the PDF viewer's own zoom. */
type ZoomMode = 'fit' | number;
const ZOOM_STEPS: ZoomMode[] = ['fit', 75, 100, 125, 150, 200];

/* ------------------------------------------------------------------ */
/* Deterministic particles — a fixed seed keeps SSR and the client    */
/* in agreement, so the overlay never triggers a hydration mismatch.   */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Mote = { left: number; top: number; size: number; dur: number; delay: number; drift: number; red: boolean };

const MOTES: Mote[] = (() => {
  const rnd = mulberry32(20260803);
  return Array.from({ length: 34 }, (_, i) => ({
    left: rnd() * 100,
    top: rnd() * 100,
    size: 1 + rnd() * 2.4,
    dur: 9 + rnd() * 15,
    delay: -rnd() * 22,
    drift: (rnd() * 2 - 1) * 26,
    red: i % 6 === 0,
  }));
})();

/* ------------------------------------------------------------------ */
/* Hook — mounted once at the shell, shared by Hero and Contact       */
/* ------------------------------------------------------------------ */

export function useResumeViewer() {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  return { open, show, close };
}

/* ------------------------------------------------------------------ */
/* Viewer                                                             */
/* ------------------------------------------------------------------ */

/** Safari still exposes only the prefixed fullscreen API. */
type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

export function ResumeViewer() {
  const { viewOpen: open, closeView: onClose } = useResume();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const grab = useRef<{ id: number | null; x: number; y: number; ox: number; oy: number }>({
    id: null, x: 0, y: 0, ox: 0, oy: 0,
  });

  const reduced = useReducedMotion();
  /**
   * iOS Safari cannot display a PDF in an iframe — it throws the frame away
   * and opens the file full-screen in its native viewer. So on iOS the
   * document is never mounted; the visitor gets an explicit, clearly
   * labelled tap-to-open panel instead. Nothing is ever fetched or opened
   * without that tap.
   */
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState<ZoomMode>('fit');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  /* --- open: reset state and remember what had focus --- */
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    setPage(1);
    setZoom('fit');
    setTilt({ rx: 0, ry: 0 });
    setParallax({ x: 0, y: 0 });

    // No page counting here any more: PDF.js reports the real page count
    // once the document parses, so the file is fetched exactly once, by
    // the renderer that actually needs it.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  /* --- scroll lock while the viewer owns the screen --- */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* --- Escape closes; focus returns to whatever opened the viewer --- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    openerRef.current?.focus?.();
    openerRef.current = null;
  }, [open]);

  /* --- page and zoom are plain state now: the canvas re-renders from them --- */
  const goToPage = useCallback(
    (next: number) => {
      setPage(Math.min(Math.max(1, next), Math.max(pages, 1)));
    },
    [pages],
  );

  const setZoomMode = useCallback((next: ZoomMode) => setZoom(next), []);

  const stepZoom = useCallback(
    (direction: 1 | -1) => {
      const index = ZOOM_STEPS.indexOf(zoom);
      const next = ZOOM_STEPS[Math.min(Math.max(index + direction, 0), ZOOM_STEPS.length - 1)];
      if (next !== zoom) setZoomMode(next);
    },
    [zoom, setZoomMode],
  );

  const resetView = useCallback(() => {
    setZoom('fit');
    setTilt({ rx: 0, ry: 0 });
    setParallax({ x: 0, y: 0 });
    setPage(1);
  }, []);

  /**
   * Fit-to-height scale for the canvas: how much to shrink the natural
   * A4 page so it fits the stage. Recomputed on resize so rotating a
   * phone reflows the document instead of leaving it clipped.
   */
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      const w = el.clientWidth;
      if (h <= 0 || w <= 0) return;
      // natural A4 page is 595 x 842pt
      setFitScale(Math.min((h * 0.92) / 842, (w * 0.96) / 595));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  /* --- pointer tilt (desktop) --- */
  const onStageMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === 'touch') return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
    setTilt({ rx: -ny * MAX_TILT, ry: nx * MAX_TILT });
  };

  const onStageLeave = () => setTilt({ rx: 0, ry: 0 });

  /* --- touch parallax via the dedicated drag strip --- */
  const onGrabDown = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    grab.current = { id: t.identifier, x: t.clientX, y: t.clientY, ox: parallax.x, oy: parallax.y };
  };

  const onGrabMove = (e: React.TouchEvent) => {
    const g = grab.current;
    if (g.id === null) return;
    const list = e.touches;
    let t: Touch | null = null;
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].identifier === g.id) t = list[i] as Touch;
    }
    if (!t) return;
    if (reduced) return;
    const dx = t.clientX - g.x;
    const dy = t.clientY - g.y;
    setParallax({ x: Math.max(-26, Math.min(26, g.ox + dx * 0.35)), y: Math.max(-18, Math.min(18, g.oy + dy * 0.35)) });
    setTilt({ rx: -dy * 0.02, ry: dx * 0.02 });
  };

  const onGrabUp = () => {
    grab.current.id = null;
    setParallax({ x: 0, y: 0 });
    setTilt({ rx: 0, ry: 0 });
  };

  const zoomLabel = zoom === 'fit' ? 'FIT' : `${zoom}%`;

  /* Fullscreen support, including Safari's prefixed API. */
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const el = document.documentElement as FullscreenCapableElement;
    setCanFullscreen(
      Boolean(el.requestFullscreen || el.webkitRequestFullscreen),
    );

    const onChange = () => {
      const active = Boolean(document.fullscreenElement ?? el.webkitFullscreenElement);
      setIsFullscreen(active);
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = document.documentElement as FullscreenCapableElement;
    try {
      if (document.fullscreenElement ?? el.webkitFullscreenElement) {
        await (document.exitFullscreen?.() ?? el.webkitExitFullscreen?.());
      } else {
        await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
      }
    } catch {
      // Denied (iOS Safari has no Element API at all, or the user
      // dismissed it) — the control simply does nothing.
    }
  }, []);
  const scroll = (tilt.rx + 90) / 180; // 0..1 → where the reflection sits

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-navy"
      role="dialog"
      aria-modal="true"
      aria-label="Resume viewer"
    >
      {/* ---------------- atmosphere layers, all behind the document ------------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* 1 — deep navy base. Painted FIRST so it sits underneath the
        footage rather than on top of it: these are all positioned
        siblings with no z-index, so document order decides which one
        wins. Putting the opaque base after the video hid it completely. */}
        <div className="absolute inset-0 bg-navy" />

        {/* 2 — dedicated viewer footage, NOT hero.mp4 (that belongs to the
        intro and the download sequence). Sits on the base and under the
        ambient layers, so it is actually visible while staying well below
        the document. It silently falls back to the CSS layers if the file
        is absent, and lazy-mounts, so it only loads once the visitor
        actually opens the viewer. */}
        <BackgroundVideo src={resumeConfig.viewerVideo} opacity={0.3} />

        {/* 2 — baby-blue ambient light: drifts on its own, brightens toward the pointer */}
        <div
          className="animate-ambient absolute -inset-1/4"
          style={{
            background:
              'radial-gradient(ellipse 45% 40% at 50% 45%, rgba(91,174,224,0.20), transparent 70%)',
          }}
        />

        {/* 5 — fine technical grid */}
        <div className="digital-grid absolute inset-0 opacity-30" />

        {/* 6 — slow abstract light trails */}
        <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full" fill="none">
          <path
            d="M -50 640 C 260 470, 430 720, 700 560 S 1050 330, 1260 430"
            stroke="rgba(142,203,242,0.16)"
            strokeWidth="1.5"
            filter="blur(3px)"
          />
          <path
            d="M -50 200 C 240 320, 470 90, 760 230 S 1060 520, 1260 380"
            stroke="rgba(255,211,77,0.10)"
            strokeWidth="1.5"
            filter="blur(3px)"
          />
        </svg>

        {/* 3 + 4 — particles: sunshine yellow, with a few controlled red accents */}
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              background: m.red ? 'rgba(255,92,92,0.55)' : 'rgba(255,211,77,0.75)',
              boxShadow: m.red ? '0 0 6px rgba(255,92,92,0.4)' : '0 0 6px rgba(255,211,77,0.4)',
              opacity: m.red ? 0.45 : 0.7,
              animation: `moteFloat ${m.dur}s ${m.delay}s linear infinite`,
              ['--drift' as string]: `${m.drift}px`,
            }}
          />
        ))}

        <style>{`
          @keyframes moteFloat {
            0%   { transform: translate3d(0, 0, 0); }
            50%  { transform: translate3d(var(--drift, 10px), -22px, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          @keyframes ambientDrift {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50%      { transform: translate3d(2%, -2%, 0) scale(1.08); }
          }
          .animate-ambient { animation: ambientDrift 16s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .animate-ambient { animation: none; }
          }
        `}</style>
      </div>

      {/* ---------------- header chrome ---------------- */}
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-4 px-5 py-5 md:px-10">
        <div>
          <p className="kicker text-[9px] text-baby-dim">RESUME · {profile.name}</p>
          <p className="headline mt-1 text-lg font-bold text-white md:text-2xl">CURRICULUM VITAE</p>
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          data-cursor="CLOSE"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-display text-[10px] font-bold tracking-[0.18em] text-white transition-all duration-300 hover:border-accent-red hover:text-accent-red"
        >
          CLOSE <span aria-hidden="true">✕</span>
        </button>
      </header>

      {/* ---------------- the document ---------------- */}
      <div
        ref={stageRef}
        onPointerMove={onStageMove}
        onPointerLeave={onStageLeave}
        className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-2 md:px-10"
        style={{ perspective: '1600px' }}
      >
        <div
          className="relative max-h-full transition-transform duration-200 ease-out"
          style={{
            height: 'min(72svh, 860px)',
            aspectRatio: '1 / 1.414',
            maxWidth: '100%',
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* soft shadow that moves with the tilt */}
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[2rem] blur-2xl"
            style={{
              background: 'radial-gradient(ellipse 60% 55% at 50% 60%, rgba(0,0,0,0.75), transparent 72%)',
              transform: `translate3d(${-parallax.x * 1.4}px, ${14 - parallax.y * 0.6}px, -40px)`,
            }}
          />

          {/* the actual PDF — real pages drawn to a canvas by PDF.js, mounted
              only because the visitor asked for it. An iframe was used
              here before and rendered a blank document on any browser
              that would not display a PDF in a frame (iOS Safari
              always, plus various mobile builds). */}
          <ResumeDocument
            file={resumeConfig.pdf}
            page={page}
            numPages={pages}
            onLoaded={setPages}
            scale={zoom === 'fit' ? fitScale : zoom / 100}
          />

          {/* reflection that slides as the sheet tilts */}
          {!reduced && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-xl mix-blend-overlay"
              style={{
                background: `linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.16) ${Math.round(scroll * 100) - 14}%, rgba(255,255,255,0.03) ${Math.round(scroll * 100) + 12}%, transparent 62%)`,
              }}
            />
          )}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
        </div>
      </div>

      {/* touch drag strip — gives phones parallax without stealing the
          document's own scrolling */}
      <div
        onTouchStart={onGrabDown}
        onTouchMove={onGrabMove}
        onTouchEnd={onGrabUp}
        onTouchCancel={onGrabUp}
        className="relative z-20 mx-auto mt-3 flex h-7 w-32 shrink-0 cursor-ew-resize items-center justify-center rounded-full border border-white/10 md:hidden"
        aria-hidden="true"
      >
        <span className="h-1 w-10 rounded-full bg-white/25" />
      </div>

      {/* ---------------- controls ---------------- */}
      <div className="relative z-20 shrink-0 px-5 pb-7 pt-4 md:px-10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-3 gap-y-3">
          <Control onClick={() => goToPage(page - 1)} disabled={page <= 1} data-cursor="PREV">
            ← PREV
          </Control>

          <span className="kicker min-w-[92px] text-center text-[9px] text-slate-400">
            PAGE {page} / {pages}
          </span>

          <Control onClick={() => goToPage(page + 1)} disabled={page >= pages}>
            NEXT →
          </Control>

          <span aria-hidden="true" className="hidden h-6 w-px bg-white/10 sm:block" />

          <Control onClick={() => stepZoom(-1)} aria-label="Zoom out">
            −
          </Control>
          <span className="kicker min-w-[52px] text-center text-[9px] text-baby">{zoomLabel}</span>
          <Control onClick={() => stepZoom(1)} aria-label="Zoom in">
            +
          </Control>

          <Control onClick={resetView}>RESET VIEW</Control>

          {/* Fullscreen — offered only where the browser actually supports
              it, and never announced as available when it is not. */}
          {canFullscreen && (
            <Control onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}>
              {isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}
            </Control>
          )}

          {/* the ONLY path to the file — an explicit, user-initiated download */}
          <a
            href={resumeConfig.pdf}
            download={resumeConfig.pdfName}
            rel="noopener"
            data-cursor="DOWNLOAD"
            className="inline-flex items-center gap-2 rounded-full bg-baby px-6 py-3 font-display text-[10px] font-bold tracking-[0.18em] text-navy transition-all duration-300 hover:bg-sun active:scale-[0.98]"
          >
            DOWNLOAD PDF
          </a>
        </div>

        <p className="kicker mt-4 text-center text-[8px] text-slate-600">
          VIEWING ONLY — THE FILE DOWNLOADS WHEN YOU CHOOSE IT
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared control                                               */
/* ------------------------------------------------------------------ */

function Control({
  children,
  onClick,
  disabled,
  ...rest
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
} & Record<`data-${string}`, string>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 font-display text-[10px] font-bold tracking-[0.16em] text-slate-200 transition-all duration-300 hover:border-baby hover:text-baby disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-slate-200"
      {...rest}
    >
      {children}
    </button>
  );
}