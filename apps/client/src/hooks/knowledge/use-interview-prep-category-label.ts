'use client';

import type { InterviewPrepCategory } from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useCallback } from 'react';

export function useInterviewPrepCategoryLabel(): (
  category: InterviewPrepCategory,
) => string {
  const { t } = useTranslations();

  return useCallback(
    (category: InterviewPrepCategory): string => {
      switch (category) {
        case 'FRONTEND':
          return t('knowledge.interview.category.frontend');
        case 'BACKEND':
          return t('knowledge.interview.category.backend');
        case 'DEVOPS':
          return t('knowledge.interview.category.devops');
        case 'ARCHITECTURE':
          return t('knowledge.interview.category.architecture');
        case 'GENERAL':
          return t('knowledge.interview.category.general');
        default: {
          const _exhaustive: never = category;
          return _exhaustive;
        }
      }
    },
    [t],
  );
}
