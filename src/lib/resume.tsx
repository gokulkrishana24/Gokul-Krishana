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
import { resumeConfig } from '@/data/content';

/**
 * ============================================================
 *  RESUME FLOW — one controlled system, two separate actions.
 * ============================================================
 *
 * The single rule this module exists to guarantee:
 *
 *   THE RESUME IS PASSIVE UNTIL THE VISITOR ASKS FOR IT.
 *
 * Nothing in here runs on mount, on route change, on video load or
 * on video end. There is no effect that can download or open the
 * file. The only two paths to the PDF are:
 *
 *   view()     -> opens the viewer (which itself never auto-fetches)
 *   download() -> runs the loading overlay, then hands the browser a
 *                 real <a download> click
 *
 * `download()` is the ONLY caller of the anchor click in the entire
 * app, and it is only ever reached from a click handler.
 */

const HERO_KEY = 'gk:hero-complete';
const DOWNLOAD_KEY = 'gk:resume-downloaded';

type ResumeState = {
  /** the visitor has seen the hero play through this session */
  heroCompleted: boolean;
  /** the premium viewer should be open */
  viewOpen: boolean;
  /** the cinematic hero.mp4 loading page should be showing */
  preparing: boolean;
  /**
   * What the loading page is leading to. Both resume actions pass through
   * hero.mp4 before anything is revealed or saved, so the reveal happens
   * on the visitor's terms rather than the instant they click.
   */
  introFor: 'view' | 'download' | null;
  /** 0..1 progress of the preparation */
  progress: number;
  /** true once hero.mp4 has finished playing */
  videoDone: boolean;
  /** true once the file has actually been handed to the browser */
  downloaded: boolean;
  /** ref the overlay attaches its <video> to */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** the overlay calls this when the clip ends or fails */
  notifyVideoEnd: () => void;
  /** open the viewer (behind the hero.mp4 loading page) — never downloads */
  view: () => void;
  closeView: () => void;
  /** explicit DOWNLOAD RESUME (behind the hero.mp4 loading page) — the only path to the file */
  download: () => void;
  /** called by the hero/intro when it finishes playing */
  completeHero: () => void;
};

const ResumeContext = createContext<ResumeState | null>(null);

export function useResume(): ResumeState {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used inside <ResumeProvider>');
  return ctx;
}

/**
 * Fallback ceiling for the preparation sequence.
 *
 * The download is driven by hero.mp4 actually finishing. If the video
 * cannot load, decode or play — poor connection, autoplay refusal, codec
 * the device won't decode — this timer releases the download anyway, so
 * a visitor is never trapped behind a loading screen that cannot end.
 */
const PREP_FALLBACK_MS = 6000;

/** Minimum time the overlay stays up, so the beat reads as intentional. */
const PREP_MIN_MS = 1200;

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [heroCompleted, setHeroCompleted] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  /** which action the hero.mp4 loading page is leading to */
  const [introFor, setIntroFor] = useState<'view' | 'download' | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  /** true once hero.mp4 has finished — drives the RESUME READY state */
  const [videoDone, setVideoDone] = useState(false);

  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const timersRef = useRef<number[]>([]);
  /** the <video> the overlay mounts for the download sequence */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /** callback the overlay invokes when the clip finishes or fails */
  const onVideoEndRef = useRef<(() => void) | null>(null);

  /**
   * Handed to the overlay so it can report that the clip finished.
   * A ref, not state: this is a one-shot signal, and routing it through
   * state would re-render the provider mid-sequence.
   */
  const setVideoSignal = useCallback((fn: (() => void) | null) => {
    onVideoEndRef.current = fn;
  }, []);

  /** Called by the overlay's <video> on ended / error. */
  const notifyVideoEnd = useCallback(() => {
    onVideoEndRef.current?.();
  }, []);

  /* ---------------------------------------------------------------- */
  /* session memory                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const read = (k: string) => {
      try {
        return sessionStorage.getItem(k);
      } catch {
        return null;
      }
    };
    setHeroCompleted(read(HERO_KEY) === '1');
    setDownloaded(read(DOWNLOAD_KEY) === '1');

    return () => {
      timersRef.current.forEach((id) => window.clearInterval(id));
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      onVideoEndRef.current = null;
    };
  }, []);

  const write = useCallback((k: string, v: string) => {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      /* storage blocked — the choice simply does not persist */
    }
  }, []);

  /**
   * Called when the hero finishes. Records that the intro has played so a
   * later DOWNLOAD RESUME never forces the visitor to sit through it again.
   * Deliberately does nothing else — no navigation, no file access.
   */
  const completeHero = useCallback(() => {
    setHeroCompleted((done) => {
      if (!done) write(HERO_KEY, '1');
      return true;
    });
  }, [write]);

  const closeView = useCallback(() => setViewOpen(false), []);

  /* ---------------------------------------------------------------- */
  /* the shared hero.mp4 loading page                                  */
  /* ---------------------------------------------------------------- */

  /**
   * Runs hero.mp4 as a full-screen loading page and then performs the
   * requested action.
   *
   * Both VIEW RESUME and DOWNLOAD RESUME go through here, so the reveal
   * is always paced by the clip instead of snapping open. Crucially the
   * viewer is only opened AFTER the loading page finishes — nothing is
   * opened or saved at any earlier point, and the fallback timer means a
   * clip that cannot play still resolves rather than hanging.
   */
  const runIntro = useCallback((mode: 'view' | 'download') => {
    if (preparing) return;
    setPreparing(true);
    setIntroFor(mode);
    setProgress(0);
    setVideoDone(false);

    const started = performance.now();
    let finished = false;

    /** Performs the action and dismisses the loading page. */
    const release = () => {
      if (finished) return;
      finished = true;

      window.clearInterval(progressTimer);
      window.clearTimeout(fallbackTimer);
      timersRef.current = timersRef.current.filter((id) => id !== progressTimer && id !== fallbackTimer);

      if (mode === 'download') {
        const anchor = anchorRef.current;
        if (anchor) {
          write(DOWNLOAD_KEY, '1');
          setDownloaded(true);
          anchor.click();
        }
      } else {
        // VIEW: reveal the document. This still never downloads.
        setViewOpen(true);
      }

      const t = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter((id) => id !== t);
        setPreparing(false);
        setIntroFor(null);
        setProgress(0);
      }, 500);
      timersRef.current.push(t);
    };

    /** The happy path: hero.mp4 finished playing. */
    const onVideoEnd = () => {
      if (finished) return;
      const elapsed = performance.now() - started;
      const wait = Math.max(0, PREP_MIN_MS - elapsed);
      const t1 = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter((id) => id !== t1);
        setProgress(1);
        setVideoDone(true);
        // Let the "READY" state register before revealing/saving.
        const t2 = window.setTimeout(() => {
          timersRef.current = timersRef.current.filter((id) => id !== t2);
          release();
        }, 450);
        timersRef.current.push(t2);
      }, wait);
      timersRef.current.push(t1);
    };

    // Progress follows the real video, not a fake timer.
    const progressTimer = window.setInterval(() => {
      const v = videoRef.current;
      if (v && v.duration > 0) setProgress(Math.min(1, v.currentTime / v.duration));
    }, 80);
    timersRef.current.push(progressTimer);

    // The safety net: never leave anyone stuck.
    const fallbackTimer = window.setTimeout(release, PREP_FALLBACK_MS);
    timersRef.current.push(fallbackTimer);

    setVideoSignal(onVideoEnd);
  }, [preparing, write, setVideoSignal]);

  const view = useCallback(() => runIntro('view'), [runIntro]);
  const download = useCallback(() => runIntro('download'), [runIntro]);

  const value = useMemo<ResumeState>(
    () => ({
      heroCompleted,
      viewOpen,
      preparing,
      introFor,
      progress,
      videoDone,
      downloaded,
      videoRef,
      notifyVideoEnd,
      view,
      closeView,
      download,
      completeHero,
    }),
    [
      heroCompleted,
      viewOpen,
      preparing,
      introFor,
      progress,
      videoDone,
      downloaded,
      notifyVideoEnd,
      view,
      closeView,
      download,
      completeHero,
    ],
  );

  return (
    <ResumeContext.Provider value={value}>
      {children}

      {/*
        The real download target. It is never clicked by anything except
        download() above, it is not in the tab order, and it is hidden
        from assistive tech so it cannot be triggered without sight of
        the labelled buttons.
      */}
      <a
        ref={anchorRef}
        href={resumeConfig.pdf}
        download={resumeConfig.pdfName}
        rel="noopener"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none fixed left-0 top-0 h-0 w-0 opacity-0"
        data-gk-resume-download=""
      >
        DOWNLOAD RESUME
      </a>
    </ResumeContext.Provider>
  );
}