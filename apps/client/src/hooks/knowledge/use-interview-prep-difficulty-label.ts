'use client';

import type { InterviewPrepDifficulty } from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useCallback } from 'react';

export function useInterviewPrepDifficultyLabel(): (
  difficulty: InterviewPrepDifficulty,
) => string {
  const { t } = useTranslations();

  return useCallback(
    (difficulty: InterviewPrepDifficulty): string => {
      switch (difficulty) {
        case 'EASY':
          return t('knowledge.interview.difficulty.easy');
        case 'MEDIUM':
          return t('knowledge.interview.difficulty.medium');
        case 'HARD':
          return t('knowledge.interview.difficulty.hard');
        case 'EXPERT':
          return t('knowledge.interview.difficulty.expert');
        default: {
          const _exhaustive: never = difficulty;
          return _exhaustive;
        }
      }
    },
    [t],
  );
}
