'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { beyond, domeGallery, mindset, profile } from '@/data/content';
import { useReducedMotion } from '@/lib/useIsTouch';
import { Reveal } from './About';

/**
 * BEYOND CODE — the human chapters told as a story: NIC Club,
 * SRM V-MUN, Symrna Fellowship Trust, with the real event photo.
 * HOW I THINK — interactive mindset words + the LEARN → BUILD →
 * BREAK → UNDERSTAND → IMPROVE loop. PHILOSOPHY — the minimal
 * statement. DOME GALLERY — CSS 2.5D curved gallery with the real
 * uploaded assets (no WebGL to break).
 */

export function BeyondCode() {
  return (
    <section id="beyond" className="relative py-28 md:py-40" aria-label="Beyond code" data-splash="yellow" data-music="calm">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* real event photo with editorial frame */}
          <Reveal>
            <figure className="relative overflow-hidden rounded-3xl border border-white/10" data-cursor="EXPLORE">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={beyond.photo}
                alt="Gokul at a campus event"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
                draggable={false}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy/85 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-7">
                <p className="kicker text-[9px] text-baby">ON STAGE · CAMPUS</p>
                <p className="headline mt-2 text-xl font-bold text-white">People first, always.</p>
              </figcaption>
            </figure>
          </Reveal>

          {/* story */}
          <div>
            <Reveal>
              <p className="kicker text-[10px] text-sun md:text-xs">{beyond.kicker}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="headline mt-5 text-4xl font-bold leading-tight text-white md:text-6xl">
                BEYOND THE <span className="text-baby">TERMINAL</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-lg text-slate-300">{beyond.intro}</p>
            </Reveal>

            <div className="mt-10 space-y-6">
              {beyond.groups.map((g, i) => (
                <Reveal key={g.name} delay={0.08 * i}>
                  <div className="group border-l-2 border-baby/30 pl-6 transition-colors duration-300 hover:border-sun">
                    <p className="headline text-lg font-bold text-white transition-colors group-hover:text-baby">{g.name}</p>
                    <p className="mt-1.5 text-sm text-slate-400">{g.roles.join('  ·  ')}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <p className="mt-10 max-w-md text-sm leading-relaxed text-slate-400">
                Events, logistics, hospitality, volunteering — the same building blocks as software:
                understand people, coordinate the details, deliver.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* HOW I THINK + PHILOSOPHY                                           */
/* ------------------------------------------------------------------ */

export function HowIThink() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  return (
    <section id="how-i-think" className="relative overflow-hidden py-28 md:py-40" aria-label="How I think" data-splash="blue" data-music="calm">
      <div className="digital-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-center text-[10px] text-baby md:text-xs">{mindset.kicker}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-4 text-center text-4xl font-bold text-white md:text-6xl">HOW I THINK</h2>
        </Reveal>

        {/* mindset words — interactive */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
          {mindset.words.map((w, i) => (
            <motion.button
              key={w}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-full border px-5 py-2.5 font-display text-xs font-bold tracking-[0.16em] transition-colors duration-300 md:text-sm ${
                active === i
                  ? 'border-sun bg-sun/15 text-sun'
                  : 'border-white/15 text-slate-300 hover:border-baby/50 hover:text-baby'
              }`}
              aria-pressed={active === i}
            >
              {w}
            </motion.button>
          ))}
        </div>

        {/* the loop — LEARN → BUILD → BREAK → UNDERSTAND → IMPROVE */}
        <Reveal delay={0.15}>
          <div className="mt-20">
            <p className="kicker mb-8 text-center text-[9px] text-baby-dim">THE LOOP</p>
            <div className="flex flex-wrap items-center justify-center gap-y-6">
              {mindset.loop.map((step, i) => (
                <div key={step} className="flex items-center">
                  <motion.div
                    animate={reduced ? undefined : { y: [0, -6, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
                    className="flex flex-col items-center px-4 md:px-6"
                  >
                    <span className="kicker text-[8px] text-baby-dim">0{i + 1}</span>
                    <span className={`headline mt-1.5 text-2xl font-bold md:text-4xl ${i === 2 ? 'text-accent-red' : 'text-white'}`}>
                      {step}
                    </span>
                  </motion.div>
                  {i < mindset.loop.length - 1 && (
                    <span aria-hidden="true" className="text-xl text-baby/60 md:text-2xl">→</span>
                  )}
                </div>
              ))}
            </div>
            {/* loop-back curve */}
            <svg viewBox="0 0 600 40" className="mx-auto mt-4 w-64" fill="none" aria-hidden="true">
              <path d="M 20 4 C 20 36, 580 36, 580 4" stroke="rgba(142,203,255,0.35)" strokeWidth="1" strokeDasharray="4 6" />
              <path d="M 574 10 L 580 4 L 586 10" stroke="rgba(142,203,255,0.5)" strokeWidth="1" />
            </svg>
            <p className="kicker mt-1 text-center text-[8px] text-baby-dim">…AND BACK TO LEARN</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Philosophy() {
  return (
    <section id="philosophy" className="relative py-24 md:py-32" aria-label="Personal philosophy" data-music="calm">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-10">
        <Reveal>
          <p className="headline text-2xl font-bold leading-snug text-white md:text-4xl">
            “{mindset.quote}”
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {mindset.mantra.map((m, i) => (
              <span key={m} className="flex items-center gap-6">
                <span className={`headline text-lg font-bold md:text-2xl ${i === 0 ? 'text-baby' : i === 3 ? 'text-sun' : 'text-slate-200'}`}>
                  {m}
                </span>
                {i < mindset.mantra.length - 1 && <span aria-hidden="true" className="text-baby/40">·</span>}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* DOME GALLERY — CSS 2.5D curved gallery (real assets, zero WebGL)   */
/* ------------------------------------------------------------------ */

export function DomeGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const dragState = useRef<{ x: number; startAngle: number } | null>(null);
  const reduced = useReducedMotion();

  const visible = domeGallery.filter((_, i) => !broken.has(i));
  const count = Math.max(visible.length, 1);
  const step = 360 / count;

  // pointer-move rotation (desktop), touch-drag rotation (mobile)
  const onMouseMove = (e: React.MouseEvent) => {
    if (reduced || dragState.current) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    setAngle(nx * 22); // subtle viewing-direction shift
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragState.current = { x: t.clientX, startAngle: angle };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const s = dragState.current;
    if (!t || !s) return;
    setAngle(s.startAngle + (t.clientX - s.x) * 0.28);
  };
  const onTouchEnd = () => {
    dragState.current = null;
  };

  return (
    <section className="relative overflow-hidden py-24 md:py-32" aria-label="Gallery of journey moments">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-center text-[10px] text-baby md:text-xs">THE GALLERY</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-4 text-center text-3xl font-bold text-white md:text-5xl">
            MOMENT OF <span className="text-baby">JOY</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-muted">
            The parts that never made it into a project description — stages, corridors, first days.
          </p>
        </Reveal>
      </div>

      <div
        ref={ref}
        className="relative mt-16 h-[340px] select-none md:h-[440px]"
        style={{ perspective: '1200px' }}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        data-splash="blue"
      >
        <div
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transform: `translate(-50%,-50%) rotateY(${-angle}deg)`, transformStyle: 'preserve-3d', transition: dragState.current ? 'none' : 'transform 0.4s ease-out' }}
        >
          {domeGallery.map((item, i) => {
            if (broken.has(i)) return null;
            const a = visible.findIndex((v) => v.src === item.src) * step;
            return (
              <div
                key={item.src + i}
                className="absolute overflow-hidden rounded-2xl border border-white/15"
                style={{
                  width: 220,
                  height: 150,
                  left: -110,
                  top: -75,
                  transform: `rotateY(${a}deg) translateZ(420px)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  draggable={false}
                  onError={() => setBroken((b) => new Set(b).add(i))}
                />
              </div>
            );
          })}
        </div>
        <p className="kicker absolute inset-x-0 bottom-0 text-center text-[8px] text-baby-dim">
          {reduced ? 'GALLERY' : 'MOVE YOUR CURSOR · OR DRAG TO ROTATE'}
        </p>
      </div>

      {/* Instagram is linked out to, never scraped. No token is ever
          shipped to the browser and no third-party script is embedded;
          without a server-side integration the gallery above stays the
          honest, self-hosted fallback. */}
      <Reveal delay={0.1}>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col items-center gap-5 px-5 text-center md:px-10">
          <p className="kicker text-[9px] text-baby-dim">MORE, OFF-PLATFORM</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[profile.instagram, profile.instagramAlt].map((href, i) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="EXPLORE"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-display text-[10px] font-bold tracking-[0.18em] text-slate-200 transition-all duration-300 hover:border-baby hover:text-baby"
              >
                {i === 0 ? 'INSTAGRAM' : 'INSTAGRAM · ALT'}
                <span aria-hidden="true" className="transition-transform duration-300 hover:translate-x-0.5">→</span>
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
