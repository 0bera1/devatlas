'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ReactNode } from 'react';

interface KnowledgeSectionSearchProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export function KnowledgeSectionSearch(
  props: KnowledgeSectionSearchProps,
): ReactNode {
  const { value, onChange } = props;
  const { t } = useTranslations();

  return (
    <label className="block">
      <span className="sr-only">{t('knowledge.search.label')}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={t('knowledge.search.placeholder')}
        autoComplete="off"
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
    </label>
  );
}
