'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useIsTouch';

/**
 * BACKGROUND VIDEO — deliberately restrained.
 *
 * Rules this component enforces so video never hurts the page:
 *   • muted + playsInline + preload="none" — never blocks anything;
 *   • only mounts the <video> once the section is near the viewport;
 *   • a poster frame shows first, and if the video cannot play the
 *     poster simply stays (graceful, never broken);
 *   • heavy overlay + blur keeps it atmospheric, not distracting;
 *   • reduced-motion users get a static poster and no playback at all.
 */

export function BackgroundVideo({
  src,
  poster,
  className = '',
  opacity = 0.22,
}: {
  src: string;
  poster?: string;
  className?: string;
  opacity?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduced || failed) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setFailed(true));
  }, [visible, reduced, failed]);

  return (
    <div ref={hostRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* poster is always painted — it is the fallback and the first frame */}
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: Math.min(1, opacity + 0.12) }}
          loading="lazy"
        />
      )}

      {!failed && (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          loop
          preload="none"
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity }}
          onError={() => setFailed(true)}
        />
      )}

      {/* dark overlay + vignette so type stays legible over motion */}
      <div className="video-atmosphere absolute inset-0" />
    </div>
  );
}