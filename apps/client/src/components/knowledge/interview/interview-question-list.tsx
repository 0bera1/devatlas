'use client';

import { InterviewDifficultyBadge } from '@/components/knowledge/interview/interview-difficulty-badge';
import type { InterviewPrepQuestionSummary } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface InterviewQuestionListProps {
  readonly questions: readonly InterviewPrepQuestionSummary[];
  readonly footer?: ReactNode;
  readonly emptyMessage: string;
}

export function InterviewQuestionList({
  questions,
  footer,
  emptyMessage,
}: InterviewQuestionListProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();

  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {questions.map((item: InterviewPrepQuestionSummary) => (
        <li key={item.id}>
          <Link
            href={`/knowledge/interview/${item.slug}`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                {categoryLabel(item.category)}
              </span>
              <InterviewDifficultyBadge difficulty={item.difficulty} />
              <span className="text-xs text-[var(--muted)]">
                {item.followUpCount} {t('knowledge.interview.followUpLabel')}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug text-[var(--foreground)]">
              {item.question}
            </h2>
          </Link>
        </li>
      ))}
      {footer !== undefined ? <li>{footer}</li> : null}
    </ul>
  );
}
