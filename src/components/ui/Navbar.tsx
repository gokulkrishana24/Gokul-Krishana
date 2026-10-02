'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { NAV, profile } from '@/data/content';
import { useLenis, useScrollTo } from '@/lib/lenis';
import { useIsTouch } from '@/lib/useIsTouch';

/**
 * NAVBAR — transparent at rest; after scroll it gains a deep navy
 * translucent background, subtle blur and a thin border. The overlay
 * menu flows in with curved motion + staggered text.
 */

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('hero');
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const isTouch = useIsTouch();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: highlight whichever chapter is currently on screen.
  useEffect(() => {
    const targets = NAV.map((n) => document.getElementById(n.target)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // the entry closest to the top of the viewport wins
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  // lock scroll while the menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis]);

  const go = (target: string) => {
    setOpen(false);
    // wait for the menu exit before scrolling on mobile
    setTimeout(() => scrollTo(target), open ? 350 : 0);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-baby/10 bg-navy/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10" aria-label="Primary">
          <button
            onClick={() => go('hero')}
            className="group flex items-center gap-3"
            aria-label="Back to top"
            data-cursor="ENTER"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-baby/40 font-display text-sm font-bold text-baby transition-colors duration-300 group-hover:border-sun group-hover:text-sun">
              {profile.mark}
            </span>
            <span className="hidden font-display text-sm font-bold tracking-[0.22em] text-white lg:block">
              {profile.firstName}
              <span className="text-baby"> / {profile.lastName}</span>
            </span>
          </button>

          <div className="hidden items-center gap-6 xl:flex">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.target)}
                aria-current={active === item.target ? 'true' : undefined}
                className={`kicker relative py-1 text-[10px] transition-colors duration-300 ${
                  active === item.target ? 'text-baby' : 'text-muted hover:text-white'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-px bg-sun transition-all duration-300 ${
                    active === item.target ? 'w-full' : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="hidden items-center xl:flex">
            <button
              onClick={() => go('contact')}
              className="rounded-full border border-baby/50 px-5 py-2.5 font-display text-[11px] font-bold tracking-[0.18em] text-baby transition-all duration-300 hover:border-sun hover:bg-sun/10 hover:text-sun"
              data-cursor="ENTER"
            >
              LET&apos;S CONNECT
            </button>
          </div>

          {/* mobile / tablet toggle */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 xl:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-px w-full bg-white transition-transform duration-300 ${open ? 'translate-y-[5.5px] rotate-45' : ''}`} />
              <span className={`absolute left-0 top-1/2 h-px w-full bg-white transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute bottom-0 left-0 h-px w-full bg-white transition-transform duration-300 ${open ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </nav>
      </header>

      {/* flowing fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-navy/95 backdrop-blur-2xl xl:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 32px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 32px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 32px)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="digital-grid pointer-events-none absolute inset-0 opacity-30" />
            <nav className="relative flex flex-1 flex-col justify-center gap-2 px-8" aria-label="Mobile">
              {NAV.map((item, i) => (
                <motion.button
                  key={item.label}
                  onClick={() => go(item.target)}
                  initial={{ opacity: 0, x: 64, rotate: 2 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: 48 }}
                  transition={{ delay: 0.12 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-baseline gap-4 py-2 text-left"
                >
                  <span className="kicker text-[10px] text-baby-dim">0{i + 1}</span>
                  <span
                    className={`headline text-3xl font-bold transition-colors md:text-4xl ${
                      active === item.target ? 'text-baby' : 'text-white group-hover:text-baby'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              ))}
              <motion.button
                onClick={() => go('contact')}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 w-fit rounded-full border border-sun/50 bg-sun/10 px-7 py-3.5 font-display text-xs font-bold tracking-[0.2em] text-sun"
              data-cursor="ENTER"
            >
                LET&apos;S WORK TOGETHER
              </motion.button>
            </nav>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="relative px-8 pb-10 text-xs text-muted"
            >
              {profile.location} · {profile.email}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
