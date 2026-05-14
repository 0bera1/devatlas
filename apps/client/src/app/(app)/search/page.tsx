'use client';

import { SearchPageView } from '@/components/search/search-page-view';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { Suspense, type ReactNode } from 'react';

function SearchFallback(): ReactNode {
  const { t } = useTranslations();
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col px-6 py-16 text-zinc-500 dark:text-zinc-400">
      {t('common.loading')}
    </main>
  );
}

export default function SearchPage(): ReactNode {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageView />
    </Suspense>
  );
}
