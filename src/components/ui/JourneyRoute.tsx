'use client';

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { journey } from '@/data/content';
import { Reveal } from './About';

/**
 * JOURNEY MAP — a cinematic route, not a list.
 *
 * The route and the milestones share ONE coordinate space (this
 * viewBox), so nodes can never drift out of alignment with the curve
 * at any breakpoint — no negative-margin guessing.
 *
 * Scroll progress does two things:
 *   1. drives the sunshine-yellow progress stroke via `pathLength`;
 *   2. places the travelling marker with `getPointAtLength`, so the
 *      marker is *derived from the path itself* rather than from
 *      hand-tuned coordinates.
 *
 * Scrolling down moves the marker forward, scrolling up moves it
 * backward. There is no autonomous movement at all.
 */

const VIEW_W = 1000;
const VIEW_H = 520;

/**
 * The route: a four-wave serpentine that fills the whole viewBox, so
 * there is no dead space and the eye is carried across the section.
 */
const ROUTE_D =
  'M 60 110 C 170 110, 180 320, 300 320 S 430 110, 550 110 S 680 320, 800 320 S 900 230, 935 430';

/**
 * Milestone anchors sit ON the curve. `above` places the label on the
 * side the curve is not travelling towards, so labels never collide
 * with the line. `at` is the fraction of path length at which the
 * node lights up as the progress stroke passes it.
 */
interface Anchor {
  x: number;
  y: number;
  above: boolean;
  anchor: 'start' | 'end' | 'middle';
  at: number;
}

const ANCHORS: Anchor[] = [
  { x: 60, y: 110, above: true, anchor: 'start', at: 0 },
  { x: 190, y: 220, above: true, anchor: 'start', at: 0.16 },
  { x: 300, y: 320, above: true, anchor: 'start', at: 0.31 },
  { x: 425, y: 215, above: true, anchor: 'start', at: 0.47 },
  { x: 550, y: 110, above: true, anchor: 'start', at: 0.62 },
  { x: 800, y: 320, above: true, anchor: 'end', at: 0.82 },
  { x: 935, y: 430, above: true, anchor: 'end', at: 1 },
];

export function JourneyMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start 0.85', 'end 0.25'],
  });
  // A light spring removes scroll jitter without perceptible lag.
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  // Marker follows the path itself — guaranteed alignment, both directions.
  useMotionValueEvent(smooth, 'change', (p) => {
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!path || !marker) return;
    const clamped = Math.max(0, Math.min(1, p));
    const len = path.getTotalLength();
    const point = path.getPointAtLength(clamped * len);
    marker.setAttribute('transform', `translate(${point.x} ${point.y})`);
  });

  const routeOpacity = useTransform(smooth, [0, 0.12, 1], [0.3, 1, 1]);
  const glowOpacity = useTransform(smooth, [0, 0.2, 1], [0, 0.5, 0.9]);

  return (
    <section
      id="journey-map"
      className="relative overflow-hidden py-24 md:py-32"
      aria-label="My journey overview" data-music="warm"
      data-splash="blue"
    >
      <div className="digital-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />

      <div ref={wrapRef} className="relative mx-auto max-w-6xl px-5 md:px-10">
        <Reveal>
          <h2 className="headline text-center text-4xl font-bold text-white md:text-6xl">
            MY <span className="text-baby">JOURNEY</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted">{journey.sub}</p>
        </Reveal>

        <div className="relative mt-16 w-full md:mt-20" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="absolute inset-0 h-full w-full overflow-visible"
            fill="none"
            role="img"
            aria-label="Journey route from school through college, development, AI and machine learning, cybersecurity and projects, into the future"
          >
            {/* ambient glow copy of the route */}
            <motion.path
              d={ROUTE_D}
              stroke="rgba(255,211,77,0.16)"
              strokeWidth="7"
              filter="blur(9px)"
              style={{ opacity: glowOpacity }}
            />

            {/* base route — faint baby blue */}
            <motion.path
              d={ROUTE_D}
              stroke="rgba(142,203,242,0.22)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ opacity: routeOpacity }}
            />

            {/* measured path — used for getTotalLength / getPointAtLength */}
            <path ref={pathRef} d={ROUTE_D} stroke="none" fill="none" />

            {/* progress stroke, drawn by scroll */}
            <motion.path
              d={ROUTE_D}
              stroke="#FFD34D"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: smooth }}
            />

            {/* travelling marker */}
            <g ref={markerRef}>
              <circle r="14" fill="rgba(255,211,77,0.13)" />
              <circle r="5.5" fill="#FFD34D" />
              <circle r="5.5" fill="none" stroke="#070A10" strokeWidth="1.5" />
            </g>

            {journey.stops.map((stop, i) => (
              <Milestone
                key={stop.index}
                anchor={ANCHORS[i] ?? ANCHORS[ANCHORS.length - 1]}
                progress={smooth}
                at={(ANCHORS[i] ?? ANCHORS[ANCHORS.length - 1]).at}
                label={stop.label}
                index={stop.index}
                place={stop.place}
              />
            ))}
          </svg>
        </div>

        {/* Accessible text equivalent of the route. */}
        <ul className="sr-only">
          {journey.stops.map((s) => (
            <li key={s.index}>
              {s.index} — {s.label} ({s.place})
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* MILESTONE — activates as the progress stroke passes it             */
/* ------------------------------------------------------------------ */

function Milestone({
  anchor,
  progress,
  at,
  label,
  index,
  place,
}: {
  anchor: Anchor;
  progress: ReturnType<typeof useSpring>;
  at: number;
  label: string;
  index: string;
  place: string;
}) {
  const { x, y, above } = anchor;
  const active = useTransform(progress, [Math.max(0, at - 0.06), at + 0.02], [0, 1]);
  const scale = useTransform(active, [0, 1], [0.7, 1]);
  const fill = useTransform(active, [0, 1], ['rgba(7,10,16,1)', 'rgba(255,211,77,0.95)']);
  const glowOpacity = useTransform(active, [0, 1], [0, 0.55]);

  // Leader line + text sit on the side the curve is travelling away from.
  const labelX = anchor.anchor === 'start' ? 14 : anchor.anchor === 'end' ? -14 : 0;
  // generous separation so the kicker never collides with the title
  const kickerY = above ? -30 : 30;
  const titleY = above ? -10 : 50;

  return (
    <g>
      <motion.circle cx={x} cy={y} r="16" fill="#FFD34D" style={{ opacity: glowOpacity }} filter="blur(6px)" />
      <motion.circle cx={x} cy={y} r="7" style={{ scale, fill }} stroke="#8ECBF2" strokeWidth="1.6" />
      {/* the one controlled red accent, on the future node only */}
      {index === '07' && <circle cx={x} cy={y} r="12" fill="none" stroke="rgba(255,92,92,0.5)" strokeWidth="1" />}

      <g transform={`translate(${x} ${y})`}>
        <motion.g style={{ opacity: active }}>
          {/* short leader so the label is visually tied to its node */}
          <path
            d={`M ${labelX > 0 ? 7 : labelX < 0 ? -7 : 0} 0 L ${labelX > 0 ? 12 : labelX < 0 ? -12 : 0} ${above ? -6 : 12}`}
            stroke="rgba(142,203,242,0.4)"
            strokeWidth="1"
          />
          <text
            x={labelX}
            y={kickerY}
            textAnchor={anchor.anchor}
            fill="rgba(157,169,183,0.9)"
            fontSize="11"
            letterSpacing="3"
            fontFamily="system-ui, sans-serif"
          >
            {index} · {place}
          </text>
          <text
            x={labelX}
            y={titleY}
            textAnchor={anchor.anchor}
            fill="#F4F6F8"
            fontSize="17"
            fontWeight="700"
            letterSpacing="0.5"
            fontFamily="system-ui, sans-serif"
          >
            {label}
          </text>
        </motion.g>
      </g>
    </g>
  );
}