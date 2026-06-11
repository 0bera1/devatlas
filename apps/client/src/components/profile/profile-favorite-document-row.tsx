'use client';

import type { FavoriteDocumentEntry } from '@/domains/profile/profileDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function ProfileFavoriteDocumentRow({
  entry,
}: {
  readonly entry: FavoriteDocumentEntry;
}): ReactNode {
  const { t } = useTranslations();

  return (
    <Link
      href={`/documents/${entry.id}`}
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {entry.title}
        </span>
        <span className="shrink-0 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {entry.visibility}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {entry.favoriteCount} {t('profile.favorites.itemFavorites')}
        </span>
        <span>
          {entry.viewCount} {t('profile.favorites.itemViews')}
        </span>
        <span>
          {t('profile.favorites.favoritedAt')}{' '}
          {new Date(entry.favoritedAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
