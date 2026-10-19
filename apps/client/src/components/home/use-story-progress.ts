'use client';

import { clamp01 } from '@/lib/landing/story-timeline';
import { useEffect, useState, type RefObject } from 'react';

/**
 * Bir kaydırma alanının sayfadaki ilerlemesini (0 ile 1) döndürür. Alan sabit sahneyi taşır; ilerleme,
 * alanın üst kenarı sayfadan yukarı çıktıkça artar. Güncellemeler kare başına bir kez yapılır.
 */
export function useStoryProgress(trackRef: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let frame: number | null = null;

    const measure = (): void => {
      frame = null;
      const element: HTMLElement | null = trackRef.current;
      if (element === null) {
        return;
      }
      const scrollable: number = element.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      setProgress(clamp01(-element.getBoundingClientRect().top / scrollable));
    };

    const schedule = (): void => {
      if (frame === null) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    // İlk ölçüm bir kare sonra yapılır; effect içinde senkron setState kullanılmaz.
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [trackRef]);

  return progress;
}
