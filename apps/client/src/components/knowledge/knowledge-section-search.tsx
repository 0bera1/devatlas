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
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none ring-[var(--border)] focus:ring-2"
      />
    </label>
  );
}
