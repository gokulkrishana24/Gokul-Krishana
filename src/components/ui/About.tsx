'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { about } from '@/data/content';

/**
 * ABOUT — "WHO AM I?" editorial spread: oversized kicker, staggered
 * paragraph reveals, education marker. Parallax shifts the whole
 * block gently as it passes through the viewport.
 */
export function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section ref={ref} id="about" className="relative overflow-hidden py-28 md:py-40" aria-label="About Gokul Krishana">
      {/* oversized ghost word */}
      <motion.span
        aria-hidden="true"
        style={{ y: bgY }}
        className="text-outline pointer-events-none absolute -top-6 left-0 select-none font-display text-[26vw] font-bold leading-none opacity-40 md:text-[18vw]"
      >
        ABOUT
      </motion.span>

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-[10px] text-sun md:text-xs">{about.kicker}</p>
        </Reveal>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <p className={`mt-6 max-w-2xl leading-relaxed ${i === 0 ? 'text-xl text-white md:text-2xl md:leading-relaxed' : 'text-base text-slate-300'}`}>
                  {i === 0 ? (
                    <>
                      I&apos;m <span className="text-baby">Gokul Krishana</span>, a Computer Science Engineering student
                      specializing in <span className="text-sun">Cybersecurity</span> at SRM Institute of Science and Technology.
                    </>
                  ) : (
                    p
                  )}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-wrap gap-2.5">
                {profileChips}
              </div>
            </Reveal>
          </div>

          {/* education marker */}
          <Reveal delay={0.15}>
            <aside className="glass rounded-3xl p-8">
              <p className="kicker text-[9px] text-baby-dim">EDUCATION</p>
              <p className="headline mt-4 text-3xl font-bold text-white">{about.educationMarker.short}</p>
              <p className="mt-2 text-sm text-slate-300">{about.educationMarker.degree}</p>
              <p className="mt-1 text-sm text-slate-300">{about.educationMarker.specialization}</p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="font-display text-sm font-bold tracking-wider text-baby">{about.educationMarker.years}</span>
                <span className="font-display text-sm font-bold tracking-wider text-sun">{about.educationMarker.cgpa}</span>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const profileChips = [
  'CURIOUS', 'CREATIVE', 'PROBLEM SOLVER', 'AMBITIOUS', 'BUILDER', 'ADAPTABLE', 'TEAM PLAYER', 'HARDWORKING',
].map((w) => (
  <span key={w} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] tracking-wider text-slate-300">
    {w}
  </span>
));

/* ------------------------------------------------------------------ */
/* Reveal — small shared scroll-reveal wrapper                        */
/* ------------------------------------------------------------------ */

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
