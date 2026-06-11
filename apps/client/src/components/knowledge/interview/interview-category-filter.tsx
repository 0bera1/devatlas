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
            ? 'rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900'
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
              ? 'rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900'
          }
        >
          {categoryLabel(category)}
        </button>
      ))}
    </div>
  );
}
