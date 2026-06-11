'use client';

import type { InterviewPrepQuestionSummary } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface InterviewQuestionListProps {
  readonly questions: readonly InterviewPrepQuestionSummary[];
}

export function InterviewQuestionList({
  questions,
}: InterviewQuestionListProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();

  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {t('knowledge.interview.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {questions.map((item: InterviewPrepQuestionSummary) => (
        <li key={item.id}>
          <Link
            href={`/knowledge/interview/${item.slug}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {categoryLabel(item.category)}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.followUpCount} {t('knowledge.interview.followUpLabel')}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
              {item.question}
            </h2>
          </Link>
        </li>
      ))}
    </ul>
  );
}
