'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useResume } from '@/lib/resume';

/**
 * RESUME LOADING OVERLAY — the "PREPARING RESUME" beat that plays between
 * an explicit DOWNLOAD RESUME click and the browser actually saving the
 * file.
 *
 * It is purely presentational. It performs no download itself: the file
 * has already been handed to the browser by the time the bar completes,
 * because download() fires its anchor click at exactly 100%.
 */
export function ResumePreparing() {
  const { preparing, progress, downloaded } = useResume();
  const pct = Math.round(Math.min(1, progress) * 100);
  const ready = pct >= 100;

  return (
    <AnimatePresence>
      {preparing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/95 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-label={ready ? 'Resume ready, download started' : 'Preparing resume'}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="digital-grid absolute inset-0 opacity-25" />
            <motion.div
              className="absolute -inset-1/4"
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background:
                  'radial-gradient(ellipse 45% 40% at 50% 45%, rgba(91,174,224,0.22), transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 w-full max-w-md px-8 text-center">
            <p className="kicker text-[10px] text-baby-dim">
              {ready ? 'RESUME READY' : 'PREPARING RESUME'}
            </p>

            <h2 className="headline mt-4 text-2xl font-bold text-white sm:text-3xl">
              {ready ? 'DOWNLOAD STARTED' : 'ONE MOMENT'}
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