'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { college, relocation, school } from '@/data/content';
import { useReducedMotion } from '@/lib/useIsTouch';
import { Reveal } from './About';

/**
 * SCHOOL + COLLEGE — the education chapters. Both use the ORIGINAL
 * uploaded photographs with pointer/touch parallax (10–18px shift,
 * ±2–3° perspective), soft-light reveals and cinematic sequencing.
 * The photographs themselves are never redesigned or distorted.
 */

/** Shared pointer/touch parallax for a photograph (max px shift). */
function useParallax(maxShift = 14, maxTilt = 2.5) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const reduced = useReducedMotion();

  const animate = useCallback(() => {
    current.current.x += (target.current.x - current.current.x) * 0.07;
    current.current.y += (target.current.y - current.current.y) * 0.07;
    const { x, y } = current.current;
    if (ref.current) {
      ref.current.style.transform = `perspective(1000px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt * 0.6}deg) translate3d(${x * maxShift}px, ${y * maxShift * 0.6}px, 0)`;
    }
    raf.current = requestAnimationFrame(animate);
  }, [maxShift, maxTilt]);

  useEffect(() => {
    if (reduced) return;
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [animate, reduced]);

  const setFrom = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    target.current.x = Math.max(-1, Math.min(1, ((clientX - r.left) / r.width) * 2 - 1));
    target.current.y = Math.max(-1, Math.min(1, ((clientY - r.top) / r.height) * 2 - 1));
  };

  const onMouseMove = (e: React.MouseEvent) => setFrom(e.clientX, e.clientY);
  const onMouseLeave = () => {
    target.current = { x: 0, y: 0 };
  };
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const s = touchStart.current;
    if (!t || !s) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dy) > Math.abs(dx) * 1.15) return; // keep page scroll usable
    setFrom(t.clientX, t.clientY);
  };
  const onTouchEnd = () => {
    touchStart.current = null;
    target.current = { x: 0, y: 0 };
  };

  return {
    ref,
    handlers: {
      onMouseMove,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}

/* ------------------------------------------------------------------ */
/* SCHOOL                                                             */
/* ------------------------------------------------------------------ */

export function School() {
  const first = useParallax(14, 2.5);
  const second = useParallax(18, 3);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const ghostY = useTransform(scrollYProgress, [0, 1], ['-4%', '8%']);

  return (
    <section ref={sectionRef} id="school" className="relative overflow-hidden py-28 md:py-40" aria-label="School — where it all began" data-splash="yellow">
      <motion.span
        aria-hidden="true"
        style={{ y: ghostY }}
        className="text-outline pointer-events-none absolute bottom-0 right-0 select-none font-display text-[22vw] font-bold leading-none opacity-30 md:text-[14vw]"
      >
        01
      </motion.span>

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-[10px] text-baby md:text-xs">{school.kicker}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-5 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            WHERE IT <span className="text-baby">STARTED</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* photographs — first the entrance, then the courtyard */}
          <div className="space-y-10">
            {/* photo 1: entrance staircase */}
            <Reveal delay={0.1}>
              <figure
                {...first.handlers}
                className="group relative overflow-hidden rounded-3xl border border-white/10"
                style={{ perspective: '1000px' }}
                data-cursor="DISCOVER"
              >
                <div ref={first.ref} style={{ willChange: 'transform' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={school.photos[0].src}
                    alt={school.photos[0].alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                    draggable={false}
                  />
                  {/* soft light pass on reveal */}
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    initial={{ x: '-140%' }}
                    whileInView={{ x: '320%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, delay: 0.5, ease: 'easeInOut' }}
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent px-6 pb-4 pt-14">
                  <span className="kicker text-[8px] text-baby">ENTRANCE</span>
                </figcaption>
              </figure>
            </Reveal>

            {/* photo 2: courtyard garden — offset composition */}
            <Reveal delay={0.2}>
              <figure
                {...second.handlers}
                className="group relative ml-auto w-[92%] overflow-hidden rounded-3xl border border-white/10 md:-mt-6"
                style={{ perspective: '1000px' }}
                data-cursor="DISCOVER"
              >
                <div ref={second.ref} style={{ willChange: 'transform' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={school.photos[1].src}
                    alt={school.photos[1].alt}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover"
                    draggable={false}
                  />
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-140%' }}
                    whileInView={{ x: '320%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, delay: 0.7, ease: 'easeInOut' }}
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent px-6 pb-4 pt-14">
                  <span className="kicker text-[8px] text-baby">COURTYARD</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* narrative */}
          <div className="lg:pt-10">
            <Reveal delay={0.15}>
              <h3 className="headline text-2xl font-bold leading-snug text-white md:text-3xl">{school.name}</h3>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {school.location}
              </p>
              <p className="mt-6 max-w-md leading-relaxed text-muted">
                The hills of the Nilgiris are where curiosity first outgrew the classroom — where everything began,
                long before the first line of code.
              </p>
              <div className="mt-10 border-l-2 border-sun/60 pl-5">
                <p className="kicker text-[9px] text-sun">SCHOOL JOURNEY</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                  Discipline, structure and a first spark of problem solving — the base everything since has been built on.
                </p>
              </div>

              <DiscoverLink href={school.website} label={school.websiteLabel} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* COLLEGE                                                            */
/* ------------------------------------------------------------------ */

export function College() {
  const campus = useParallax(14, 2.5);
  const campusLogo = useParallax(12, 2);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const ghostY = useTransform(scrollYProgress, [0, 1], ['-4%', '8%']);
  const [logoError, setLogoError] = useState(false);

  return (
    <section ref={sectionRef} id="college" className="relative overflow-hidden py-28 md:py-40" aria-label="College journey — SRM" data-splash="yellow">
      <motion.span
        aria-hidden="true"
        style={{ y: ghostY }}
        className="text-outline pointer-events-none absolute top-0 left-0 select-none font-display text-[22vw] font-bold leading-none opacity-30 md:text-[14vw]"
      >
        02
      </motion.span>

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-[10px] text-baby md:text-xs">{college.kicker}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-5 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            COLLEGE <span className="text-baby">JOURNEY</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* narrative + identity */}
          <div className="order-2 lg:order-1">
            {/* SRM logo — subtle scale + glow only, never distorted */}
            <Reveal delay={0.1}>
              <div className="flex items-center gap-6">
                {!logoError && (
                  <motion.div
                    whileHover={{ scale: 1.04, rotate: 1.5 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                    className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-baby/25 bg-navy-soft/70 p-2 shadow-[0_0_36px_rgba(142,203,242,0.12)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={college.logo} alt="SRM Institute of Science and Technology logo" loading="lazy" className="h-full w-full object-contain" onError={() => setLogoError(true)} />
                  </motion.div>
                )}
                <div>
                  <h3 className="headline text-xl font-bold leading-snug text-white md:text-2xl">{college.name}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {college.location}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* education details — sequenced reveal */}
            <div className="mt-10 space-y-4">
              <Reveal delay={0.15}>
                <p className="text-lg text-slate-200">{college.degree}</p>
              </Reveal>
              <Reveal delay={0.22}>
                <span className="inline-block rounded-full border border-accent-red/40 bg-accent-red/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-accent-red">
                  SPECIALIZATION — {college.specialization}
                </span>
              </Reveal>
              <Reveal delay={0.29}>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div>
                    <p className="kicker text-[9px] text-baby-dim">YEARS</p>
                    <p className="headline mt-1 text-xl font-bold text-baby">{college.years}</p>
                  </div>
                  <div>
                    <p className="kicker text-[9px] text-baby-dim">CGPA</p>
                    <p className="headline mt-1 text-xl font-bold text-sun">{college.cgpa}</p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.34}>
              <p className="mt-10 max-w-md leading-relaxed text-muted">
                Where the foundation became direction — systems, security and software engineering in the city of Chennai.
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <DiscoverLink href={college.website} label={college.websiteLabel} />
            </Reveal>
          </div>

          {/* campus photographs */}
          <div className="order-1 space-y-10 lg:order-2">
            <Reveal delay={0.12}>
              <figure
                {...campus.handlers}
                className="group relative overflow-hidden rounded-3xl border border-white/10"
                style={{ perspective: '1000px' }}
                data-cursor="DISCOVER"
              >
                <div ref={campus.ref} style={{ willChange: 'transform' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={college.photos[0].src} alt={college.photos[0].alt} loading="lazy" className="aspect-[16/10] w-full object-cover" draggable={false} />
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    initial={{ x: '-140%' }}
                    whileInView={{ x: '320%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, delay: 0.5, ease: 'easeInOut' }}
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent px-6 pb-4 pt-14">
                  <span className="kicker text-[8px] text-baby">CAMPUS</span>
                </figcaption>
              </figure>
            </Reveal>

            {/* SRM logo badge — second plate so the gallery is never lopsided */}
            <Reveal delay={0.2}>
              <figure
                {...campusLogo.handlers}
                className="group relative mr-auto w-[70%] overflow-hidden rounded-3xl border border-white/10 md:-mt-4"
                style={{ perspective: '1000px' }}
                data-cursor="DISCOVER"
              >
                <div
                  ref={campusLogo.ref}
                  className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-white/[0.07] to-transparent p-8"
                  style={{ willChange: 'transform' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={college.logo}
                    alt="SRM Institute of Science and Technology logo"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    draggable={false}
                    onError={() => setLogoError(true)}
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent px-6 pb-4 pt-14">
                  <span className="kicker text-[8px] text-baby">INSTITUTE</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>

        {/* OOTY → CHENNAI — the move that redirected the whole story */}
        <Reveal delay={0.1}>
          <div className="mt-24 rounded-3xl border border-baby/15 bg-navy-soft/60 p-8 md:p-10">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="text-center md:text-left">
                <p className="kicker text-[9px] text-baby-dim">FROM</p>
                <p className="headline mt-1 text-3xl font-bold text-white md:text-4xl">{relocation.from}</p>
              </div>
              <div className="flex flex-1 items-center justify-center px-4" aria-hidden="true">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-baby/40 to-transparent" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8ECBF2" strokeWidth="1.6" className="mx-2">
                  <path d="M5 12h14m0 0l-5-5m5 5l-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-baby/40 to-transparent" />
              </div>
              <div className="text-center md:text-right">
                <p className="kicker text-[9px] text-baby-dim">TO</p>
                <p className="headline mt-1 text-3xl font-bold text-baby md:text-4xl">{relocation.to}</p>
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-muted">
              {relocation.caption}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* DISCOVER LINK — arrow slides on hover, press-ripple on touch        */
/* ------------------------------------------------------------------ */

function DiscoverLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="DISCOVER"
      data-splash="yellow"
      className="group relative mt-10 inline-flex items-center gap-3 rounded-full border border-sun/50 px-7 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-sun transition-colors duration-300 hover:bg-sun hover:text-navy active:scale-[0.97]"
    >
      <span className="relative">{label}</span>
      <span
        aria-hidden="true"
        className="relative transition-transform duration-300 group-hover:translate-x-2"
      >
        →
      </span>
    </a>
  );
}
