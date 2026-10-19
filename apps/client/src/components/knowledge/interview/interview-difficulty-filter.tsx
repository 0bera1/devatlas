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

/** Zorluk çipleri: seçili olan koyu çerçeveli ve kalın. Seçili çipe tekrar basmak filtreyi kaldırır. */
export function InterviewDifficultyFilter({ selected, onChange }: InterviewDifficultyFilterProps): ReactNode {
  const { t } = useTranslations();
  const difficultyLabel = useInterviewPrepDifficultyLabel();

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">{t('knowledge.table.difficulty')}</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('knowledge.interview.difficultyFilter')}>
        {INTERVIEW_DIFFICULTY_OPTIONS.map((difficulty: InterviewPrepDifficulty) => {
          const active: boolean = selected === difficulty;
          return (
            <button
              key={difficulty}
              type="button"
              aria-pressed={active}
              onClick={(): void => onChange(active ? null : difficulty)}
              className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
                active ? 'border-[var(--foreground)] font-semibold text-[var(--foreground)]' : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--muted)]'
              }`}
            >
              {difficultyLabel(difficulty)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
