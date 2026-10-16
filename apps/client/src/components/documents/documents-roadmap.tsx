'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function DocumentsRoadmap(): ReactNode {
  const { t } = useTranslations();

  return (
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {t('roadmap.title')}
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {t('roadmap.intro')}
      </p>
      <ol className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.richtext')}</span>
            <span className="mt-0.5 block text-[var(--muted)]">
              {t('roadmap.richtextSub')}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.autosave')}</span>
            <span className="mt-0.5 block text-[var(--muted)]">
              {t('roadmap.autosaveSub')}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.versioning')}</span>
            <span className="mt-0.5 block text-[var(--muted)]">
              {t('roadmap.versioningSub')}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden>🔜</span>
          <span>
            <span className="font-medium">{t('roadmap.collab')}</span>
            <span className="mt-0.5 block text-[var(--muted)]">
              {t('roadmap.collabSub')}
            </span>
          </span>
        </li>
      </ol>
    </aside>
  );
}
