'use client';

import { useId, useState } from 'react';
import { contact, profile } from '@/data/content';
import { LIMITS, PROJECT_TYPES, validateContact, type FieldErrors } from '@/lib/contact';
import { useScrollTo } from '@/lib/lenis';
import { Reveal } from './About';
import { useResumeDownload, ResumeCinematic } from './ResumeCinematic';

/**
 * CONTACT — dark cinematic transition into a subtle terminal
 * (CONNECTION_REQUEST), the big LET'S BUILD SOMETHING heading, all
 * real info + buttons (VIEW GITHUB / CONNECT ON LINKEDIN / DOWNLOAD
 * RESUME with the same video flow), a contact form with an honest
 * mailto fallback, then FINAL CTA and FOOTER.
 */
export function Contact() {
  const resume = useResumeDownload();

  return (
    <>
      <section id="contact" className="relative overflow-hidden pt-28 md:pt-40" aria-label="Contact" data-splash="blue">
        {/* dark cinematic gradient into the final chapter */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent to-navy" />

        <div className="relative mx-auto max-w-6xl px-5 md:px-10">
          {/* the terminal */}
          <Reveal>
            <div className="mx-auto w-fit rounded-xl border border-baby/25 bg-navy-soft/90 px-6 py-4 font-mono text-[11px] leading-relaxed text-baby shadow-[0_0_40px_rgba(142,203,255,0.08)]">
              <p><span className="text-sun">→</span> {contact.terminal.title}</p>
              <p className="text-slate-400">{contact.terminal.target}</p>
              <p className="text-muted">
                {contact.terminal.status} <span className="ml-1 inline-block h-3 w-1.5 animate-blink bg-baby align-middle" aria-hidden="true" />
              </p>
              <p className="mt-1 text-baby">{contact.terminal.prompt}</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="headline mt-12 text-center text-4xl font-bold leading-tight text-white md:text-7xl">
              LET&apos;S BUILD<br />
              <span className="text-baby">SOMETHING.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-10 grid gap-8 text-center md:grid-cols-3">
              <div>
                <p className="kicker text-[9px] text-baby-dim">LOCATION</p>
                <p className="mt-2 text-sm text-slate-200">{profile.location}</p>
              </div>
              <div>
                <p className="kicker text-[9px] text-baby-dim">EMAIL</p>
                <a href={`mailto:${profile.email}`} className="mt-2 block text-sm text-slate-200 transition hover:text-baby">
                  {profile.email}
                </a>
              </div>
              <div>
                <p className="kicker text-[9px] text-baby-dim">PROFILES</p>
                <p className="mt-2 flex items-center justify-center gap-4 text-sm text-slate-200">
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="transition hover:text-baby">GitHub</a>
                  <span className="text-white/20">·</span>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="transition hover:text-baby">LinkedIn</a>
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-7 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-white transition-all duration-300 hover:border-baby hover:text-baby"
                data-cursor="ENTER"
              >
                VIEW GITHUB
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-7 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-white transition-all duration-300 hover:border-baby hover:text-baby"
                data-cursor="ENTER"
              >
                CONNECT ON LINKEDIN
              </a>
              <button
                onClick={resume.start}
                className="rounded-full bg-baby px-7 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-navy transition-all duration-300 hover:bg-sun"
                data-cursor="ENTER"
              >
                DOWNLOAD RESUME
              </button>
            </div>
          </Reveal>

          <ContactForm />
        </div>
      </section>

      <FinalCta />

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 text-center md:flex-row md:px-10 md:text-left">
          <div>
            <p className="headline font-display text-sm font-bold tracking-[0.18em] text-white">{contact.footer.name}</p>
            <p className="mt-1 text-xs text-slate-400">{contact.footer.line}</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="transition hover:text-baby">GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="transition hover:text-baby">LinkedIn</a>
            <a href={`mailto:${profile.email}`} className="transition hover:text-baby">Email</a>
          </div>
          <p className="kicker text-[9px] text-baby-dim">{contact.footer.copyright}</p>
        </div>
      </footer>

      <ResumeCinematic open={resume.open} onFinish={resume.finish} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CONTACT FORM                                                       */
/*                                                                     */
/* Posts to the hardened /api/contact endpoint, which re-validates    */
/* every field server-side, rate limits per IP and drops honeypot     */
/* submissions. If no mail provider is configured the endpoint asks   */
/* the client to fall back to a prefilled mail draft — so the form    */
/* always does something honest, and never fakes success.            */
/* ------------------------------------------------------------------ */

type Status = 'idle' | 'sending' | 'sent' | 'fallback' | 'error';

function ContactForm() {
  const uid = useId();
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: PROJECT_TYPES[0] as string,
    message: '',
    company: '', // honeypot
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [notice, setNotice] = useState('');

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    // Clear a field's error as soon as the visitor edits it.
    setErrors((prev) => (prev[key as keyof FieldErrors] ? { ...prev, [key]: undefined } : prev));
  };

  const openMailDraft = (to: string) => {
    const subject = encodeURIComponent(`[Portfolio] ${form.type} — ${form.name}`);
    const body = encodeURIComponent(
      `Hi Gokul,\n\n${form.message}\n\n— ${form.name}\n${form.email}\nProject type: ${form.type}`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    // Same rules as the server — fast feedback only.
    const check = validateContact({
      name: form.name,
      email: form.email,
      projectType: form.type,
      message: form.message,
      company: form.company,
    });
    if (!check.ok) {
      setErrors(check.errors);
      setStatus('error');
      setNotice('Please check the highlighted fields.');
      return;
    }

    setStatus('sending');
    setNotice('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          projectType: form.type,
          message: form.message,
          company: form.company,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        delivered?: string;
        error?: string;
        to?: string;
        fields?: FieldErrors;
      };

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setStatus('error');
        // Generic message — the server never explains its internals.
        setNotice(data.error || 'Something went wrong. Please try again.');
        return;
      }

      if (data.delivered === 'fallback') {
        openMailDraft(data.to || profile.email);
        setStatus('fallback');
        setNotice(`Opening your mail app — the message is pre-filled for ${data.to || profile.email}.`);
        return;
      }

      setStatus('sent');
      setNotice(`Thanks ${form.name.split(' ')[0]} — message sent. I’ll reply to ${form.email}.`);
      setForm({ name: '', email: '', type: PROJECT_TYPES[0] as string, message: '', company: '' });
      setErrors({});
    } catch {
      // Network failure — still give the visitor a working route.
      openMailDraft(profile.email);
      setStatus('fallback');
      setNotice(`Could not reach the server — opening your mail app instead (${profile.email}).`);
    }
  };

  const inputCls = (field?: string) =>
    `w-full rounded-xl border bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-baby/60 ${
      field && errors[field as keyof FieldErrors] ? 'border-accent-red/70' : 'border-white/10'
    }`;

  const errorFor = (field: keyof FieldErrors) =>
    errors[field] ? (
      <span id={`${uid}-${field}-error`} role="alert" className="mt-2 block text-[11px] text-accent-red">
        {errors[field]}
      </span>
    ) : null;

  const busy = status === 'sending';

  return (
    <Reveal delay={0.1}>
      <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-2xl" aria-label="Contact form" noValidate>
        <p className="kicker mb-8 text-center text-[10px] text-baby">WHAT SHOULD WE BUILD NEXT?</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block" htmlFor={`${uid}-name`}>
              <span className="kicker mb-2 block text-[8px] text-baby-dim">NAME</span>
            </label>
            <input
              id={`${uid}-name`}
              name="name"
              value={form.name}
              onChange={update('name')}
              className={inputCls('name')}
              placeholder="Your name"
              autoComplete="name"
              maxLength={LIMITS.name.max}
              required
              minLength={LIMITS.name.min}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            />
            {errorFor('name')}
          </div>

          <div>
            <label className="block" htmlFor={`${uid}-email`}>
              <span className="kicker mb-2 block text-[8px] text-baby-dim">EMAIL</span>
            </label>
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              value={form.email}
              onChange={update('email')}
              className={inputCls('email')}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={LIMITS.email.max}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${uid}-email-error` : undefined}
            />
            {errorFor('email')}
          </div>
        </div>

        <div className="mt-4">
          <label className="block" htmlFor={`${uid}-type`}>
            <span className="kicker mb-2 block text-[8px] text-baby-dim">PROJECT TYPE</span>
          </label>
          <select
            id={`${uid}-type`}
            name="projectType"
            value={form.type}
            onChange={update('type')}
            className={`${inputCls('projectType')} appearance-none`}
            required
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-navy text-white">
                {t}
              </option>
            ))}
          </select>
          {errorFor('projectType')}
        </div>

        <div className="mt-4">
          <label className="block" htmlFor={`${uid}-message`}>
            <span className="kicker mb-2 block text-[8px] text-baby-dim">MESSAGE</span>
          </label>
          <textarea
            id={`${uid}-message`}
            name="message"
            rows={5}
            value={form.message}
            onChange={update('message')}
            className={inputCls('message')}
            placeholder="Tell me about the idea…"
            maxLength={LIMITS.message.max}
            required
            minLength={LIMITS.message.min}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${uid}-message-error` : undefined}
          />
          {errorFor('message')}
          <span className="mt-2 block text-right text-[10px] text-slate-500">
            {form.message.length} / {LIMITS.message.max}
          </span>
        </div>

        {/* Honeypot — visually hidden, not display:none, and removed
            from the accessibility tree and tab order. Real visitors
            never fill it; bots that fill everything get discarded. */}
        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor={`${uid}-company`}>Company (leave this field empty)</label>
          <input
            id={`${uid}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={update('company')}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="submit"
            disabled={busy}
            className="group inline-flex items-center gap-3 rounded-full bg-baby px-8 py-3.5 font-display text-xs font-bold tracking-[0.18em] text-navy transition-all duration-300 hover:bg-sun disabled:cursor-wait disabled:opacity-60"
            data-cursor="ENTER"
          >
            {busy ? 'SENDING…' : "LET'S BUILD"}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>

          {notice && (
            <p className="max-w-sm text-xs text-muted" role="status" aria-live="polite">
              {notice}
            </p>
          )}
        </div>
      </form>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* FINAL CTA                                                          */
/* ------------------------------------------------------------------ */

function FinalCta() {
  const scrollTo = useScrollTo();
  return (
    <section id="final-cta" className="relative overflow-hidden py-28 md:py-40" aria-label="Final call to action">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-10">
        <Reveal>
          <h2 className="headline text-4xl font-bold leading-tight text-white md:text-6xl">
            {contact.finalCta.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
            {contact.finalCta.subheading}
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-3 rounded-full bg-baby px-9 py-4 font-display text-xs font-bold tracking-[0.2em] text-navy transition-all duration-300 hover:bg-sun active:scale-[0.98]"
              data-cursor="ENTER"
            >
              {contact.finalCta.primary}
            </a>
            <button
              type="button"
              onClick={() => scrollTo('contact')}
              className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-9 py-4 font-display text-xs font-bold tracking-[0.2em] text-white transition-all duration-300 hover:border-baby hover:text-baby active:scale-[0.98]"
              data-cursor="ENTER"
            >
              {contact.finalCta.secondary}
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
