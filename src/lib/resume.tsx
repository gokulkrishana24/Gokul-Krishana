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
  /** the "PREPARING RESUME" overlay should be showing */
  preparing: boolean;
  /** 0..1 progress of the preparation */
  progress: number;
  /** true once the file has actually been handed to the browser */
  downloaded: boolean;
  /** open the viewer — never downloads, never auto-fetches */
  view: () => void;
  closeView: () => void;
  /** explicit DOWNLOAD RESUME — the only path to the file */
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

/** How long the preparation overlay holds before the download fires. */
const PREP_MS = 1400;

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [heroCompleted, setHeroCompleted] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const timersRef = useRef<number[]>([]);

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

  const view = useCallback(() => setViewOpen(true), []);
  const closeView = useCallback(() => setViewOpen(false), []);

  /* ---------------------------------------------------------------- */
  /* the one and only download path                                    */
  /* ---------------------------------------------------------------- */

  const download = useCallback(() => {
    if (preparing) return;
    setPreparing(true);
    setProgress(0);

    // Ramp the bar, then fire. The anchor click happens inside a timer
    // that is only ever created from this click handler.
    const started = performance.now();
    const interval = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - started) / PREP_MS);
      setProgress(t);
      if (t >= 1) {
        window.clearInterval(interval);
        timersRef.current = timersRef.current.filter((id) => id !== interval);

        const anchor = anchorRef.current;
        if (anchor) {
          write(DOWNLOAD_KEY, '1');
          setDownloaded(true);
          anchor.click();
        }
        window.setTimeout(() => {
          setPreparing(false);
          setProgress(0);
        }, 700);
      }
    }, 60);
    timersRef.current.push(interval);
  }, [preparing, write]);

  const value = useMemo<ResumeState>(
    () => ({
      heroCompleted,
      viewOpen,
      preparing,
      progress,
      downloaded,
      view,
      closeView,
      download,
      completeHero,
    }),
    [heroCompleted, viewOpen, preparing, progress, downloaded, view, closeView, download, completeHero],
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