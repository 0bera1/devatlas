'use client';

import { useSceneStore } from '@/store/useSceneStore';

export function useScrollProgress(): number {
  return useSceneStore((state) => state.progress);
}
