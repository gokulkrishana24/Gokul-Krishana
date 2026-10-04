'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { resumeConfig } from '@/data/content';
import { useResume } from '@/lib/resume';
import { useReducedMotion } from '@/lib/useIsTouch';

/**
 * RESUME LOADING OVERLAY — the cinematic beat that plays between an
 * explicit DOWNLOAD RESUME click and the browser actually saving the
 * file.
 *
 * hero.mp4 plays here as the loading experience, and the download is
 * released when the clip genuinely finishes (see download() in
 * @/lib/resume, which also carries a fallback timer so a video that
 * cannot load can never trap the visitor).
 *
 * This component performs no download itself and never touches the PDF.
 * It only reports that the video ended.
 */
export function ResumePreparing() {
  const { preparing, progress, videoDone, downloaded, videoRef, notifyVideoEnd } = useResume();
  const reduced = useReducedMotion();
  const pct = Math.round(Math.min(1, progress) * 100);
  const ready = videoDone || pct >= 100;

  /* Kick playback off as soon as the overlay exists, so the clip is
     actually running rather than waiting on a user gesture we already
     have (the click that opened this overlay). */
  useEffect(() => {
    if (!preparing) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      // Autoplay refused (policy, codec, low power): the fallback timer
      // in the provider still releases the download.
      p.catch(() => undefined);
    }
  }, [preparing, videoRef]);

  return (
    <AnimatePresence>
      {preparing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-navy"
          role="status"
          aria-live="polite"
          aria-label={ready ? 'Resume ready, download starting' : 'Preparing your resume'}
        >
          {/* the loading experience: hero.mp4, muted and inline */}
          {!reduced && (
            <video
              ref={videoRef}
              src={resumeConfig.video}
              className="absolute inset-0 h-full w-full object-cover opacity-45"
              autoPlay
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              onEnded={notifyVideoEnd}
              onError={notifyVideoEnd}
            />
          )}

          {/* atmosphere keeps the type legible over the footage */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy" />
          <div aria-hidden="true" className="digital-grid absolute inset-0 opacity-25" />
          <motion.div
            aria-hidden="true"
            className="absolute -inset-1/4"
            animate={{ opacity: [0.22, 0.45, 0.22] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(ellipse 45% 40% at 50% 45%, rgba(91,174,224,0.22), transparent 70%)',
            }}
          />

          <div className="relative z-10 w-full max-w-md px-8 text-center">
            <p className="kicker text-[10px] text-baby-dim">GOKUL KRISHANA</p>

            <h2 className="headline mt-4 text-2xl font-bold text-white sm:text-3xl">
              {ready ? 'RESUME READY' : 'PREPARING YOUR RESUME'}
            </h2>

            {/* progress rail */}
            <div className="mt-8 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className={`h-full rounded-full ${ready ? 'bg-sun' : 'bg-baby'}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="kicker text-[9px] text-slate-500">
                {ready ? 'SAVED TO YOUR DEVICE' : 'LOADING…'}
              </span>
              <span className="kicker text-[9px] text-slate-400">{pct}%</span>
            </div>

            {/* segmented rail — echoes the pixel identity without distracting */}
            <div aria-hidden="true" className="mt-6 flex justify-center gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="h-3 w-[3px] rounded-[1px]"
                  animate={{
                    backgroundColor:
                      i / 24 < progress ? 'rgba(255,211,77,0.85)' : 'rgba(255,255,255,0.10)',
                  }}
                  transition={{ duration: 0.25, delay: i * 0.008 }}
                />
              ))}
            </div>

            {downloaded && (
              <p className="mt-6 text-[11px] text-slate-500">
                If your browser blocked the save, use the DOWNLOAD PDF button in the viewer.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}