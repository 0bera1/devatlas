'use client';

import type { ReactNode } from 'react';

export interface InterviewQuestionTagChipProps {
  readonly tag: string;
  readonly highlighted: boolean;
}

export function InterviewQuestionTagChip({
  tag,
  highlighted,
}: InterviewQuestionTagChipProps): ReactNode {
  return (
    <span
      className={
        highlighted
          ? 'rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-900 dark:bg-violet-950/50 dark:text-violet-200'
          : 'rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
      }
    >
      #{tag}
    </span>
  );
}
