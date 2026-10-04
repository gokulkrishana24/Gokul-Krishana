'use client';

import { motion } from 'framer-motion';
import { useMusic } from '@/lib/music';

/**
 * MUSIC CONTROL — one small pill in the navigation. Nothing more:
 * no player, no playlist, no controls over the page.
 *
 * Three states, all copyable by assistive tech:
 *   needsGesture → "ENABLE SOUND" (the browser wants a real interaction)
 *   playing      → "SOUND ON"
 *   enabled/idle → "SOUND OFF"
 */

export function MusicToggle({ compact = false }: { compact?: boolean }) {
  const { enabled, playing, needsGesture, toggle } = useMusic();

  const label = needsGesture ? 'ENABLE SOUND' : playing ? 'SOUND ON' : 'SOUND OFF';
  const on = enabled && !needsGesture;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={needsGesture ? 'Enable background music' : on ? 'Turn background music off' : 'Turn background music on'}
      className="group relative flex h-11 items-center gap-2.5 rounded-full border border-white/15 px-3.5 transition-colors duration-300 hover:border-baby/60 md:px-4"
      data-cursor="ENTER"
    >
      {/* animated note — three bars that only move while sound is audible */}
      <span aria-hidden="true" className="flex h-3.5 w-3.5 items-end justify-between">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`w-[2px] rounded-full ${on ? 'bg-baby' : 'bg-white/45'}`}
            animate={
              playing
                ? { height: ['30%', '100%', '45%', '90%', '35%'] }
                : { height: i === 1 ? '70%' : '40%' }
            }
            transition={
              playing
                ? { duration: 1.5 + i * 0.28, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3 }
            }
          />
        ))}
      </span>

      {!compact && (
        <span className="kicker text-[10px] text-white/80 transition-colors duration-300 group-hover:text-white">
          {label}
        </span>
      )}
    </button>
  );
}