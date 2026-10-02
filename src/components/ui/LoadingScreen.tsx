'use client';

import { useEffect, useState } from 'react';
import { profile } from '@/data/content';

/**
 * LOADING SCREEN — GOKUL KRISHANA + ENTERING DIGITAL SPACE.
 *
 * Deliberately brief, and deliberately impossible to get stuck on.
 *
 * Progress is driven by a CSS animation rather than a
 * requestAnimationFrame loop: rAF is throttled or suspended in
 * background tabs and on low-power devices, and a loading screen that
 * depends on it can end up permanently covering the site. CSS keeps
 * ticking regardless, and a hard timer watchdog force-completes the
 * screen regardless of everything else.
 */

const DURATION_MS = 1400;
/** Absolute ceiling — after this the screen goes away, no questions asked. */
const WATCHDOG_MS = 3200;
/** Blocks rendered in the pixel progress readout. */
const BLOCKS = 14;

export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Two independent paths to dismissal, so neither can strand the
    // visitor: the intended timer, and an unconditional watchdog.
    const intended = window.setTimeout(() => setDone(true), DURATION_MS);
    const watchdog = window.setTimeout(() => {
      setDone(true);
      setHidden(true);
    }, WATCHDOG_MS);

    // unmount the node once the fade has played out
    const unmount = window.setTimeout(() => setHidden(true), WATCHDOG_MS - 400);

    return () => {
      window.clearTimeout(intended);
      window.clearTimeout(watchdog);
      window.clearTimeout(unmount);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-navy transition-opacity duration-700 ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={done}
      role="status"
      aria-label="Loading"
    >
      <div className="digital-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <p className="kicker text-[10px] text-baby-dim">PORTFOLIO · 2026</p>
        <h1 className="headline mt-5 text-4xl font-bold tracking-wide text-white md:text-6xl">
          {profile.name}
        </h1>
        <p className="kicker mt-4 text-[10px] text-muted md:text-xs">ENTERING DIGITAL SPACE…</p>

        <div className="mt-7 h-px w-56 overflow-hidden bg-white/10 md:w-72">
          <div
            className="h-full bg-gradient-to-r from-baby-deep via-baby to-sun"
            style={{
              width: '100%',
              transformOrigin: 'left',
              animation: `loadingBar ${DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
            }}
          />
        </div>

        {/* Static readout: honest about the stage, never a fake live counter */}
        <p className="kicker mt-4 text-[9px] text-baby-dim">
          {'█'.repeat(BLOCKS)} loading
        </p>
      </div>

      <style>{`@keyframes loadingBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}