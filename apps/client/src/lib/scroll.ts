import Lenis from 'lenis';
import { gsap } from 'gsap';

export interface InitScrollOptions {
  readonly reducedMotion: boolean;
}

export interface ScrollController {
  readonly lenis: Lenis;
  readonly destroy: () => void;
}

/**
 * Lenis + GSAP ticker; progress = animatedScroll / limit
 */
export function initScroll(
  onUpdate: (progress: number) => void,
  options: InitScrollOptions,
): ScrollController {
  const { reducedMotion } = options;

  const lenis: Lenis = new Lenis({
    smoothWheel: true,
    lerp: reducedMotion ? 1 : 0.08,
    autoRaf: false,
    wrapper: window,
    content: document.documentElement,
  });

  const emitProgress = (): void => {
    const max: number = lenis.limit;
    const raw: number = max > 0.5 ? lenis.animatedScroll / max : 0;
    const progress: number = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    onUpdate(progress);
  };

  lenis.on('scroll', emitProgress);
  emitProgress();

  const tick = (time: number): void => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const destroy = (): void => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };

  return { lenis, destroy };
}
