'use client';

import { RelatedDiagramsList } from '@/components/diagrams/intelligence/related-diagrams-list';
import { RelatedDocumentsList } from '@/components/diagrams/intelligence/related-documents-list';
import { SemanticTagList } from '@/components/diagrams/intelligence/semantic-tag-list';
import { SimilarTechnologiesList } from '@/components/diagrams/intelligence/similar-technologies-list';
import type { DiagramIntelligenceResource } from '@/domains/intelligenceDomains';
import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export interface IntelligenceResourceBodyProps {
  readonly resource: DiagramIntelligenceResource;
}

export function IntelligenceResourceBody(
  props: IntelligenceResourceBodyProps,
): ReactNode {
  const { resource } = props;
  const { t } = useTranslations();

  return (
    <div className="mt-4 flex flex-col gap-5">
      <SemanticTagList tags={resource.semanticTags} />
      <RelatedDiagramsList items={resource.relatedDiagrams} />
      <RelatedDocumentsList
        title={t('diagrams.related.documentsTitle')}
        emptyLabel={t('diagrams.related.documentsEmpty')}
        items={resource.relatedDocuments}
      />
      <RelatedDocumentsList
        title={t('diagrams.related.questionsTitle')}
        emptyLabel={t('diagrams.related.questionsEmpty')}
        items={resource.relatedInterviewQuestions}
      />
      <SimilarTechnologiesList items={resource.similarTechnologies} />
    </div>
  );
}
