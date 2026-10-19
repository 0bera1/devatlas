'use client';

import { KnowledgeRowList, type KnowledgeRow } from '@/components/knowledge/knowledge-row-list';
import type { InterviewKnowledgeResources, KnowledgeResourceRef } from '@/domains/knowledge/knowledgeDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

interface InterviewRelatedResourcesProps {
  readonly resources: InterviewKnowledgeResources;
}

/** Soruyu destekleyen doküman, diyagram ve akışlar; bilgi tabanı listeleriyle aynı satır düzeninde. */
export function InterviewRelatedResources({ resources }: InterviewRelatedResourcesProps): ReactNode {
  const { t } = useTranslations();

  const rows: readonly KnowledgeRow[] = useMemo((): KnowledgeRow[] => {
    const map = (items: readonly KnowledgeResourceRef[], prefix: string, label: string): KnowledgeRow[] =>
      items.map((item) => ({ key: `${prefix}-${item.slug}`, href: `${prefix}/${item.slug}`, title: item.title, description: null, meta: label, badge: null }));
    return [
      ...map(resources.documents, '/knowledge/documents', t('knowledge.interview.resourceKind.document')),
      ...map(resources.diagrams, '/knowledge/diagrams', t('knowledge.interview.resourceKind.diagram')),
      ...map(resources.flows, '/knowledge/flows', t('knowledge.interview.resourceKind.flow')),
    ];
  }, [resources, t]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium">{t('knowledge.interview.relatedResources')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{t('knowledge.interview.relatedResourcesHint')}</p>
        </div>
        <span className="text-xs tabular-nums text-[var(--muted)]">
          {rows.length} {t('knowledge.interview.resourceCountLabel')}
        </span>
      </header>
      <KnowledgeRowList rows={rows} isPending={false} errorMessage={null} emptyMessage="" />
    </section>
  );
}
