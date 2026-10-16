'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useMeQuery } from '@/features/profile/queries/useProfileQuery';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ProfileActivityHeatmap } from './profile-activity-heatmap';
import { ProfileFavoritesSection } from './profile-favorites-section';
import { ProfileInfoForm } from './profile-info-form';
import { ProfilePasswordForm } from './profile-password-form';

const sectionShellClassName: string =
  'rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm';

export function ProfileView(): ReactNode {
  const { t } = useTranslations();
  const { token, isReady } = useAuth();
  const { data, isLoading, isError } = useMeQuery();

  if (!isReady) {
    return null;
  }
  if (token === null) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10">
        <p className="text-sm text-[var(--muted)]">
          {t('nav.loading')}
        </p>
        <Link
          href="/login"
          className="self-start rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
        >
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-[var(--muted)]">
          {t('common.loading')}
        </p>
      </div>
    );
  }
  if (isError || data === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {t('errors.network')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          {t('profile.page.title')}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {t('profile.page.subtitle')}
        </p>
      </header>

      <section className={sectionShellClassName}>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t('profile.info.title')}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {t('profile.info.description')}
          </p>
        </div>
        <ProfileInfoForm profile={data} />
      </section>

      <section className={sectionShellClassName}>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t('profile.password.title')}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {t('profile.password.description')}
          </p>
        </div>
        <ProfilePasswordForm />
      </section>

      <section className={sectionShellClassName}>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t('profile.activity.title')}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {t('profile.activity.description')}
          </p>
        </div>
        <ProfileActivityHeatmap />
      </section>

      <section className={sectionShellClassName}>
        <ProfileFavoritesSection />
      </section>
    </div>
  );
}
