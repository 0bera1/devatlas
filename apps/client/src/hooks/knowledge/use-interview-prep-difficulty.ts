'use client';

import type { InterviewPrepDifficulty } from '@/domains/knowledge/knowledgeDomains';
import { isInterviewPrepCategory } from '@/lib/knowledge/interview-category-storage';
import {
  isInterviewPrepDifficulty,
  readStoredInterviewDifficulty,
  writeStoredInterviewDifficulty,
} from '@/lib/knowledge/interview-difficulty-storage';
import { buildKnowledgeBaseHref } from '@/lib/knowledge/knowledge-section-storage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface UseInterviewPrepDifficultyResult {
  readonly difficulty: InterviewPrepDifficulty | null;
  readonly setDifficulty: (difficulty: InterviewPrepDifficulty | null) => void;
}

export function useInterviewPrepDifficulty(): UseInterviewPrepDifficultyResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [difficulty, setDifficultyState] = useState<InterviewPrepDifficulty | null>(
    null,
  );

  useEffect(() => {
    const fromUrl: string | null = searchParams.get('difficulty');
    if (isInterviewPrepDifficulty(fromUrl)) {
      setDifficultyState(fromUrl);
      writeStoredInterviewDifficulty(fromUrl);
      return;
    }

    const stored: InterviewPrepDifficulty | null =
      readStoredInterviewDifficulty();
    setDifficultyState(stored);

    if (stored !== null) {
      const categoryFromUrl: string | null = searchParams.get('category');
      router.replace(
        buildKnowledgeBaseHref('interview', {
          interviewDifficulty: stored,
          useStoredInterviewDifficulty: false,
          interviewCategory: isInterviewPrepCategory(categoryFromUrl)
            ? categoryFromUrl
            : undefined,
          useStoredInterviewCategory: !isInterviewPrepCategory(categoryFromUrl),
        }),
        { scroll: false },
      );
    }
  }, [searchParams, router]);

  const setDifficulty = useCallback(
    (next: InterviewPrepDifficulty | null): void => {
      setDifficultyState(next);
      writeStoredInterviewDifficulty(next);
      const categoryFromUrl: string | null = searchParams.get('category');
      router.replace(
        buildKnowledgeBaseHref('interview', {
          interviewDifficulty: next,
          useStoredInterviewDifficulty: false,
          interviewCategory: isInterviewPrepCategory(categoryFromUrl)
            ? categoryFromUrl
            : undefined,
          useStoredInterviewCategory: !isInterviewPrepCategory(categoryFromUrl),
        }),
        { scroll: false },
      );
    },
    [router, searchParams],
  );

  return { difficulty, setDifficulty };
}
