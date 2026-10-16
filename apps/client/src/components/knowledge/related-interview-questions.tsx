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
    <section className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          {t('knowledge.relatedInterviewQuestions')}
        </h2>
        <p className="text-xs text-[var(--muted)]">
          {t('knowledge.relatedInterviewQuestionsHint')}
        </p>
      </header>
      <ul className="flex flex-col gap-2">
        {questions.map((item: InterviewQuestionRef) => (
          <li key={item.slug}>
            <Link
              href={`/knowledge/interview/${item.slug}`}
              className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/40"
            >
              <span className="inline-flex w-fit rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                {categoryLabel(item.category)}
              </span>
              <span className="text-sm font-medium leading-snug text-[var(--foreground)]">
                {item.question}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
