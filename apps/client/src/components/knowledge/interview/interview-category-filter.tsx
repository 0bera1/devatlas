'use client';

import type { InterviewPrepCategory } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

interface InterviewCategoryFilterProps {
  readonly categories: readonly InterviewPrepCategory[];
  readonly selected: InterviewPrepCategory | null;
  readonly onChange: (category: InterviewPrepCategory | null) => void;
}

export function InterviewCategoryFilter({
  categories,
  selected,
  onChange,
}: InterviewCategoryFilterProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={t('knowledge.interview.categoryFilter')}
    >
      <button
        type="button"
        role="tab"
        aria-selected={selected === null}
        onClick={(): void => onChange(null)}
        className={
          selected === null
            ? 'rounded-full bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)]'
            : 'rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)]'
        }
      >
        {t('knowledge.interview.allCategories')}
      </button>
      {categories.map((category: InterviewPrepCategory) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={selected === category}
          onClick={(): void => onChange(category)}
          className={
            selected === category
              ? 'rounded-full bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)]'
              : 'rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface)]'
          }
        >
          {categoryLabel(category)}
        </button>
      ))}
    </div>
  );
}
