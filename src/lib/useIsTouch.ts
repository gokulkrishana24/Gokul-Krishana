'use client';

import { useEffect, useState } from 'react';

/** True on touch / coarse-pointer devices (custom cursor is disabled there). */
export function useIsTouch() {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return touch;
}

/**
 * True on iOS/iPadOS Safari (including iPadOS, which reports itself as
 * Macintosh — hence the maxTouchPoints check).
 *
 * Why this matters: iOS Safari will NOT render a PDF inside an <iframe>.
 * It discards the frame and navigates to the file, handing it to the
 * native full-screen PDF viewer. An in-page resume viewer is therefore
 * impossible on iOS, and mounting the iframe makes the PDF seize the
 * whole screen — which is exactly the "a PDF opened full-screen without
 * me asking" symptom. Callers must avoid mounting the iframe there and
 * offer an explicit tap-to-open affordance instead.
 */
export function useIsIOS() {
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const nav = window.navigator;
    const isIOS =
      /iPad|iPhone|iPod/.test(nav.userAgent) ||
      // iPadOS 13+ masquerades as desktop Safari
      (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
    setIos(isIOS);
  }, []);

  return ios;
}

/** True when the user prefers reduced motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}
