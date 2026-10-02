'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { useReducedMotion } from '@/lib/useIsTouch';
import { marquee, skills } from '@/data/content';
import { Reveal } from './About';

/**
 * TECHNICAL UNIVERSE — not a list of cards: a floating typography
 * constellation. Each skill is a drifting label with a deterministic
 * position/drift; gentle pointer parallax comes from scroll-linked
 * transforms. Accents stay within the palette (baby / sun / red).
 */

const ACCENT: Record<string, string> = {
  blue: 'text-baby',
  yellow: 'text-sun',
  red: 'text-red-300',
};

interface Floater {
  label: string;
  accent: string;
  size: number;
  x: number; // %
  y: number; // rows
  depth: number; // 0..1 parallax depth
  delay: number;
}

export function TechUniverse() {
  // deterministic pseudo-random layout (stable between server/client)
  const floaters = useMemo<Floater[]>(() => {
    const out: Floater[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    skills.forEach((cat) => {
      cat.items.forEach((item, idx) => {
        out.push({
          label: item,
          accent: ACCENT[cat.accent],
          size: 13 + Math.floor(rand() * 14), // px 13–26
          x: 4 + rand() * 88,
          y: rand(),
          depth: 0.3 + rand() * 0.7,
          delay: idx * 0.04 + rand() * 0.3,
        });
      });
    });
    return out;
  }, []);

  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const ySlow = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);

  // group floaters into rows to avoid absolute-chaos on small screens
  const rows = useMemo(() => {
    const sorted = [...floaters].sort((a, b) => a.y - b.y);
    const chunk = Math.ceil(sorted.length / 6);
    const groups: Floater[][] = [];
    for (let i = 0; i < sorted.length; i += chunk) groups.push(sorted.slice(i, i + chunk));
    return groups;
  }, [floaters]);

  return (
    <section ref={ref} id="tech" className="relative overflow-hidden py-28 md:py-40" aria-label="Technical universe" data-splash="blue">
      {/* curved connector from college */}
      <CurvedConnector />

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-[10px] text-sun md:text-xs">03 · TECHNICAL JOURNEY</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-5 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            TECHNICAL <span className="text-baby">UNIVERSE</span>
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
            Not a stack list — a working set of tools I reach for when building systems that matter.
          </p>
        </Reveal>

        <motion.div style={{ y: reduced ? 0 : ySlow }} className="relative z-10 mt-14 space-y-10">
          {skills.map((cat, ci) => (
            <div key={cat.id} className="border-t border-white/10 pt-8">
              <Reveal delay={0.05 * ci}>
                <p className={`kicker text-[10px] ${ACCENT[cat.accent]}`}>{cat.title}</p>
              </Reveal>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-7 gap-y-3">
                {cat.items.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-8%' }}
                    transition={{ duration: 0.6, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                    className="headline cursor-default font-semibold text-slate-200 transition-colors duration-300 hover:text-white"
                    style={{ fontSize: `${16 + ((i * 7) % 12)}px` }}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Depth: a slow drifting field far behind, so it reads as
            atmosphere rather than competing with the real type above. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block">
          {rows.flatMap((row, ri) =>
            row.slice(0, 2).map((f, fi) => (
              <motion.span
                key={`${f.label}-${ri}-${fi}`}
                className={`absolute select-none font-display font-semibold ${f.accent} opacity-[0.07]`}
                style={{
                  left: `${f.x}%`,
                  top: `${10 + (ri / rows.length) * 78}%`,
                  fontSize: f.size * 1.9,
                  filter: 'blur(1px)',
                }}
                animate={{ y: [0, -12 * f.depth, 0] }}
                transition={{ duration: 6 + f.depth * 5, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
              >
                {f.label}
              </motion.span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MARQUEE — slow, premium, infinite                                  */
/* ------------------------------------------------------------------ */

export function Marquee({ reverse = false }: { reverse?: boolean }) {
  const items = [...marquee, ...marquee];
  return (
    <div className="relative overflow-hidden border-y border-white/10 py-6" aria-hidden="true">
      <div className={`flex w-max items-center gap-10 ${reverse ? 'animate-marquee-rev' : 'animate-marquee-slow'}`}>
        {items.map((m, i) => (
          <span key={`${m}-${i}`} className="flex items-center gap-10">
            <span className="headline whitespace-nowrap text-2xl font-bold text-slate-200 md:text-3xl">{m}</span>
            <span className="text-baby">/</span>
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-navy to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-navy to-transparent" />
    </div>
  );
}

/** Thin curved SVG line used between major sections. */
export function CurvedConnector({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-0 h-24 w-full ${flip ? 'rotate-180' : ''}`}
    >
      <motion.path
        d="M 0 10 C 30 10, 45 90, 100 90"
        stroke="rgba(142,203,255,0.3)"
        strokeWidth="0.35"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
    </svg>
  );
}
