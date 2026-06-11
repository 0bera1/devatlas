'use client';

import type { InterviewPrepDifficulty } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepDifficultyLabel } from '@/hooks/knowledge/use-interview-prep-difficulty-label';
import { isInterviewPrepDifficulty } from '@/lib/knowledge/interview-difficulty-storage';
import type { ReactNode } from 'react';

export interface InterviewDifficultyBadgeProps {
  readonly difficulty: string | null;
}

function pickClassName(difficulty: InterviewPrepDifficulty): string {
  switch (difficulty) {
    case 'EASY':
      return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
    case 'HARD':
      return 'bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-200';
    case 'EXPERT':
      return 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200';
    default: {
      const _exhaustive: never = difficulty;
      return _exhaustive;
    }
  }
}

export function InterviewDifficultyBadge({
  difficulty,
}: InterviewDifficultyBadgeProps): ReactNode {
  const difficultyLabel = useInterviewPrepDifficultyLabel();

  if (difficulty === null || !isInterviewPrepDifficulty(difficulty)) {
    return null;
  }

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${pickClassName(difficulty)}`}
    >
      {difficultyLabel(difficulty)}
    </span>
  );
}
