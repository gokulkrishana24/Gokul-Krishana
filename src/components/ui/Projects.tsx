'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { projects, type Project } from '@/data/content';
import { Reveal } from './About';

/**
 * PROJECTS — SELECTED WORK. Large editorial presentations, no tiny
 * cards. FaceRecognition AI is the hero project with a cinematic
 * face-scanning visual; the rest get bespoke CSS/SVG visuals
 * (security / map / database). Hover: image scale, title shift,
 * arrow movement, VIEW cursor. Touch: subtle depth response.
 */
export function Projects() {
  return (
    <section id="projects" className="relative py-28 md:py-40" aria-label="Selected work" data-splash="blue">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-[10px] text-sun md:text-xs">SELECTED WORK</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-5 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            PROJECTS THAT <span className="text-baby">SHIP</span>
          </h2>
        </Reveal>

        <div className="mt-20 space-y-28 md:space-y-36">
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ project: p }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const hero = Boolean(p.hero);

  return (
    <article
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${p.index === '02' || p.index === '04' ? 'lg:[&>*:first-child]:order-2' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={() => setHovered(true)}
    >
      {/* visual — the frame itself stays interactive even when the project
          has no public VIEW PROJECT link, so hover/touch depth still works */}
      <motion.div
        className={`group relative block overflow-hidden rounded-3xl border border-white/10 ${hero ? 'aspect-[16/10]' : 'aspect-[16/11]'}`}
        whileHover={{ scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        data-cursor={p.viewProject ? 'VIEW' : undefined}
        aria-hidden={!p.viewProject}
      >
        <ProjectVisual project={p} active={hovered} />
      </motion.div>

      {/* text */}
      <div>
        <Reveal>
          <p className="kicker text-[10px] text-baby-dim">PROJECT {p.index}</p>
          <h3 className={`headline mt-4 font-bold leading-tight text-white transition-transform duration-500 group-hover:translate-x-1 ${hero ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'}`}>
            {p.title}
          </h3>
          <p className="mt-3 font-display text-xs uppercase tracking-widest2 text-sun">{p.subtitle}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-6 max-w-xl leading-relaxed text-slate-300">{p.description}</p>
        </Reveal>

        {/* hero project: pipeline + benchmarks + note */}
        {p.pipeline && (
          <Reveal delay={0.12}>
            <div className="mt-7">
              <p className="kicker text-[9px] text-baby-dim">PIPELINE</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                {p.pipeline.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-200">{step}</span>
                    {i < p.pipeline!.length - 1 && <span aria-hidden="true" className="text-[9px] text-baby/60">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {p.metrics && (
          <Reveal delay={0.16}>
            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
              {p.metrics.map((m) => (
                <div key={m.label} className="rounded-2xl border border-baby/15 bg-baby/5 p-3.5 text-center">
                  <p className="headline text-lg font-bold text-baby">{m.value}</p>
                  <p className="mt-1 text-[10px] leading-tight text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {p.focus && (
          <Reveal delay={0.12}>
            <div className="mt-7 flex flex-wrap gap-2">
              {p.focus.map((f) => (
                <span key={f} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] text-slate-300">{f}</span>
              ))}
            </div>
          </Reveal>
        )}

        {p.note && (
          <Reveal delay={0.18}>
            <p className="mt-5 border-l-2 border-sun/50 pl-4 text-xs leading-relaxed text-slate-400">{p.note}</p>
          </Reveal>
        )}

        {p.technologies.length > 0 && (
          <Reveal delay={0.2}>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {p.technologies.map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-300">{t}</span>
              ))}
            </div>
          </Reveal>
        )}

        {p.viewProject && (
          <Reveal delay={0.22}>
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link mt-8 inline-flex items-center gap-2.5 font-display text-xs font-bold tracking-[0.2em] text-baby transition-colors hover:text-sun"
              data-cursor="ENTER"
            >
              VIEW PROJECT
              <span aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-1.5">→</span>
            </a>
          </Reveal>
        )}

        {!p.viewProject && (
          <Reveal delay={0.22}>
            <p className="kicker mt-8 text-[9px] text-baby-dim">
              CONCEPT / INTERNAL BUILD — NO PUBLIC REPOSITORY
            </p>
          </Reveal>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* BESPOKE PROJECT VISUALS — pure CSS/SVG, no heavy assets            */
/* ------------------------------------------------------------------ */

function ProjectVisual({ project: p, active }: { project: Project; active: boolean }) {
  switch (p.visual) {
    case 'scan':
      return <ScanVisual active={active} />;
    case 'security':
      return <SecurityVisual active={active} />;
    case 'map':
      return <MapVisual active={active} />;
    case 'database':
      return <DatabaseVisual active={active} />;
  }
}

/** FACERECOGNITION AI — cinematic face-scanning visual. */
function ScanVisual({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 bg-navy-soft">
      <div className="digital-grid absolute inset-0 opacity-50" />

      {/* face silhouette */}
      <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <ellipse cx="200" cy="125" rx="62" ry="82" stroke="rgba(142,203,255,0.5)" strokeWidth="1.2" />
        <ellipse cx="200" cy="125" rx="78" ry="96" stroke="rgba(142,203,255,0.18)" strokeWidth="1" strokeDasharray="4 6" />
        {/* landmarks */}
        {[[178, 105], [222, 105], [200, 128], [182, 155], [218, 155], [163, 118], [237, 118], [172, 140], [228, 140]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,211,77,0.85)">
            <animate attributeName="opacity" values="1;0.3;1" dur={`${1.4 + (i % 4) * 0.35}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* recognition box */}
        <motion.rect
          x="128"
          y="52"
          width="144"
          height="150"
          rx="10"
          stroke="rgba(142,203,255,0.55)"
          strokeWidth="1.2"
          strokeDasharray="14 10"
          initial={false}
          animate={active ? { x: 120, y: 46 } : { x: 128, y: 52 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <line x1="128" y1="228" x2="272" y2="228" stroke="rgba(228,87,79,0.4)" strokeWidth="1" />
      </svg>

      {/* scan line */}
      <div className="absolute inset-x-0 overflow-hidden">
        <span
          className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-baby to-transparent"
          style={{ top: active ? '40%' : '18%', transition: 'top 1.2s cubic-bezier(0.22,1,0.36,1)', boxShadow: '0 0 12px rgba(142,203,255,0.8)' }}
        />
      </div>

      {/* HUD text */}
      <div className="absolute left-5 top-5 space-y-1.5">
        <p className="kicker text-[8px] text-baby">FACE_RECOGNITION // LIVE</p>
        <p className="kicker text-[8px] text-slate-500">TRACKING: BYTETRACK · EMBED: 512D</p>
      </div>
      <div className="absolute bottom-5 right-5 text-right">
        <p className="kicker text-[8px] text-sun">ARCFACE · FAISS</p>
        <p className="kicker mt-1 text-[8px] text-slate-500">ATTENDANCE: VERIFIED</p>
      </div>
    </div>
  );
}

/** SECURECLIP — clipboard monitor / pattern-detection visual. */
function SecurityVisual({ active }: { active: boolean }) {
  const detections = [
    { label: 'password', risk: 'HIGH', color: 'text-red-300 border-accent-red/40' },
    { label: 'card **** 4242', risk: 'CRITICAL', color: 'text-red-300 border-accent-red/40' },
    { label: 'email address', risk: 'MEDIUM', color: 'text-sun border-sun/40' },
    { label: 'phone number', risk: 'MEDIUM', color: 'text-sun border-sun/40' },
  ];
  return (
    <div className="absolute inset-0 bg-navy-soft">
      <div className="digital-grid absolute inset-0 opacity-30" />
      <div className="absolute inset-0 flex flex-col justify-center gap-2.5 px-8 md:px-12">
        <p className="kicker text-[9px] text-baby">CLIPBOARD MONITOR // DLP</p>
        {detections.map((d, i) => (
          <motion.div
            key={d.label}
            initial={false}
            animate={active ? { x: 6, opacity: 1 } : { x: 0, opacity: 0.85 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className={`flex w-fit max-w-full items-center gap-3 rounded-lg border bg-navy/70 px-4 py-2 ${d.color}`}
          >
            <span className="text-xs font-medium text-slate-200">{d.label}</span>
            <span className="kicker text-[8px]">{d.risk}</span>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${d.risk === 'MEDIUM' ? 'bg-sun' : 'bg-accent-red'} animate-pulse-soft`} />
          </motion.div>
        ))}
        <motion.p
          animate={active ? { opacity: 1 } : { opacity: 0.6 }}
          className="kicker mt-1 text-[9px] text-slate-500"
        >
          RISK CLASSIFIED → ALERT → AUTO-CLEAR
        </motion.p>
      </div>
    </div>
  );
}

/** SMART TOURIST — subtle map visual with safety zones. */
function MapVisual({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 bg-navy-soft">
      <div className="digital-grid absolute inset-0 opacity-25" />
      <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        {/* stylized Nilgiris contours */}
        {[26, 38, 50, 62].map((r, i) => (
          <ellipse key={i} cx="150" cy="140" rx={r * 1.6} ry={r} stroke="rgba(142,203,255,0.14)" strokeWidth="1" />
        ))}
        {/* roads */}
        <path d="M 20 220 C 90 190, 120 150, 170 130 S 280 110, 380 60" stroke="rgba(142,203,255,0.35)" strokeWidth="1.2" strokeDasharray="6 8" />
        <path d="M 60 40 C 110 80, 150 110, 180 128" stroke="rgba(142,203,255,0.2)" strokeWidth="1" strokeDasharray="4 8" />
        {/* police / support points */}
        {[[150, 140], [236, 112], [96, 178], [300, 84]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="rgba(255,211,77,0.9)">
              <animate attributeName="opacity" values="1;0.35;1" dur={`${1.8 + i * 0.4}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="10" stroke="rgba(255,211,77,0.3)" strokeWidth="1" />
          </g>
        ))}
        {/* tourist marker */}
        <motion.g
          initial={false}
          animate={active ? { scale: 1.15 } : { scale: 1 }}
          style={{ originX: '200px', originY: '125px' }}
        >
          <circle cx="200" cy="125" r="6" fill="rgba(142,203,255,0.95)" />
          <circle cx="200" cy="125" r="14" stroke="rgba(142,203,255,0.4)" strokeWidth="1.2" />
        </motion.g>
      </svg>
      <div className="absolute left-5 top-5 space-y-1.5">
        <p className="kicker text-[8px] text-baby">SMART TOURIST // PUBLIC SAFETY</p>
        <p className="kicker text-[8px] text-slate-500">NILGIRIS DISTRICT POLICE</p>
      </div>
      <div className="absolute bottom-5 right-5">
        <p className="kicker text-[8px] text-sun">SUPPORT · SAFETY · MONITORING</p>
      </div>
    </div>
  );
}

/** HOUSE RENTAL — interactive database / relational visualization. */
function DatabaseVisual({ active }: { active: boolean }) {
  const tables = [
    { name: 'PROPERTIES', x: 40, y: 46 },
    { name: 'TENANTS', x: 250, y: 34 },
    { name: 'RENTALS', x: 160, y: 150 },
  ];
  return (
    <div className="absolute inset-0 bg-navy-soft">
      <div className="digital-grid absolute inset-0 opacity-25" />
      <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        {/* relation lines */}
        <line x1="92" y1="72" x2="180" y2="160" stroke="rgba(142,203,255,0.35)" strokeWidth="1" />
        <line x1="290" y1="62" x2="212" y2="158" stroke="rgba(142,203,255,0.35)" strokeWidth="1" />
        {tables.map((t, i) => (
          <motion.g
            key={t.name}
            initial={false}
            animate={active ? { y: -3 } : { y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45, ease: 'easeOut' }}
          >
            <rect x={t.x} y={t.y} width="110" height="44" rx="8" fill="rgba(10,18,32,0.9)" stroke="rgba(142,203,255,0.4)" strokeWidth="1" />
            <text x={t.x + 55} y={t.y + 26} textAnchor="middle" fill="rgba(244,246,248,0.9)" fontSize="10" fontFamily="system-ui" letterSpacing="1.5">
              {t.name}
            </text>
          </motion.g>
        ))}
        {/* keys */}
        {[[150, 112], [246, 108]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 16} y={y - 8} width="32" height="14" rx="4" fill="rgba(255,211,77,0.12)" stroke="rgba(255,211,77,0.5)" strokeWidth="0.8" />
            <text x={x} y={y + 2} textAnchor="middle" fill="rgba(255,211,77,0.9)" fontSize="8" fontFamily="system-ui">KEY</text>
          </g>
        ))}
      </svg>
      <div className="absolute left-5 top-5">
        <p className="kicker text-[8px] text-baby">RELATIONAL // MYSQL</p>
      </div>
      <div className="absolute bottom-5 right-5">
        <p className="kicker text-[8px] text-slate-500">STRUCTURED DATA · SQL</p>
      </div>
    </div>
  );
}
