'use client';

import type { UserProfile } from '@/domains/profile/profileDomains';
import { useProfileInfoForm } from '@/features/profile/hooks/use-profile-info-form';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { FormEvent, ReactNode } from 'react';

const inputClassName: string =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--border)] dark:focus:border-[var(--border)]';

const labelClassName: string =
  'text-xs font-medium uppercase tracking-wide text-[var(--muted)]';

export function ProfileInfoForm({
  profile,
}: {
  readonly profile: UserProfile;
}): ReactNode {
  const { t } = useTranslations();
  const form = useProfileInfoForm(profile);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className={labelClassName}>{t('profile.info.email')}</span>
          <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
            {profile.email}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className={labelClassName}>
            {t('profile.info.memberSince')}
          </span>
          <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
            {new Date(profile.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClassName} htmlFor="profile-first-name">
            {t('profile.info.firstName')}
          </label>
          <input
            id="profile-first-name"
            type="text"
            autoComplete="given-name"
            value={form.state.firstName}
            onChange={(event): void => {
              form.setFirstName(event.target.value);
            }}
            placeholder={t('profile.info.firstNamePlaceholder')}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClassName} htmlFor="profile-last-name">
            {t('profile.info.lastName')}
          </label>
          <input
            id="profile-last-name"
            type="text"
            autoComplete="family-name"
            value={form.state.lastName}
            onChange={(event): void => {
              form.setLastName(event.target.value);
            }}
            placeholder={t('profile.info.lastNamePlaceholder')}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="profile-birthdate">
          {t('profile.info.birthDate')}
        </label>
        <input
          id="profile-birthdate"
          type="date"
          value={form.state.birthDate}
          onChange={(event): void => {
            form.setBirthDate(event.target.value);
          }}
          className={inputClassName}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!form.isDirty || form.isSubmitting}
          className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.isSubmitting ? t('profile.info.saving') : t('profile.info.save')}
        </button>
      </div>
    </form>
  );
}
