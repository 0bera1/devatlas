'use client';

import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';

export function AuthOrDivider(): ReactNode {
  const { t } = useTranslations();

  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-zinc-700" />
      </div>
      <div className="relative flex justify-center text-xs font-medium">
        <span className="bg-[#121212] px-3 text-zinc-500">{t('auth.or')}</span>
      </div>
    </div>
  );
}
