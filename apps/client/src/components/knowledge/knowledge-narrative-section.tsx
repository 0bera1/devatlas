'use client';

import { KnowledgeNarrativePanel } from '@/components/knowledge/knowledge-narrative-panel';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

interface KnowledgeNarrativeSectionProps {
  readonly narrative: string | null | undefined;
  readonly variant?: 'default' | 'flow' | 'step';
  readonly className?: string;
}

export function KnowledgeNarrativeSection(
  props: KnowledgeNarrativeSectionProps,
): ReactNode {
  const { narrative, variant = 'default', className } = props;
  const { t } = useTranslations();

  if (narrative === null || narrative === undefined || narrative.trim().length === 0) {
    return null;
  }

  const sectionClass: string = className ?? 'flex flex-col gap-3';

  return (
    <section className={sectionClass} aria-labelledby="knowledge-narrative-heading">
      <h2
        id="knowledge-narrative-heading"
        className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
      >
        {t('knowledge.narrative.heading')}
      </h2>
      <KnowledgeNarrativePanel content={narrative} variant={variant} />
    </section>
  );
}
