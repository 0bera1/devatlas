'use client';

import { useEffect } from 'react';

const LANDING_CINEMATIC_SCROLL_CLASS = 'landing-cinematic-scroll';

export function useLandingCinematicScroll(): void {
  useEffect(() => {
    const root: HTMLElement = document.documentElement;
    root.classList.add(LANDING_CINEMATIC_SCROLL_CLASS);
    return (): void => {
      root.classList.remove(LANDING_CINEMATIC_SCROLL_CLASS);
    };
  }, []);
}
