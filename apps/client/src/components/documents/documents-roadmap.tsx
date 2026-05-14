'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function DocumentsRoadmap(): ReactNode {
  const { t } = useTranslations();

  return (
    <aside className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t('roadmap.title')}
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {t('roadmap.intro')}
      </p>
      <ol className="mt-4 space-y-3 text-sm text-zinc-800 dark:text-zinc-200">
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.richtext')}</span>
            <span className="mt-0.5 block text-zinc-600 dark:text-zinc-400">
              {t('roadmap.richtextSub')}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.autosave')}</span>
            <span className="mt-0.5 block text-zinc-600 dark:text-zinc-400">
              {t('roadmap.autosaveSub')}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.versioning')}</span>
            <span className="mt-0.5 block text-zinc-600 dark:text-zinc-400">
              {t('roadmap.versioningSub')}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.collab')}</span>
            <span className="mt-0.5 block text-zinc-600 dark:text-zinc-400">
              {t('roadmap.collabSub')}
            </span>
          </span>
        </li>
      </ol>
    </aside>
  );
}
