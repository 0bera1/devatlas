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

const ROW_GRID = 'md:grid md:grid-cols-[minmax(0,1fr)_150px_110px] md:items-center md:gap-4';

/** Soru tablosu: geniş ekranda Soru · Konu · Zorluk sütunları, telefonda başlık ve altında meta satırı. */
export function InterviewQuestionList({ questions, footer, emptyMessage }: InterviewQuestionListProps): ReactNode {
  const { t } = useTranslations();
  const categoryLabel = useInterviewPrepCategoryLabel();

  if (questions.length === 0) {
    return <p className="border-y border-[var(--border)] py-12 text-center text-sm text-[var(--muted)]">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col">
      <div className={`hidden border-b border-[var(--border)] pb-2.5 text-xs text-[var(--muted)] ${ROW_GRID}`}>
        <span>{t('knowledge.table.question')}</span>
        <span>{t('knowledge.table.topic')}</span>
        <span>{t('knowledge.table.difficulty')}</span>
      </div>
      <ul>
        {questions.map((item: InterviewPrepQuestionSummary) => (
          <li key={item.id} className="border-b border-[var(--border)]">
            <Link href={`/knowledge/interview/${item.slug}`} className={`group block py-4 ${ROW_GRID}`}>
              <span className="font-serif text-lg leading-snug group-hover:underline group-hover:underline-offset-4">{item.question}</span>
              <span className="mt-1 block text-sm text-[var(--muted)] md:mt-0">
                {categoryLabel(item.category)}
                <span className="md:hidden">
                  {item.followUpCount > 0 ? ` · ${item.followUpCount} ${t('knowledge.interview.followUpLabel')}` : ''}
                </span>
              </span>
              <span className="mt-1 block md:mt-0">
                <InterviewDifficultyBadge difficulty={item.difficulty} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {footer !== undefined ? <div className="pt-4">{footer}</div> : null}
    </div>
  );
}
