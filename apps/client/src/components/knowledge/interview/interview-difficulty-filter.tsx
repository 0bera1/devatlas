'use client';

import type { InterviewPrepDifficulty } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepDifficultyLabel } from '@/hooks/knowledge/use-interview-prep-difficulty-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { INTERVIEW_DIFFICULTY_OPTIONS } from '@/lib/knowledge/interview-difficulty-storage';
import type { ReactNode } from 'react';

interface InterviewDifficultyFilterProps {
  readonly selected: InterviewPrepDifficulty | null;
  readonly onChange: (difficulty: InterviewPrepDifficulty | null) => void;
}

export function InterviewDifficultyFilter({
  selected,
  onChange,
}: InterviewDifficultyFilterProps): ReactNode {
  const { t } = useTranslations();
  const difficultyLabel = useInterviewPrepDifficultyLabel();

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={t('knowledge.interview.difficultyFilter')}
    >
      <button
        type="button"
        role="tab"
        aria-selected={selected === null}
        onClick={(): void => onChange(null)}
        className={
          selected === null
            ? 'rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white dark:bg-indigo-500'
            : 'rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)]'
        }
      >
        {t('knowledge.interview.allDifficulties')}
      </button>
      {INTERVIEW_DIFFICULTY_OPTIONS.map(
        (difficulty: InterviewPrepDifficulty) => (
          <button
            key={difficulty}
            type="button"
            role="tab"
            aria-selected={selected === difficulty}
            onClick={(): void => onChange(difficulty)}
            className={
              selected === difficulty
                ? 'rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white dark:bg-indigo-500'
                : 'rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)]'
            }
          >
            {difficultyLabel(difficulty)}
          </button>
        ),
      )}
    </div>
  );
}
