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
    <li className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex gap-3">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          aria-hidden
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/knowledge/interview/${item.slug}`}
            className="block text-sm font-medium leading-snug text-zinc-900 transition-colors hover:text-indigo-700 dark:text-zinc-100 dark:hover:text-indigo-300"
          >
            {item.question}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="mt-2.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {isExpanded
              ? t('knowledge.interview.hideAnswer')
              : t('knowledge.interview.showAnswer')}
          </button>
          <SmoothCollapse open={isExpanded}>
            <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2.5 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
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
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('knowledge.interview.relatedQuestions')}
        </h2>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
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
