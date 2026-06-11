'use client';

import { KnowledgeBaseView } from '@/components/knowledge/knowledge-base-view';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { Suspense, type ReactNode } from 'react';

function KnowledgeFallback(): ReactNode {
  const { t } = useTranslations();
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col px-6 py-16 text-zinc-500 dark:text-zinc-400">
      {t('common.loading')}
    </main>
  );
}

export default function KnowledgePage(): ReactNode {
  return (
    <Suspense fallback={<KnowledgeFallback />}>
      <KnowledgeBaseView />
    </Suspense>
  );
}
