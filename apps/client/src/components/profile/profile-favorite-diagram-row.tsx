'use client';

import type { FavoriteDiagramEntry } from '@/domains/profile/profileDomains';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function ProfileFavoriteDiagramRow({
  entry,
}: {
  readonly entry: FavoriteDiagramEntry;
}): ReactNode {
  const { t } = useTranslations();

  return (
    <Link
      href={`/diagrams/${entry.id}`}
      className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-[var(--foreground)]">
          {entry.title}
        </span>
        <span className="shrink-0 text-[11px] uppercase tracking-wide text-[var(--muted)]">
          {entry.visibility}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
        <span>
          {entry.nodeCount} {t('profile.favorites.itemNodes')}
        </span>
        <span>
          {entry.favoriteCount} {t('profile.favorites.itemFavorites')}
        </span>
        <span>
          {t('profile.favorites.favoritedAt')}{' '}
          {new Date(entry.favoritedAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
