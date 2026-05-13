'use client';

import type { ReactNode } from 'react';

export function InterviewQuestionsSkeleton(): ReactNode {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {[0, 1, 2].map((index: number) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900/60"
        />
      ))}
    </div>
  );
}
