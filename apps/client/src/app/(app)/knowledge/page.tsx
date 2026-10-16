'use client';

import { KnowledgeBaseView } from '@/components/knowledge/knowledge-base-view';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { Suspense, type ReactNode } from 'react';

function KnowledgeFallback(): ReactNode {
  const { t } = useTranslations();
  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col px-6 py-16 text-[var(--muted)]">
      {t('common.loading')}
    </div>
  );
}

export default function KnowledgePage(): ReactNode {
  return (
    <Suspense fallback={<KnowledgeFallback />}>
      <KnowledgeBaseView />
    </Suspense>
  );
}
