'use client';

import type { InterviewPrepDifficulty } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepDifficultyLabel } from '@/hooks/knowledge/use-interview-prep-difficulty-label';
import { isInterviewPrepDifficulty } from '@/lib/knowledge/interview-difficulty-storage';
import type { ReactNode } from 'react';

export interface InterviewDifficultyBadgeProps {
  readonly difficulty: string | null;
}

/** Zorluk metnin rengiyle anlatılır: kolay yeşil, orta nötr, zor ve uzman kırmızı. */
function pickClassName(difficulty: InterviewPrepDifficulty): string {
  switch (difficulty) {
    case 'EASY':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'MEDIUM':
      return 'text-[var(--muted)]';
    case 'HARD':
      return 'text-red-700 dark:text-red-400';
    case 'EXPERT':
      return 'font-semibold text-red-800 dark:text-red-300';
    default: {
      const _exhaustive: never = difficulty;
      return _exhaustive;
    }
  }
}

export function InterviewDifficultyBadge({ difficulty }: InterviewDifficultyBadgeProps): ReactNode {
  const difficultyLabel = useInterviewPrepDifficultyLabel();

  if (difficulty === null || !isInterviewPrepDifficulty(difficulty)) {
    return null;
  }

  return <span className={`text-sm ${pickClassName(difficulty)}`}>{difficultyLabel(difficulty)}</span>;
}
