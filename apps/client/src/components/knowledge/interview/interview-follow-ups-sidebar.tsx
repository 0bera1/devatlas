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

/** Takip soruları: numaralı, kural çizgili liste; her sorunun cevabı yerinde açılır. */
export function InterviewFollowUpsSidebar({ followUps }: InterviewFollowUpsSidebarProps): ReactNode {
  const { t } = useTranslations();
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <aside className="flex flex-col lg:sticky lg:top-8 lg:self-start">
      <div className="border-b border-[var(--foreground)] pb-3">
        <h2 className="text-[15px] font-semibold">{t('knowledge.interview.relatedQuestions')}</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{t('knowledge.interview.relatedQuestionsHint')}</p>
      </div>
      <ol className="lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
        {followUps.map((item: InterviewPrepFollowUpSummary, index: number) => {
          const expanded: boolean = expandedSlug === item.slug;
          return (
            <li key={item.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-b border-[var(--border)] py-4">
              <span className="pt-0.5 font-mono text-xs tabular-nums text-[var(--muted)]" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <Link href={`/knowledge/interview/${item.slug}`} className="block font-serif text-[17px] leading-snug hover:underline hover:underline-offset-4">
                  {item.question}
                </Link>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={(): void => {
                    setExpandedSlug(expanded ? null : item.slug);
                  }}
                  className="mt-2 text-xs font-medium text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
                >
                  {expanded ? t('knowledge.interview.hideAnswer') : t('knowledge.interview.showAnswer')}
                </button>
                <SmoothCollapse open={expanded}>
                  <p className="mt-3 border-l-2 border-[var(--accent)] pl-3 text-sm leading-relaxed text-[var(--foreground)]">{item.answer}</p>
                </SmoothCollapse>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
