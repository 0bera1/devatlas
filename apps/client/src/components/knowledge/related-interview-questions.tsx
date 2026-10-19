'use client';

import type { InterviewQuestionRef } from '@/domains/knowledge/knowledgeDomains';
import { useInterviewPrepCategoryLabel } from '@/hooks/knowledge/use-interview-prep-category-label';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface RelatedInterviewQuestionsProps {
  readonly questions: readonly InterviewQuestionRef[];
}

/** Sayfanın altındaki "İlgili" bölümü: bağlı mülakat soruları çip olarak listelenir. */
export function RelatedInterviewQuestions({ questions }: RelatedInterviewQuestionsProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();

  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 border-t border-[var(--border)] pt-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">{t('knowledge.relatedInterviewQuestions')}</h2>
      <ul className="flex flex-wrap gap-2">
        {questions.map((item: InterviewQuestionRef) => (
          <li key={item.slug}>
            <Link
              href={`/knowledge/interview/${item.slug}`}
              className="inline-flex max-w-full items-baseline gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] transition-colors hover:border-[var(--foreground)]"
            >
              <span className="truncate">{item.question}</span>
              <span className="shrink-0 text-[11px] text-[var(--muted)]">{categoryLabel(item.category)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
