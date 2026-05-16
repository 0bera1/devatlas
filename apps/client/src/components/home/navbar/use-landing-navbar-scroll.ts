'use client';

import { useEffect, useState } from 'react';

/** Bu değerin üstünde “sıkışmış” navbar’a geçilir */
const EXPAND_SCROLL_PX = 100;
/** Bir kez sıkıştıktan sonra tekrar genişlemek için daha yukarı çıkılması gerekir (titreme önleme) */
const COLLAPSE_SCROLL_PX = 48;

/**
 * Scroll ile navbar modu. rAF ile tek karede okuma + histerezis ile eşik titremesi azaltılır.
 */
export function useLandingNavbarScroll(): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let rafId: number = 0;

    const apply = (): void => {
      rafId = 0;
      const y: number = window.scrollY;
      setIsScrolled((prev: boolean): boolean =>
        prev ? y > COLLAPSE_SCROLL_PX : y > EXPAND_SCROLL_PX,
      );
    };

    const onScroll = (): void => {
      if (rafId !== 0) {
        return;
      }
      rafId = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });

    return (): void => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return isScrolled;
}
