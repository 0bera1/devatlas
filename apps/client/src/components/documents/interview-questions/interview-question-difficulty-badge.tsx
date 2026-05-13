'use client';

import type { ReactNode } from 'react';

export interface InterviewQuestionDifficultyBadgeProps {
  readonly difficulty: string | null;
}

function pickClassName(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200';
    case 'medium':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
    case 'hard':
      return 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200';
    default:
      return 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
  }
}

export function InterviewQuestionDifficultyBadge({
  difficulty,
}: InterviewQuestionDifficultyBadgeProps): ReactNode {
  if (difficulty === null || difficulty.length === 0) {
    return null;
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${pickClassName(difficulty)}`}
    >
      {difficulty}
    </span>
  );
}
