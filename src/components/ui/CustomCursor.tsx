'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsTouch, useReducedMotion } from '@/lib/useIsTouch';

/**
 * CUSTOM CURSOR — small central dot; expands into a smooth circle on
 * interactive elements with a contextual label (VIEW / EXPLORE /
 * DISCOVER / OPEN). Elements opt in with data-cursor="label".
 * Includes the subtle splash ripple on pointerdown over visual areas
 * (data-splash targets, or anywhere on pointerdown for touch).
 */

type Splash = { id: number; x: number; y: number; hue: 'blue' | 'yellow' | 'red' };

const HUES: Record<Splash['hue'], string> = {
  blue: 'rgba(142, 203, 255, 0.45)',
  yellow: 'rgba(255, 211, 77, 0.4)',
  red: 'rgba(228, 87, 79, 0.35)',
};

export function CustomCursor() {
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const splashId = useRef(0);

  useEffect(() => {
    if (isTouch || reduced) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const labelled = target?.closest?.('[data-cursor]') as HTMLElement | null;
      if (labelled) {
        setLabel(labelled.dataset.cursor || null);
        setActive(true);
      } else {
        const interactive = target?.closest?.('a, button, input, textarea, select, [role="button"]');
        setLabel(null);
        setActive(Boolean(interactive));
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      cancelAnimationFrame(raf);
    };
  }, [isTouch, reduced]);

  // splash ripples — desktop click on visual areas, touch anywhere
  const spawnSplash = useCallback(
    (x: number, y: number, hue: Splash['hue']) => {
      if (reduced) return;
      const id = ++splashId.current;
      setSplashes((s) => [...s.slice(-5), { id, x, y, hue }]);
      window.setTimeout(() => {
        setSplashes((s) => s.filter((sp) => sp.id !== id));
      }, 900);
    },
    [reduced],
  );

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      const area = el?.closest?.('[data-splash]');
      if (area) {
        const hue = (area as HTMLElement).dataset.splash as Splash['hue'];
        spawnSplash(e.clientX, e.clientY, hue === 'yellow' || hue === 'red' ? hue : 'blue');
      }
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const el = e.target as HTMLElement | null;
      const area = el?.closest?.('[data-splash]');
      const hue = ((area as HTMLElement | undefined)?.dataset.splash || 'blue') as Splash['hue'];
      spawnSplash(t.clientX, t.clientY, hue === 'yellow' || hue === 'red' ? hue : 'blue');
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchstart', onTouch);
    };
  }, [spawnSplash]);

  if (isTouch) {
    // touch ripples still render (spawned via touchstart above)
    return <SplashLayer splashes={splashes} />;
  }

  return (
    <>
      <SplashLayer splashes={splashes} />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[95] h-1.5 w-1.5 rounded-full bg-baby opacity-0 transition-opacity duration-300"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[94] flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-out ${
          label
            ? 'border-sun/80 bg-sun/15 backdrop-blur-[2px]'
            : active
              ? 'border-baby/80 bg-baby/10'
              : 'border-white/35 bg-transparent'
        }`}
        style={{
          width: label ? 76 : active ? 44 : 28,
          height: label ? 76 : active ? 44 : 28,
          opacity: 0,
          transform: 'translate(-100px, -100px)',
          scale: pressed ? '0.88' : '1',
        }}
      >
        {label && (
          <span className="kicker text-[8px] font-bold text-white">{label}</span>
        )}
      </div>
    </>
  );
}

function SplashLayer({ splashes }: { splashes: Splash[] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[93]">
      {splashes.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.x,
            top: s.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            border: `1.5px solid ${HUES[s.hue]}`,
            animation: 'splashRipple 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        />
      ))}
      <style>{`@keyframes splashRipple { from { transform: scale(1); opacity: 0.9; } to { transform: scale(7); opacity: 0; } }`}</style>
    </div>
  );
}
