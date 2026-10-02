'use client';

import { motion } from 'framer-motion';

/**
 * CURVED LOOP TRANSITION — a thin SVG curve drawn between major
 * sections so the page reads as one continuous route rather than a
 * stack of blocks. Deliberately subtle: one hairline, no fill, no
 * glow bloom.
 */

export function CurvedLoop({ flip = false }: { flip?: boolean }) {
  return (
    <div className="relative h-16 w-full overflow-hidden md:h-24" aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${flip ? 'rotate-180' : ''}`}
        fill="none"
      >
        <motion.path
          d="M -20 96 C 240 96, 300 24, 720 24 S 1200 96, 1460 96"
          stroke="rgba(142,203,242,0.22)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
        <motion.path
          d="M -20 96 C 240 96, 300 24, 720 24 S 1200 96, 1460 96"
          stroke="rgba(255,211,77,0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 30"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.15 }}
        />
      </svg>
    </div>
  );
}

/**
 * PIXEL DIVIDER — a fast, clean transition used before the biggest
 * chapters. Only ever a thin band, never a full-screen wipe, so it
 * reads as premium rather than arcade.
 */
export function PixelDivider({ colors }: { colors: string[] }) {
  return (
    <div aria-hidden="true" className="relative h-3 overflow-hidden" style={{ background: 'var(--navy)' }}>
      <div
        className="absolute inset-0 grid opacity-70"
        style={{ gridTemplateColumns: 'repeat(24, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}
      >
        {Array.from({ length: 72 }).map((_, i) => (
          <span
            key={i}
            style={{
              backgroundColor: colors[i % colors.length],
              opacity: ((i * 13) % 7) / 10,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-transparent to-navy" />
    </div>
  );
}