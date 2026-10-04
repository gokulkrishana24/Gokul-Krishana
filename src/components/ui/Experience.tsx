'use client';

import { motion } from 'framer-motion';
import { certifications, experience, hackathons } from '@/data/content';
import { Reveal } from './About';

/**
 * EXPERIENCE — a cinematic timeline through 2024 → 2028 with the two
 * internships; HACKATHONS below; then a floating editorial credential
 * wall (typography, not cards) for the four certifications.
 */
export function Experience() {
  return (
    <section id="experience" className="relative py-28 md:py-40" aria-label="Experience" data-splash="blue" data-music="tech">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-[10px] text-sun md:text-xs">05 · CAREER</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-5 text-4xl font-bold leading-tight text-white md:text-6xl">
            EXPERIENCE
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="headline mt-4 font-display text-lg font-bold text-baby">{experience.years}</p>
        </Reveal>

        {/* timeline */}
        <div className="relative mt-16">
          {/* the line */}
          <div aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-baby/50 via-white/10 to-transparent md:left-1/2" />

          <div className="space-y-14">
            {experience.roles.map((r, i) => (
              <Reveal key={r.org} delay={0.06 * i}>
                <div className={`relative pl-10 md:w-1/2 md:pl-0 ${i % 2 === 0 ? 'md:pr-14' : 'md:ml-auto md:pl-14'}`}>
                  {/* node */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-2 h-[15px] w-[15px] rounded-full border-2 border-baby bg-navy ${i % 2 === 0 ? 'left-0 md:left-auto md:-right-[7.5px]' : 'left-0 md:-left-[7.5px]'}`}
                  />
                  <div className="glass rounded-3xl p-7 transition-colors duration-300 hover:border-baby/30">
                    {/* year marker on the spine */}
                    <p className="headline text-3xl font-bold text-sun/70">{r.year}</p>
                    <h3 className="headline mt-3 text-2xl font-bold text-white">{r.org}</h3>
                    <p className="mt-1 text-sm text-sun">{r.role}</p>
                    <p className="kicker mt-3 text-[9px] text-baby-dim">{r.duration.toUpperCase()}</p>
                    <ul className="mt-5 space-y-2">
                      {r.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2.5 text-sm text-muted">
                          <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-baby" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    {'contributed' in r && r.contributed && (
                      <p className="mt-4 border-l-2 border-baby/40 pl-4 text-xs leading-relaxed text-slate-400">{r.contributed}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* hackathons */}
        <div className="mt-28">
          <Reveal>
            <h3 className="headline text-2xl font-bold text-white md:text-3xl">
              HACKATHONS <span className="text-baby">&amp; COMPETITIONS</span>
            </h3>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {hackathons.map((h, i) => (
              <Reveal key={h.title} delay={0.08 * i}>
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 p-7 transition-colors duration-300 hover:border-sun/40">
                  <span aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sun/5 blur-2xl transition-all duration-500 group-hover:bg-sun/10" />
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="headline text-lg font-bold leading-snug text-white md:text-xl">{h.title}</h4>
                    {'badge' in h && h.badge && (
                      <span className="shrink-0 rounded-full border border-sun/50 bg-sun/10 px-3.5 py-1 font-display text-[10px] font-bold tracking-widest text-sun">
                        {h.badge}
                      </span>
                    )}
                  </div>
                  {'role' in h && h.role && <p className="mt-1.5 text-sm text-baby">{h.role}</p>}
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {h.points.map((pt) => (
                      <span key={pt} className="text-xs text-slate-400">· {pt}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CREDENTIAL WALL — floating editorial typography                    */
/* ------------------------------------------------------------------ */

export function Certifications() {
  return (
    <section id="achievements" className="relative overflow-hidden py-24 md:py-36" aria-label="Certifications and achievements" data-music="tech">
      <div className="mx-auto max-w-5xl px-5 md:px-10">
        <Reveal>
          <p className="kicker text-center text-[10px] text-baby md:text-xs">PROOF OF WORK</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="headline mt-4 text-center text-3xl font-bold text-white md:text-5xl">
            ACHIEVEMENTS <span className="text-baby">&amp; CREDENTIALS</span>
          </h2>
        </Reveal>

        <div className="mt-14 space-y-2">
          {certifications.map((c, i) => (
            <Reveal key={c.issuer} delay={0.06 * i}>
              <motion.div
                whileHover={{ x: 12 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="group flex cursor-default items-center justify-between gap-6 border-b border-white/10 py-6"
                data-cursor="EXPLORE"
              >
                <div className="flex items-baseline gap-5 md:gap-8">
                  <span className="kicker text-[9px] text-baby-dim">0{i + 1}</span>
                  <span className="headline text-xl font-bold text-white transition-colors duration-300 group-hover:text-baby md:text-3xl">
                    {c.issuer}
                  </span>
                </div>
                <span className="text-right text-xs text-slate-400 md:text-sm">{c.detail}</span>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-xs text-slate-500">
            Smart India Hackathon 2026 · College Internal Hackathon (Top 10 Team) · certificates available on request
          </p>
        </Reveal>
      </div>
    </section>
  );
}
