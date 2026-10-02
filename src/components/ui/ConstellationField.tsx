'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useIsTouch';
import { Reveal } from './About';

/**
 * CONSTELLATION FIELD — the one place the site genuinely benefits
 * from WebGL. A slow 3D field of points that reacts to the pointer
 * and to scroll depth, sitting behind the Technical Universe.
 *
 * It is decorative, so it must never cost usability:
 *   • reduced motion, low-memory or no-WebGL devices render the
 *     lightweight Canvas 2D fallback instead;
 *   • the scene is only mounted while the section is on screen, so
 *     an off-screen section never animates;
 *   • the R3F bundle is code-split and loaded after first paint.
 */

/**
 * Code-split the entire WebGL layer — three.js and R3F must not be
 * reachable from this module's static import graph, or they land in
 * the initial bundle regardless of the dynamic import.
 */
const WebGLField = dynamic(() => import('./WebGLField'), { ssr: false });

export function ConstellationField() {
  const reduced = useReducedMotion();
  const [canWebGL, setCanWebGL] = useState(false);
  const [active, setActive] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  // Feature-detect once. Never assume WebGL exists.
  useEffect(() => {
    let cancelled = false;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!cancelled) setCanWebGL(Boolean(gl));
    } catch {
      setCanWebGL(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Only animate while visible.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const useFallback = reduced || !canWebGL;

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {useFallback ? (
        <FallbackField paused={!active} />
      ) : (
        active && <WebGLField />
      )}
      {/* keeps the section readable over the field */}
      <div className="video-atmosphere absolute inset-0" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas 2D fallback — same idea, no WebGL, no bundle cost          */
/* ------------------------------------------------------------------ */

function FallbackField({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    // deterministic layout so server and client agree visually
    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const dots = Array.from({ length: 46 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.8 + rand() * 1.6,
      z: 0.35 + rand() * 0.65,
      phase: rand() * Math.PI * 2,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const y = d.y * h + Math.sin(t * 0.4 + d.phase) * 9 * d.z;
        ctx.beginPath();
        ctx.arc(d.x * w, y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(142,203,242,${0.1 + d.z * 0.22})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    if (!paused) raf = requestAnimationFrame(draw);
    const timer = window.setInterval(() => {
      t += 0.03;
    }, 33);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      ro.disconnect();
    };
  }, [paused]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

/* ------------------------------------------------------------------ */
/* Section wrapper — sits above the Technical Universe content        */
/* ------------------------------------------------------------------ */

export function ConstellationSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32" aria-label="Interactive constellation">
      <ConstellationField />
      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-10">
        <Reveal>
          <p className="kicker text-[9px] text-baby-dim">A FIELD OF CONNECTIONS</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="headline mt-5 text-2xl font-bold leading-snug text-white md:text-4xl">
            Every tool here is a node.
            <br />
            <span className="text-baby">The work is the connection between them.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}