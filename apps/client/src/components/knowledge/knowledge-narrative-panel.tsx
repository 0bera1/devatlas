'use client';

import { KnowledgeMarkdownContent } from '@/components/knowledge/knowledge-markdown-content';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

interface KnowledgeNarrativePanelProps {
  readonly content: string;
  readonly variant?: 'default' | 'flow' | 'step';
}

export function KnowledgeNarrativePanel(
  props: KnowledgeNarrativePanelProps,
): ReactNode {
  const { content, variant = 'default' } = props;
  const { t } = useTranslations();

  if (content.trim().length === 0) {
    return null;
  }

  const borderClass: string =
    variant === 'flow'
      ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/25'
      : variant === 'step'
        ? 'border-violet-200 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20'
        : 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40';

  return (
    <section
      className={`rounded-2xl border px-5 py-4 ${borderClass}`}
      aria-label={t('knowledge.narrative.ariaLabel')}
    >
      <KnowledgeMarkdownContent content={content} />
    </section>
  );
}
