'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function IntelligencePanelHeader(): ReactNode {
  const { t } = useTranslations();
  return (
    <header>
      <h2 className="text-sm font-semibold text-[var(--foreground)]">
        {t('diagrams.related.title')}
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {t('diagrams.related.subtitle')}
      </p>
    </header>
  );
}
