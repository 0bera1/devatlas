'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

export function IntelligenceEmptyMessage(): ReactNode {
  const { t } = useTranslations();
  return (
    <p className="mt-4 text-sm text-[var(--muted)]">
      {t('diagrams.related.empty')}
    </p>
  );
}
