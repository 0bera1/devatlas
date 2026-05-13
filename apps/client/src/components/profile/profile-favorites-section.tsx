'use client';

import {
  useFavoriteDiagramsQuery,
  useFavoriteDocumentsQuery,
} from '@/features/profile/queries/useProfileQuery';
import { useTranslations } from '@/hooks/use-translations';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ProfileFavoriteDiagramRow } from './profile-favorite-diagram-row';
import { ProfileFavoriteDocumentRow } from './profile-favorite-document-row';

type FavoritesTab = 'documents' | 'diagrams';

export function ProfileFavoritesSection(): ReactNode {
  const { t } = useTranslations();
  const [tab, setTab] = useState<FavoritesTab>('documents');

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t('profile.favorites.title')}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('profile.favorites.description')}
        </p>
      </div>

      <div className="flex gap-2">
        <TabButton
          isActive={tab === 'documents'}
          label={t('profile.favorites.tab.documents')}
          onClick={(): void => {
            setTab('documents');
          }}
        />
        <TabButton
          isActive={tab === 'diagrams'}
          label={t('profile.favorites.tab.diagrams')}
          onClick={(): void => {
            setTab('diagrams');
          }}
        />
      </div>

      {tab === 'documents' ? (
        <FavoriteDocumentsList />
      ) : (
        <FavoriteDiagramsList />
      )}
    </section>
  );
}

function TabButton({
  isActive,
  label,
  onClick,
}: {
  readonly isActive: boolean;
  readonly label: string;
  readonly onClick: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900'
      }`}
    >
      {label}
    </button>
  );
}

function FavoriteDocumentsList(): ReactNode {
  const { t } = useTranslations();
  const { data, isLoading, isError } = useFavoriteDocumentsQuery();

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-rose-600 dark:text-rose-400">
        {t('errors.network')}
      </p>
    );
  }
  if (data === undefined || data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('profile.favorites.empty.documents')}
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {data.map(entry => (
        <ProfileFavoriteDocumentRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function FavoriteDiagramsList(): ReactNode {
  const { t } = useTranslations();
  const { data, isLoading, isError } = useFavoriteDiagramsQuery();

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('common.loading')}
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-rose-600 dark:text-rose-400">
        {t('errors.network')}
      </p>
    );
  }
  if (data === undefined || data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t('profile.favorites.empty.diagrams')}
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {data.map(entry => (
        <ProfileFavoriteDiagramRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
