'use client';

import type { InterviewPrepFollowUpSummary } from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface InterviewFollowUpsSidebarProps {
  readonly followUps: readonly InterviewPrepFollowUpSummary[];
}

export function InterviewFollowUpsSidebar({
  followUps,
}: InterviewFollowUpsSidebarProps): ReactNode {
  const { t } = useTranslations();
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('knowledge.interview.relatedQuestions')}
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t('knowledge.interview.relatedQuestionsHint')}
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {followUps.map((item: InterviewPrepFollowUpSummary) => {
          const isExpanded: boolean = expandedSlug === item.slug;
          return (
            <li
              key={item.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/60"
            >
              <p className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                {item.question}
              </p>
              <button
                type="button"
                onClick={(): void => {
                  setExpandedSlug(isExpanded ? null : item.slug);
                }}
                className="mt-2 text-xs font-medium text-zinc-700 underline dark:text-zinc-300"
              >
                {isExpanded
                  ? t('knowledge.interview.hideAnswer')
                  : t('knowledge.interview.showAnswer')}
              </button>
              {isExpanded ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {item.answer}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
