'use client';

import { LandingScrollHint } from '@/components/home/landing-scroll-hint';
import { SceneFooter } from '@/components/ui/SceneFooter';
import { useLandingCinematicScroll } from '@/hooks/home/use-landing-cinematic-scroll';
import { initScroll } from '@/lib/scroll';
import { useSceneStore } from '@/store/useSceneStore';
import { useEffect, useState, type ReactNode } from 'react';

import 'lenis/dist/lenis.css';

interface SceneControllerProps {
  readonly children: ReactNode;
}

/**
 * Scroll motoru + uzun sahne sürücüsü; çocuklar `fixed` sahne içeriği.
 */
export function SceneController(props: SceneControllerProps): ReactNode {
  const { children } = props;
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useLandingCinematicScroll();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media: MediaQueryList = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const update = (): void => {
      setReducedMotion(media.matches);
    };
    update();
    media.addEventListener('change', update);
    return (): void => {
      media.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const controller = initScroll((progress: number) => {
      useSceneStore.getState().setProgress(progress);
    }, { reducedMotion });

    return (): void => {
      controller.destroy();
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div
        className="relative z-10 h-[520vh] w-full shrink-0 pointer-events-none"
        aria-hidden
      />
      <div className="fixed inset-0 z-0 overflow-hidden">{children}</div>
      <LandingScrollHint />
      <SceneFooter />
    </div>
  );
}
