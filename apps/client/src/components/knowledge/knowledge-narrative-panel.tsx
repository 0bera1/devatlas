'use client';

import { KnowledgeMarkdownContent } from '@/components/knowledge/knowledge-markdown-content';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

interface KnowledgeNarrativePanelProps {
  readonly content: string;
  readonly variant?: 'default' | 'flow' | 'step';
}

/** Senaryo anlatımı: vurgu renginde sol çizgi ve küçük bir başlık; adım anlatımı daha sade görünür. */
export function KnowledgeNarrativePanel(props: KnowledgeNarrativePanelProps): ReactNode {
  const { content, variant = 'default' } = props;
  const { t } = useTranslations();

  if (content.trim().length === 0) {
    return null;
  }

  return (
    <section
      className={`border-l-2 pl-5 ${variant === 'step' ? 'border-[var(--border)]' : 'border-[var(--accent)]'}`}
      aria-label={t('knowledge.narrative.ariaLabel')}
    >
      <KnowledgeMarkdownContent content={content} />
    </section>
  );
}
