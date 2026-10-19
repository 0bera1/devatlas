'use client';

import { useSyncExternalStore } from 'react';

const QUERY: string = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const media: MediaQueryList = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => {
    media.removeEventListener('change', onChange);
  };
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Sunucu tarafında hareket azaltma kapalı varsayılır; istemcide tercih okunur. */
function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
