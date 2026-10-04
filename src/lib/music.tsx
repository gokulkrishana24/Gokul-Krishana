'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * ============================================================
 *  SCORING — four cues, each with a distinct atmosphere.
 * ============================================================
 *  Everything here is background scoring for a portfolio, never a
 *  soundtrack that competes with the hero video or the hero copy.
 *  Levels are low on purpose and `hero` is the quietest scene on
 *  the site so the name and roles stay the primary experience.
 */

export type CueId = 'main-journey' | 'technology' | 'moments-of-joy' | 'final-journey';

export type SceneName = 'hero' | 'warm' | 'tech' | 'lift' | 'dark' | 'calm' | 'ending';

/** How a section should be scored. Serialised into `data-music`. */
export type Scene = {
  cue: CueId;
  /** target level, 0–1 */
  level: number;
  /** low-pass corner in Hz — how present the top end is */
  cutoff: number;
};

export const SCENES: Record<SceneName, Scene> = {
  /** hero / about / school — cinematic, warm, barely there */
  hero: { cue: 'main-journey', level: 0.15, cutoff: 16000 },
  warm: { cue: 'main-journey', level: 0.26, cutoff: 18000 },
  /** college → technology: electronic elements arrive gradually */
  tech: { cue: 'technology', level: 0.26, cutoff: 15000 },
  /** FaceRecognition AI — technical emphasis, opened up */
  lift: { cue: 'technology', level: 0.3, cutoff: 20000 },
  /** SecureClip — darker, tighter, more precise */
  dark: { cue: 'technology', level: 0.24, cutoff: 4200 },
  /** personal, human, calm */
  calm: { cue: 'moments-of-joy', level: 0.26, cutoff: 18000 },
  /** contact + final CTA — the journey settles rather than stopping */
  ending: { cue: 'final-journey', level: 0.24, cutoff: 13000 },
};

/** Crossfade window — 1–3 s per the brief; 2.4 s reads as a dissolve. */
const FADE_MS = 2400;

/** Start fetching a cue once its section is roughly a screen away. */
const PRELOAD_MARGIN = '70% 0px 70% 0px';

/** Section that wins when two scenes overlap on screen. */
const SCENE_RANK: Record<SceneName, number> = {
  hero: 0,
  warm: 1,
  calm: 2,
  tech: 3,
  lift: 4,
  dark: 5,
  ending: 6,
};

const SESSION_KEY = 'gk:audio';

/** Equal-power fade curves, sampled once. */
const FADE_IN = Array.from({ length: 65 }, (_, i) => Math.sin((i / 64) * (Math.PI / 2)));
const FADE_OUT = Array.from({ length: 65 }, (_, i) => Math.cos((i / 64) * (Math.PI / 2)));

type Slot = {
  el: HTMLAudioElement;
  /**
   * MediaElementAudioSourceNode. An element can only ever be bound to ONE of
   * these for the lifetime of the AudioContext — a second
   * `createMediaElementSource` call on the same element throws
   * InvalidStateError — so this is created once and then reused for every
   * cue the slot plays.
   */
  source: MediaElementAudioSourceNode | null;
  /** the gain node's AudioParam — where every fade is scheduled */
  param: AudioParam | null;
  filter: BiquadFilterNode | null;
  /** cue this element is currently pointed at */
  cue: CueId | null;
  /**
   * Pending "this slot has finished fading out, unload it" timer.
   *
   * This must live on the slot, not in a loose list: a slot retired by one
   * crossfade can be picked up as the *incoming* slot by the next crossfade
   * before the timer fires. Whichever happens first has to cancel the other,
   * otherwise the stale timer pauses a cue that is now the audible one and
   * the music dies mid-scroll.
   */
  retireTimer: number | null;
};

type MusicState = {
  /** the visitor asked for sound */
  enabled: boolean;
  /** sound is audible right now */
  playing: boolean;
  /** nothing has been heard yet — the ENABLE SOUND prompt applies.
   *  Sound only ever starts from the visitor pressing the control, which is
   *  also what browser autoplay policies require. Nothing is bypassed. */
  needsGesture: boolean;
  /** cue currently scoring, for the control label */
  cue: CueId | null;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
};

const MusicContext = createContext<MusicState | null>(null);

export function useMusic(): MusicState {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const enabledRef = useRef(false);
  const playingRef = useRef(false);
  const cueRef = useRef<CueId | null>(null);
  const sceneRef = useRef<SceneName>('hero');
  const activeRef = useRef(0);
  const slotsRef = useRef<Slot[]>([]);
  const ctxRef = useRef<AudioContext | null>(null);
  const releasedRef = useRef<number[]>([]);
  const mutedRef = useRef<boolean | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  // starts true so the server-rendered HTML already offers the prompt
  const [needsGesture, setNeedsGesture] = useState(true);
  const [cue, setCue] = useState<CueId | null>(null);

  const setPlayingState = useCallback((next: boolean) => {
    if (playingRef.current === next) return;
    playingRef.current = next;
    setPlaying(next);
  }, []);

  /* ---------------------------------------------------------------- */
  /* graph                                                            */
  /* ---------------------------------------------------------------- */

  /** Created lazily, on the first real gesture, as autoplay policies expect. */
  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    ctxRef.current = ctx;
    return ctx;
  }, []);

  /**
   * Silence a slot and unload its cue, but KEEP the audio graph wired up.
   * This is the hot path — it runs after every crossfade — so the filter and
   * gain nodes survive and the next cue reuses them.
   */
  const silence = useCallback((slot: Slot | undefined) => {
    if (!slot) return;
    // Any queued unload for this slot is now moot.
    if (slot.retireTimer !== null) {
      window.clearTimeout(slot.retireTimer);
      releasedRef.current = releasedRef.current.filter((id) => id !== slot.retireTimer);
      slot.retireTimer = null;
    }
    slot.param?.cancelScheduledValues(0);
    if (slot.param) slot.param.value = 0;
    slot.el.pause();
    slot.el.removeAttribute('src');
    slot.el.load();
    slot.cue = null;
  }, []);

  /** Full teardown — only on unmount, when the context is closing anyway. */
  const dispose = useCallback((slot: Slot) => {
    silence(slot);
    slot.filter?.disconnect();
    slot.source?.disconnect();
    slot.filter = null;
    slot.source = null;
    slot.param = null;
  }, [silence]);

  /** Point a slot at `cue`, wiring media → filter → gain on first use. */
  const load = useCallback(
    (slot: Slot, next: CueId) => {
      if (slot.cue === next) return;
      // Reclaiming a slot cancels its pending unload, so a rapid second
      // crossfade cannot have the first one silence the live cue.
      if (slot.retireTimer !== null) {
        window.clearTimeout(slot.retireTimer);
        releasedRef.current = releasedRef.current.filter((id) => id !== slot.retireTimer);
        slot.retireTimer = null;
      }
      const ctx = ensureContext();
      slot.el.pause();
      slot.el.src = `/audio/${next}.mp3`;
      slot.el.preload = 'auto';
      slot.el.loop = true;
      slot.el.volume = 1; // level lives on the gain node
      if (ctx && !slot.source) {
        const source = ctx.createMediaElementSource(slot.el);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = SCENES[sceneRef.current].cutoff;
        filter.Q.value = 0.4;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        source.connect(filter).connect(gain).connect(ctx.destination);
        slot.source = source;
        slot.filter = filter;
        slot.param = gain.gain;
      }
      slot.cue = next;
    },
    [ensureContext],
  );

  /** Fade a slot's gain along a curve. */
  const fadeGain = useCallback(
    (slot: Slot, curve: number[], seconds: number) => {
      const ctx = ctxRef.current;
      const param = slot.param;
      if (!ctx || !param) return;
      const now = ctx.currentTime;
      param.cancelScheduledValues(now);
      // sample from wherever the last curve left the gain
      param.setValueAtTime(param.value, now);
      param.setValueCurveAtTime(curve, now, seconds);
    },
    [],
  );

  

  /* ---------------------------------------------------------------- */
  /* transitions                                                      */
  /* ---------------------------------------------------------------- */

  /**
   * Dissolve into `scene`'s cue. Exactly one slot is ever audible and the
   * other is always at zero gain, so two tracks can never overlap.
   */
  const transition = useCallback(
    (nextCue: CueId, nextScene: SceneName) => {
      const ctx = ensureContext();
      if (ctx?.state === 'suspended') void ctx.resume().catch(() => undefined);

      const slots = slotsRef.current;
      if (slots.length < 2) return;
      const outgoing = slots[activeRef.current];
      const incoming = slots[1 - activeRef.current];

      // same cue: settle level + tone only, never restart the track
      if (cueRef.current === nextCue && outgoing.cue === nextCue) {
        const now = ctx?.currentTime ?? 0;
        if (outgoing.filter) {
          outgoing.filter.frequency.setTargetAtTime(SCENES[nextScene].cutoff, now, 0.8);
        }
        if (outgoing.param) {
          outgoing.param.cancelScheduledValues(now);
          outgoing.param.setTargetAtTime(SCENES[nextScene].level, now, 0.8);
        }
        return;
      }

      load(incoming, nextCue);
      if (incoming.filter) {
        incoming.filter.frequency.setValueAtTime(SCENES[nextScene].cutoff, ctx?.currentTime ?? 0);
      }

      const play = incoming.el.play();
      if (play && typeof play.catch === 'function') {
        play.catch(() => {
          // refused (policy, network, decode) — stay silent, never retry-loop
          silence(incoming);
          setPlayingState(false);
          setNeedsGesture(true);
        });
      }

      fadeGain(outgoing, FADE_OUT, FADE_MS / 1000);
      fadeGain(incoming, FADE_IN.map((v) => v * SCENES[nextScene].level), FADE_MS / 1000);

      const retired = outgoing;
      const nextActive = 1 - activeRef.current;
      // Bail out if this slot was reclaimed in the meantime.
      if (retired.retireTimer !== null) {
        window.clearTimeout(retired.retireTimer);
        releasedRef.current = releasedRef.current.filter((id) => id !== retired.retireTimer);
      }
      const timer = window.setTimeout(() => {
        releasedRef.current = releasedRef.current.filter((id) => id !== timer);
        retired.retireTimer = null;
        silence(retired);
      }, FADE_MS + 400);
      retired.retireTimer = timer;
      releasedRef.current.push(timer);

      activeRef.current = nextActive;
      cueRef.current = nextCue;
      setCue(nextCue);
      setPlayingState(true);
      setNeedsGesture(false);
    },
    [ensureContext, fadeGain, load, setPlayingState, silence],
  );

  /* ---------------------------------------------------------------- */
  /* lifecycle                                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    // Two slots, both silent at rest and attached to the document so they can
    // never be garbage collected mid-fade. Exactly one is ever audible.
    const mk = (index: number): Slot => {
      const el = document.createElement('audio');
      el.preload = 'none';
      el.loop = true;
      el.volume = 0;
      el.dataset.gkAudio = String(index);
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
      const slot: Slot = {
        el,
        source: null,
        param: null,
        filter: null,
        cue: null,
        retireTimer: null,
      };
      slotsRef.current.push(slot);
      return slot;
    };
    mk(0);
    mk(1);

    // Session memory: a visitor who turned sound off stays off for this tab.
    try {
      mutedRef.current = sessionStorage.getItem(SESSION_KEY) === 'off';
    } catch {
      mutedRef.current = null; // storage blocked — just stay opt-in
    }
    if (mutedRef.current) setNeedsGesture(false);
    else setNeedsGesture(true);

    return () => {
      releasedRef.current.forEach((id) => window.clearTimeout(id));
      releasedRef.current = [];
      slotsRef.current.forEach((slot) => {
        dispose(slot);
        slot.el.remove();
      });
      slotsRef.current = [];
      activeRef.current = 0;
      cueRef.current = null;
      playingRef.current = false;
      void ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    };
  }, [dispose]);

  /** Hide the tab → silence. Come back → restore, only if sound was asked for. */
  useEffect(() => {
    const onVisibility = () => {
      const slots = slotsRef.current;
      const current = slots[activeRef.current];
      const idle = slots[1 - activeRef.current];
      if (!current) return;
      if (document.hidden) {
        current.el.pause();
        if (current.param) {
          current.param.cancelScheduledValues(0);
          current.param.value = 0;
        }
        setPlayingState(false);
      } else if (enabledRef.current) {
        void current.el.play().then(() => {
          if (current.param) fadeGain(current, FADE_IN.map((v) => v * SCENES[sceneRef.current].level), 1.6);
          setPlayingState(true);
        }).catch(() => setNeedsGesture(true));
        idle?.el.pause();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [fadeGain, setPlayingState]);

  /* ---------------------------------------------------------------- */
  /* section observation                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-music]'));
    if (!nodes.length) return;

    const sceneNameOf = (el: HTMLElement): SceneName =>
      (el.dataset.music as SceneName) ?? 'warm';
    const rank = (el: HTMLElement) => SCENE_RANK[sceneNameOf(el)] ?? 1;

    // Warm the cache as a section approaches. Loading lands on the idle slot,
    // so at most one upcoming cue is ever in flight and the audible one is
    // never interrupted.
    const warmer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const scene = SCENES[sceneNameOf(entry.target as HTMLElement)];
          if (cueRef.current === scene.cue) return;
          const idle = slotsRef.current[1 - activeRef.current];
          if (idle && idle.cue !== scene.cue && !idle.el.currentSrc) load(idle, scene.cue);
        });
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    // Which cue owns the soundtrack right now. Deepest scene wins, so a
    // single project can override the section it sits inside.
    const chooser = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement);
        if (!visible.length) return;
        const winner = visible.sort((a, b) => rank(b) - rank(a))[0];
        const name = sceneNameOf(winner);
        sceneRef.current = name;
        const scene = SCENES[name];
        if (!enabledRef.current) return;
        transition(scene.cue, name);
      },
      { rootMargin: '-30% 0px -45% 0px' },
    );

    nodes.forEach((n) => {
      warmer.observe(n);
      chooser.observe(n);
    });
    return () => {
      warmer.disconnect();
      chooser.disconnect();
    };
  }, [load, transition]);

  /* ---------------------------------------------------------------- */
  /* enable / disable                                                 */
  /* ---------------------------------------------------------------- */

  const start = useCallback(() => {
    enabledRef.current = true;
    setEnabled(true);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage blocked — the choice simply does not persist */
    }
    const scene = SCENES[sceneRef.current];
    transition(scene.cue, sceneRef.current);
  }, [transition]);

  const stop = useCallback(() => {
    enabledRef.current = false;
    setEnabled(false);
    setNeedsGesture(false);
    try {
      sessionStorage.setItem(SESSION_KEY, 'off');
    } catch {
      /* ignore */
    }
    const slots = slotsRef.current;
    const current = slots[activeRef.current];
    const idle = slots[1 - activeRef.current];
    if (current) fadeGain(current, FADE_OUT, 0.7);
    silence(idle);
    const timer = window.setTimeout(() => {
      releasedRef.current = releasedRef.current.filter((id) => id !== timer);
      if (enabledRef.current) return;
      silence(current);
      cueRef.current = null;
      setPlayingState(false);
    }, 800);
    releasedRef.current.push(timer);
  }, [fadeGain, setPlayingState, silence]);

  const toggle = useCallback(() => {
    if (enabledRef.current) stop();
    else start();
  }, [start, stop]);


  const value = useMemo<MusicState>(
    () => ({ enabled, playing, needsGesture, cue, toggle, enable: start, disable: stop }),
    [enabled, playing, needsGesture, cue, toggle, start, stop],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}