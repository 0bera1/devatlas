'use client';

import type { InterviewQuestionRef } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface RelatedInterviewQuestionsProps {
  readonly questions: readonly InterviewQuestionRef[];
}

export function RelatedInterviewQuestions({
  questions,
}: RelatedInterviewQuestionsProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();

  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('knowledge.relatedInterviewQuestions')}
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t('knowledge.relatedInterviewQuestionsHint')}
        </p>
      </header>
      <ul className="flex flex-col gap-2">
        {questions.map((item: InterviewQuestionRef) => (
          <li key={item.slug}>
            <Link
              href={`/knowledge/interview/${item.slug}`}
              className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-950/60 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/40"
            >
              <span className="inline-flex w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {categoryLabel(item.category)}
              </span>
              <span className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                {item.question}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
