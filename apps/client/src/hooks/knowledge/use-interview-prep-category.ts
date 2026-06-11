'use client';

import type { InterviewPrepCategory } from '@/domains/knowledge/knowledgeDomains';
import {
  isInterviewPrepCategory,
  readStoredInterviewCategory,
  writeStoredInterviewCategory,
} from '@/lib/knowledge/interview-category-storage';
import { isInterviewPrepDifficulty } from '@/lib/knowledge/interview-difficulty-storage';
import { buildKnowledgeBaseHref } from '@/lib/knowledge/knowledge-section-storage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface UseInterviewPrepCategoryResult {
  readonly category: InterviewPrepCategory | null;
  readonly setCategory: (category: InterviewPrepCategory | null) => void;
}

export function useInterviewPrepCategory(): UseInterviewPrepCategoryResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategoryState] = useState<InterviewPrepCategory | null>(
    null,
  );

  useEffect(() => {
    const fromUrl: string | null = searchParams.get('category');
    if (isInterviewPrepCategory(fromUrl)) {
      setCategoryState(fromUrl);
      writeStoredInterviewCategory(fromUrl);
      return;
    }

    const stored: InterviewPrepCategory | null = readStoredInterviewCategory();
    setCategoryState(stored);

    if (stored !== null) {
      const difficultyFromUrl: string | null = searchParams.get('difficulty');
      router.replace(
        buildKnowledgeBaseHref('interview', {
          interviewCategory: stored,
          useStoredInterviewCategory: false,
          interviewDifficulty: isInterviewPrepDifficulty(difficultyFromUrl)
            ? difficultyFromUrl
            : undefined,
          useStoredInterviewDifficulty: !isInterviewPrepDifficulty(
            difficultyFromUrl,
          ),
        }),
        { scroll: false },
      );
    }
  }, [searchParams, router]);

  const setCategory = useCallback(
    (next: InterviewPrepCategory | null): void => {
      setCategoryState(next);
      writeStoredInterviewCategory(next);
      const difficultyFromUrl: string | null = searchParams.get('difficulty');
      router.replace(
        buildKnowledgeBaseHref('interview', {
          interviewCategory: next,
          useStoredInterviewCategory: false,
          interviewDifficulty: isInterviewPrepDifficulty(difficultyFromUrl)
            ? difficultyFromUrl
            : undefined,
          useStoredInterviewDifficulty: !isInterviewPrepDifficulty(
            difficultyFromUrl,
          ),
        }),
        { scroll: false },
      );
    },
    [router, searchParams],
  );

  return { category, setCategory };
}
