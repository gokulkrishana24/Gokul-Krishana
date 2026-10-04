'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { projects, type Project } from '@/data/content';
import { useReducedMotion } from '@/lib/useIsTouch';

/**
 * PROJECT CASE STUDY — the interactive detail experience behind
 * VIEW PROJECT.
 *
 * This is an overlay, not a route: opening it never reloads or
 * re-fetches the page, and the portfolio keeps its scroll position
 * behind the panel. Closing it restores focus to whatever opened it,
 * exactly like the resume viewer.
 *
 * It is deliberately self-contained: it receives the open project id and
 * reports changes, so Projects.tsx keeps ownership of the grid.
 *
 * Entry/exit use a short pixel-grid wipe so the transition belongs to the
 * site without being distracting.
 */

type Props = {
  /** id of the project being shown, or null when closed */
  openId: string | null;
  onClose: () => void;
  /** request a different project (used by NEXT / BACK) */
  onNavigate: (id: string) => void;
};

/** Projects that expose a case study — matches `viewProject` in content. */
const CASE_STUDY_IDS = projects.filter((p) => p.viewProject).map((p) => p.id);

export function ProjectCaseStudy({ openId, onClose, onNavigate }: Props) {
  const reduced = useReducedMotion();
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const project = useMemo(
    () => projects.find((p) => p.id === openId) ?? null,
    [openId],
  );

  /** position within the case-study set, for BACK / NEXT */
  const position = useMemo(() => {
    if (!project) return -1;
    return CASE_STUDY_IDS.indexOf(project.id);
  }, [project]);

  const goRelative = useCallback(
    (delta: number) => {
      if (position < 0) return;
      const next = CASE_STUDY_IDS[(position + delta + CASE_STUDY_IDS.length) % CASE_STUDY_IDS.length];
      if (next) onNavigate(next);
    },
    [position, onNavigate],
  );

  /* remember the opener, move focus in, restore focus out */
  useEffect(() => {
    if (openId) {
      openerRef.current = document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => closeRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
    openerRef.current?.focus?.();
    openerRef.current = null;
    return;
  }, [openId]);

  /* Escape closes; arrows move between case studies */
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') goRelative(1);
      if (e.key === 'ArrowLeft') goRelative(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId, onClose, goRelative]);

  /* lock the page behind the panel, without breaking touch scrolling
     inside the panel itself */
  useEffect(() => {
    if (!openId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openId]);

  return (
    <AnimatePresence mode="wait">
      {project && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-[92] bg-navy"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} case study`}
        >
          {/* pixel wipe — echoes the site's identity, kept brief */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 grid grid-cols-12 grid-rows-8"
            initial={reduced ? false : { opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {Array.from({ length: 96 }).map((_, i) => (
              <motion.span
                key={i}
                className="bg-baby/70"
                initial={reduced ? false : { opacity: 0.9, scaleY: 1 }}
                animate={{ opacity: 0, scaleY: 0.2 }}
                transition={{
                  duration: 0.42,
                  delay: reduced ? 0 : (i % 12) * 0.014 + Math.floor(i / 12) * 0.02,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left center', background: '#070A10' }}
          />

          <div className="relative z-20 flex h-full flex-col overflow-y-auto overscroll-contain">
            {/* ---------------- header ---------------- */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-navy/90 px-5 py-4 backdrop-blur-xl md:px-10">
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="group inline-flex items-center gap-2 font-display text-[10px] font-bold tracking-[0.18em] text-white/80 transition-colors hover:text-baby"
                data-cursor="EXIT"
              >
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                BACK TO WORK
              </button>

              <div className="flex items-center gap-2">
                <NavButton label="← PREV" onClick={() => goRelative(-1)} reduced={reduced} />
                <NavButton label="NEXT →" onClick={() => goRelative(1)} reduced={reduced} />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close case study"
                  className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                  data-cursor="EXIT"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ---------------- body ---------------- */}
            <motion.article
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mx-auto w-full max-w-5xl px-5 pb-24 pt-12 md:px-10 md:pt-16"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-xs font-bold tracking-[0.3em] text-sun">
                  {project.index}
                </span>
                <span className="h-px w-10 bg-white/20" />
                <span className="kicker text-[9px] text-slate-500">CASE STUDY</span>
              </div>

              <h2 className="headline mt-5 text-3xl font-bold leading-tight text-white md:text-5xl">
                {project.title}
              </h2>
              <p className="mt-3 text-sm text-baby md:text-base">{project.subtitle}</p>

              <p className="mt-7 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
                {project.description}
              </p>

              {/* technology */}
              <Section label="TECHNOLOGY">
                <ul className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-200"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* architecture */}
              {project.pipeline && project.pipeline.length > 0 && (
                <Section label="ARCHITECTURE">
                  <ol className="flex flex-wrap items-center gap-2">
                    {project.pipeline.map((step, i) => (
                      <li key={step} className="flex items-center gap-2">
                        <span className="rounded-lg border border-baby/25 bg-baby/5 px-3 py-2 font-display text-[10px] font-bold tracking-[0.12em] text-baby">
                          {step}
                        </span>
                        {i < project.pipeline!.length - 1 && (
                          <span aria-hidden="true" className="text-white/25">→</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* metrics */}
              {project.metrics && project.metrics.length > 0 && (
                <Section label="METRICS">
                  <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {project.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                      >
                        <dt className="kicker text-[8px] text-slate-500">{m.label}</dt>
                        <dd className="mt-2 font-display text-2xl font-bold text-sun">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              )}

              {/* honest note */}
              {project.note && (
                <p className="mt-8 border-l-2 border-sun/50 pl-4 text-xs leading-relaxed text-slate-400">
                  {project.note}
                </p>
              )}

              {/* source */}
              <div className="mt-12 flex flex-wrap items-center gap-4">
                {project.demo ? (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-baby px-7 py-3.5 font-display text-[10px] font-bold tracking-[0.18em] text-navy transition-all duration-300 hover:bg-sun active:scale-[0.98]"
                    data-cursor="ENTER"
                  >
                    VIEW PROJECT ↗
                  </a>
                ) : (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-baby px-7 py-3.5 font-display text-[10px] font-bold tracking-[0.18em] text-navy transition-all duration-300 hover:bg-sun active:scale-[0.98]"
                    data-cursor="ENTER"
                  >
                    SOURCE LINK ↗
                  </a>
                )}

                <p className="kicker text-[8px] text-slate-600">
                  OPENED IN PLACE — THE PAGE BEHIND NEVER RELOADED
                </p>
              </div>
            </motion.article>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <p className="kicker mb-4 text-[9px] text-baby-dim">{label}</p>
      {children}
    </section>
  );
}

function NavButton({
  label,
  onClick,
  reduced,
}: {
  label: string;
  onClick: () => void;
  reduced: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className="rounded-full border border-white/15 px-4 py-2 font-display text-[9px] font-bold tracking-[0.16em] text-white/70 transition-colors hover:border-baby/50 hover:text-baby"
      data-cursor="ENTER"
    >
      {label}
    </motion.button>
  );
}