'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { profile, resumeConfig } from '@/data/content';

/**
 * RESUME CINEMATIC — DOWNLOAD RESUME opens a fullscreen overlay:
 * hero.mp4 plays once (autoplay, muted, playsInline, no loop, no
 * controls), real playback progress is shown (currentTime / duration),
 * and only when the video ENDS does the actual PDF download fire.
 * Video failure falls back to a short pixel transition + download.
 * Scroll position is untouched — the overlay floats above the page.
 */

type Phase = 'loading' | 'ready' | 'saved';

export function useResumeDownload() {
  const [open, setOpen] = useState(false);
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setOpen(true);
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      startedRef.current = false;
    }, 1200);
  }, []);

  return { open, start, finish };
}

export function ResumeCinematic({ open, onFinish }: { open: boolean; onFinish: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(0); // 0..1 real playback progress
  const [videoOk, setVideoOk] = useState(true);
  const triggeredRef = useRef(false);

  // reset + play each time the overlay opens
  useEffect(() => {
    if (!open) return;
    triggeredRef.current = false;
    setPhase('loading');
    setProgress(0);
    setVideoOk(true);

    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.load();

    const tryPlay = () => {
      v.play().catch(() => {
        // browsers block even muted autoplay in rare cases — fall back gracefully
        setVideoOk(false);
      });
    };
    v.addEventListener('loadeddata', tryPlay, { once: true });
    tryPlay();

    return () => {
      v.removeEventListener('loadeddata', tryPlay);
      v.pause();
    };
  }, [open]);

  /** RESUME READY → download the exact PDF once → close */
  const completeFlow = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setPhase('ready');
    triggerDownload();

    setTimeout(() => {
      setPhase('saved');
      setTimeout(onFinish, 800);
    }, 1200);
  }, [onFinish]);

  // safety watchdog: never strand the visitor on the overlay
  useEffect(() => {
    if (!open) return;
    const watchdog = setTimeout(() => {
      if (!triggeredRef.current) {
        setVideoOk(false);
        completeFlow();
      }
    }, 20000);
    return () => clearTimeout(watchdog);
  }, [open, completeFlow]);

  // Escape closes (still downloads — the intent was explicit)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') completeFlow();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, completeFlow]);

  const statusText =
    phase === 'loading'
      ? 'PREPARING RESUME…'
      : phase === 'ready'
        ? 'RESUME READY'
        : 'RESUME SAVED — HAPPY READING';

  const blocks = Math.round(progress * 16);

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-navy transition-opacity duration-700 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Preparing resume download"
      aria-hidden={!open}
    >
      {/* pixel fallback layer when video is unavailable */}
      {!videoOk && open && <PixelRain />}

      {/* the official resume loading video — plays once, never loops */}
      <video
        ref={videoRef}
        src={resumeConfig.video}
        className={`absolute inset-0 h-full w-full object-contain ${videoOk ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onEnded={completeFlow}
        onError={() => setVideoOk(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration > 0) setProgress(Math.min(1, v.currentTime / v.duration));
        }}
      />

      {/* cinematic grade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/70 via-transparent to-navy/85" />

      {/* overlay text */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="kicker text-[10px] text-baby-dim md:text-xs">GOKUL KRISHANA</p>
        <p className="kicker mt-3 text-[10px] tracking-widest2 text-slate-300 md:text-xs">{statusText}</p>

        <div className="mt-6 h-0.5 w-60 overflow-hidden rounded-full bg-white/15 md:w-72">
          <div
            className="h-full rounded-full bg-gradient-to-r from-baby-deep via-baby to-sun transition-[width] duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="kicker mt-4 text-[9px] tabular-nums text-baby-dim">
          {'█'.repeat(blocks)}
          {'░'.repeat(16 - blocks)} {Math.round(progress * 100)}%
        </p>

        {!videoOk && phase === 'loading' && (
          <p className="kicker mt-6 text-[9px] text-slate-500">VIDEO UNAVAILABLE — CONTINUING…</p>
        )}

        <button
          onClick={completeFlow}
          className="kicker mt-10 text-[10px] text-slate-400 underline-offset-4 transition hover:text-baby hover:underline"
        >
          SKIP →
        </button>
      </div>
    </div>
  );
}

/** Short, premium pixel transition used when the video cannot play. */
function PixelRain() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid overflow-hidden"
      style={{ gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(8, 1fr)' }}
    >
      {Array.from({ length: 128 }).map((_, i) => (
        <span
          key={i}
          className="animate-pulse-soft"
          style={{
            backgroundColor: ['#0A1220', '#4FA9F0', '#FFD34D', '#E4574F'][i % 4],
            animationDelay: `${(i % 16) * 0.06}s`,
            animationDuration: '1.6s',
          }}
        />
      ))}
    </div>
  );
}

/** Download the exact uploaded PDF — no rewriting, no conversion. */
function triggerDownload() {
  const a = document.createElement('a');
  a.href = resumeConfig.pdf;
  a.download = resumeConfig.pdfName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
