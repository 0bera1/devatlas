'use client';

import { SemanticTagChip } from '@/components/diagrams/intelligence/semantic-tag-chip';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export interface SemanticTagListProps {
  readonly tags: readonly string[];
}

export function SemanticTagList(props: SemanticTagListProps): ReactNode {
  const { tags } = props;
  const { t } = useTranslations();

  if (tags.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {t('diagrams.related.tagsTitle')}
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tags.map((tag: string) => (
          <SemanticTagChip key={tag} label={tag} />
        ))}
      </div>
    </div>
  );
}
