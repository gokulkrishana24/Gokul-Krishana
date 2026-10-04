'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { profile, resumeConfig } from '@/data/content';

/**
 * CINEMATIC INTRO — hero.mp4 plays BEFORE the portfolio is usable.
 *
 * Flow: open site → intro (hero.mp4) → hero → visitor may open the
 * resume. The resume button is unreachable until the intro clears,
 * because this overlay owns the pointer and the scroll position while
 * it is up.
 *
 * The PDF is never involved here. Nothing on this screen downloads,
 * opens or pre-fetches the resume.
 *
 * It is deliberately impossible to get stuck on: progress comes from
 * real video playback, but two independent watchdogs force the screen
 * away regardless of what the codec, the network or the tab does.
 * (A loading screen that depends on requestAnimationFrame can hang
 * forever in a background tab or on a low-power device — CSS and
 * setTimeout keep ticking, so those are what gate the exit.)
 */

/** Never linger longer than this, whatever the video is doing. */
const WATCHDOG_MS = 6000;
/** Shortest time the intro is allowed to stay up. */
const MIN_MS = 900;

type Phase = 'play' | 'out' | 'gone';

export function LoadingScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('play');
  const [progress, setProgress] = useState(0);
  const [videoOk, setVideoOk] = useState(true);

  // Dismisses the intro. Deliberately touches nothing else — no file is
  // fetched, opened or moved, and no resume state is advanced here.
  const finish = useCallback(() => {
    setPhase((p) => (p === 'gone' ? p : 'out'));
    window.setTimeout(() => setPhase('gone'), 850);
  }, []);

  useEffect(() => {
    // scroll lock for the duration of the intro
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const v = videoRef.current;
    if (reduced) {
      // No cinema for visitors who asked for less motion — a beat, then in.
      const quick = window.setTimeout(finish, MIN_MS);
      return () => {
        window.clearTimeout(quick);
        document.body.style.overflow = prev;
      };
    }

    const play = () => v?.play().catch(() => setVideoOk(false));
    if (v) {
      v.currentTime = 0;
      v.addEventListener('loadeddata', play, { once: true });
      play();
    }

    const intended = window.setTimeout(finish, WATCHDOG_MS);
    const watchdog = window.setTimeout(finish, WATCHDOG_MS + 600);
    const hold = window.setTimeout(finish, MIN_MS + 2500);

    return () => {
      window.clearTimeout(intended);
      window.clearTimeout(watchdog);
      window.clearTimeout(hold);
      window.removeEventListener('loadeddata', play);
      v?.pause();
      document.body.style.overflow = prev;
    };
  }, [finish]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-navy transition-opacity duration-700 ${
        phase === 'out' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-label="Loading portfolio"
      onClick={finish}
    >
      {/* hero.mp4 — the cinematic opening, muted and inline so it can
          autoplay everywhere without ever stealing focus or sound */}
      {videoOk && (
        <video
          ref={videoRef}
          src={resumeConfig.video}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={finish}
          onError={() => setVideoOk(false)}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (el.duration > 0) setProgress(Math.min(1, el.currentTime / el.duration));
          }}
        />
      )}

      {/* atmosphere over the footage keeps type legible */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy" />
      <div aria-hidden="true" className="digital-grid absolute inset-0 opacity-40" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <p className="kicker text-[10px] text-baby-dim">PORTFOLIO · 2026</p>
        <h1 className="headline mt-5 text-4xl font-bold tracking-wide text-white md:text-6xl">
          {profile.name}
        </h1>
        <p className="kicker mt-4 text-[10px] text-muted md:text-xs">
          {videoOk ? 'WELCOME TO MY DIGITAL UNIVERSE' : 'ENTERING DIGITAL SPACE…'}
        </p>

        <div className="mt-7 h-px w-56 overflow-hidden bg-white/10 md:w-72">
          <div
            className="h-full bg-gradient-to-r from-baby-deep via-baby to-sun transition-[width] duration-200"
            style={{ width: `${Math.max(6, Math.round(progress * 100))}%` }}
          />
        </div>

        <button
          type="button"
          onClick={finish}
          className="kicker mt-6 text-[9px] text-slate-500 transition-colors duration-300 hover:text-baby"
        >
          SKIP →
        </button>
      </div>
    </div>
  );
}