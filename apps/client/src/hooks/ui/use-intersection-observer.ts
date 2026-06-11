'use client';

import { useEffect, useRef, type RefObject } from 'react';

export interface UseIntersectionObserverOptions {
  readonly enabled: boolean;
  readonly onIntersect: () => void;
  readonly rootMargin?: string;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions,
): RefObject<HTMLDivElement | null> {
  const { enabled, onIntersect, rootMargin = '200px' } = options;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const element: HTMLDivElement | null = sentinelRef.current;
    if (!enabled || element === null) {
      return;
    }

    const observer: IntersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const entry: IntersectionObserverEntry | undefined = entries[0];
        if (entry?.isIntersecting === true) {
          onIntersectRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return (): void => {
      observer.disconnect();
    };
  }, [enabled, rootMargin]);

  return sentinelRef;
}
