'use client';

import type { ReactNode } from 'react';

const SKELETON_ROW_IDS: readonly string[] = ['row-1', 'row-2', 'row-3'];

export function IntelligenceSkeleton(): ReactNode {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {SKELETON_ROW_IDS.map((id: string) => (
        <li
          key={id}
          className="h-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
        />
      ))}
    </ul>
  );
}
