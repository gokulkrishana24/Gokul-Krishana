'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '@/data/content';
import { useScrollTo } from '@/lib/lenis';
import { useReducedMotion } from '@/lib/useIsTouch';
import { BackgroundVideo } from './BackgroundVideo';
import { useResumeDownload } from './ResumeCinematic';

/**
 * HERO — full-screen cinematic opening. Giant name typography beside
 * the interactive original photograph (mouse parallax ±3°/±5°, touch
 * drag with spring return). On scroll the portrait recedes and text
 * fades — handed off to the journey via framer-motion useScroll.
 */

const MAX_RX = 3; // deg — never more, face must stay stable
const MAX_RY = 5; // deg

export function Hero({ resume }: { resume: ReturnType<typeof useResumeDownload> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const portraitY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      data-splash="blue"
      aria-label="Introduction"
    >
      {/* atmosphere — subtle cinematic footage behind the hero only */}
      <BackgroundVideo src="/video/hero.mp4" opacity={0.16} />
      <motion.div className="hero-glow pointer-events-none absolute inset-0" style={{ y: reduced ? 0 : bgY }} aria-hidden="true" />
      <div className="digital-grid pointer-events-none absolute inset-0 opacity-35" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-24 pt-28 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pb-16">
        {/* identity */}
        <motion.div style={{ y: reduced ? 0 : textY, opacity: textOpacity }}>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.7 }}
            className="kicker text-[10px] text-baby md:text-xs"
          >
            {profile.roles.join(' · ')}
          </motion.p>

          <h1 className="mt-6 font-display text-[17vw] font-bold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              GOKUL
            </motion.span>
            <motion.span
              className="block text-outline"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              KRISHANA
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.8 }}
            className="mt-7 max-w-md text-sm leading-relaxed text-muted md:text-base"
          >
            {profile.intro}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.45, duration: 0.8 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => scrollTo('projects')}
              className="group inline-flex items-center gap-3 rounded-full bg-baby px-7 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-navy transition-all duration-300 hover:bg-sun active:scale-[0.98]"
              data-cursor="ENTER"
            >
              VIEW MY WORK
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={resume.start}
              className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-white transition-all duration-300 hover:border-baby hover:text-baby active:scale-[0.98]"
              data-cursor="ENTER"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5">
                <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              DOWNLOAD RESUME
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="group inline-flex items-center gap-3 rounded-full border border-sun/50 px-7 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-sun transition-all duration-300 hover:bg-sun hover:text-navy active:scale-[0.98]"
              data-cursor="ENTER"
            >
              LET&apos;S CONNECT
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </motion.div>
        </motion.div>

        {/* interactive portrait */}
        <motion.div
          className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[400px]"
          style={{ y: reduced ? 0 : portraitY, scale: reduced ? 1 : portraitScale }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          <Portrait />
        </motion.div>
      </div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        style={{ opacity: textOpacity }}
      >
        <span className="kicker animate-drop-hint text-[9px] text-slate-500">SCROLL TO EXPLORE</span>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* INTERACTIVE PORTRAIT                                               */
/* ------------------------------------------------------------------ */

function Portrait() {
  const cardRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [engaged, setEngaged] = useState(false);
  const reduced = useReducedMotion();

  const animate = useCallback(() => {
    // spring-like easing — smooth approach, smooth return
    current.current.x += (target.current.x - current.current.x) * 0.08;
    current.current.y += (target.current.y - current.current.y) * 0.08;
    const { x, y } = current.current;

    if (cardRef.current) {
      const rx = reduced ? 0 : -y * MAX_RX;
      const ry = reduced ? 0 : x * MAX_RY;
      const px = reduced ? 0 : x * 10;
      const py = reduced ? 0 : y * 6;
      const scale = engaged && !reduced ? 1.02 : 1;
      cardRef.current.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${px}px, ${py}px, 0) scale(${scale})`;
    }
    raf.current = requestAnimationFrame(animate);
  }, [reduced, engaged]);

  useEffect(() => {
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [animate]);

  const setFromClient = (clientX: number, clientY: number) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    target.current.x = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
    target.current.y = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1));
  };

  const onMouseMove = (e: React.MouseEvent) => setFromClient(e.clientX, e.clientY);
  const onMouseLeave = () => {
    setEngaged(false);
    target.current = { x: 0, y: 0 };
  };

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
    setEngaged(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const start = touchStart.current;
    if (!t || !start) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dy) > Math.abs(dx) * 1.15) return; // vertical gestures scroll the page
    setFromClient(t.clientX, t.clientY - dy * 0.4);
  };
  const onTouchEnd = () => {
    touchStart.current = null;
    setEngaged(false);
    target.current = { x: 0, y: 0 }; // spring return handled by rAF loop
  };

  return (
    <div className="relative" style={{ perspective: '1100px' }}>
      {/* accent glows behind the portrait */}
      <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-full bg-baby/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-6 -left-6 -z-10 h-24 w-24 rounded-full bg-accent-red/15 blur-2xl" />

      <div
        ref={cardRef}
        role="img"
        aria-label="Portrait photograph of Gokul Krishana"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative aspect-[3/4] w-full select-none"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* thin interface frame */}
        <div aria-hidden="true" className="absolute -inset-[3px] rounded-2xl border border-baby/30" />
        <div aria-hidden="true" className="absolute -inset-px overflow-hidden rounded-2xl">
          {/* the original photograph — never distorted, object-cover only */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.photo}
            alt="Gokul Krishana"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          {/* cinematic grade baked around (not over) the photo */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/20" />
          <div aria-hidden="true" className="absolute inset-0 mix-blend-screen" style={{ background: 'radial-gradient(ellipse 70% 55% at 70% 30%, rgba(79,169,240,0.14), transparent 70%)' }} />
        </div>

        {/* corner ticks */}
        {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'left-3 bottom-3 border-l border-b', 'right-3 bottom-3 border-r border-b'].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute h-4 w-4 border-baby/60 ${pos}`} />
        ))}

        {/* micro label */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
          <p className="font-display text-[13px] font-bold tracking-wide text-white">{profile.name}</p>
          <p className="kicker mt-1 text-[8px] text-baby">INTERACTIVE PROFILE</p>
        </div>
      </div>
    </div>
  );
}
