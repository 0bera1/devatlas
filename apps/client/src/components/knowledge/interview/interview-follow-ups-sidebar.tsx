'use client';

import { SmoothCollapse } from '@/components/knowledge/interview/smooth-collapse';
import type { InterviewPrepFollowUpSummary } from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface InterviewFollowUpsSidebarProps {
  readonly followUps: readonly InterviewPrepFollowUpSummary[];
}

interface FollowUpCardProps {
  readonly item: InterviewPrepFollowUpSummary;
  readonly index: number;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
}

function FollowUpCard({
  item,
  index,
  isExpanded,
  onToggle,
}: FollowUpCardProps): ReactNode {
  const { t } = useTranslations();

  return (
    <li className="rounded-xl border border-[var(--border)]/80 bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex gap-3">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-semibold text-[var(--muted)]"
          aria-hidden
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/knowledge/interview/${item.slug}`}
            className="block text-sm font-medium leading-snug text-[var(--foreground)] transition-colors hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {item.question}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="mt-2.5 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
          >
            {isExpanded
              ? t('knowledge.interview.hideAnswer')
              : t('knowledge.interview.showAnswer')}
          </button>
          <SmoothCollapse open={isExpanded}>
            <p className="mt-3 rounded-lg bg-[var(--surface)] px-3 py-2.5 text-sm leading-relaxed text-[var(--foreground)]">
              {item.answer}
            </p>
          </SmoothCollapse>
        </div>
      </div>
    </li>
  );
}

export function InterviewFollowUpsSidebar({
  followUps,
}: InterviewFollowUpsSidebarProps): ReactNode {
  const { t } = useTranslations();
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:self-start">
      <header className="flex flex-col gap-1 px-1">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          {t('knowledge.interview.relatedQuestions')}
        </h2>
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {t('knowledge.interview.relatedQuestionsHint')}
        </p>
      </header>
      <ul className="flex flex-col gap-2.5 overflow-y-auto pr-0.5 lg:max-h-[calc(100vh-9rem)]">
        {followUps.map((item: InterviewPrepFollowUpSummary, index: number) => (
          <FollowUpCard
            key={item.id}
            item={item}
            index={index}
            isExpanded={expandedSlug === item.slug}
            onToggle={(): void => {
              setExpandedSlug(expandedSlug === item.slug ? null : item.slug);
            }}
          />
        ))}
      </ul>
    </aside>
  );
}
