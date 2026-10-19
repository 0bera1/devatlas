'use client';

import type { InterviewPrepCategory, InterviewPrepCategorySummary } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

interface InterviewCategoryFilterProps {
  readonly categories: readonly InterviewPrepCategorySummary[];
  readonly selected: InterviewPrepCategory | null;
  readonly onChange: (category: InterviewPrepCategory | null) => void;
}

/** Kenar çubuğundaki konu listesi: seçili konu koyu zeminde, her satırda soru sayısı. */
export function InterviewCategoryFilter({ categories, selected, onChange }: InterviewCategoryFilterProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();
  const total: number = categories.reduce((sum, entry) => sum + entry.questionCount, 0);

  const row = (key: string, label: string, count: number, active: boolean, onSelect: () => void): ReactNode => (
    <li key={key}>
      <button
        type="button"
        aria-pressed={active}
        onClick={onSelect}
        className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
          active ? 'bg-[var(--foreground)] font-semibold text-[var(--background)]' : 'text-[var(--foreground)] hover:bg-[var(--surface)]'
        }`}
      >
        <span className="truncate">{label}</span>
        <span className={`shrink-0 tabular-nums ${active ? '' : 'text-[var(--muted)]'}`}>{count}</span>
      </button>
    </li>
  );

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--muted)]">{t('knowledge.topics')}</p>
      <ul className="flex flex-col gap-0.5" aria-label={t('knowledge.interview.categoryFilter')}>
        {row('all', t('knowledge.interview.allCategories'), total, selected === null, () => onChange(null))}
        {categories.map((entry) =>
          row(entry.category, categoryLabel(entry.category), entry.questionCount, selected === entry.category, () => onChange(entry.category)),
        )}
      </ul>
    </div>
  );
}
