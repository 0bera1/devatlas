'use client';

import { useProfilePasswordForm } from '@/features/profile/hooks/use-profile-password-form';
import { useTranslations } from '@/hooks/use-translations';
import type { FormEvent, ReactNode } from 'react';

const inputClassName: string =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-200';

const labelClassName: string =
  'text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400';

export function ProfilePasswordForm(): ReactNode {
  const { t } = useTranslations();
  const form = useProfilePasswordForm();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void form.submit();
  };

  const isFilled: boolean =
    form.state.currentPassword.length > 0 &&
    form.state.newPassword.length > 0 &&
    form.state.confirmPassword.length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClassName} htmlFor="profile-current-password">
          {t('profile.password.current')}
        </label>
        <input
          id="profile-current-password"
          type="password"
          autoComplete="current-password"
          value={form.state.currentPassword}
          onChange={(event): void => {
            form.setCurrentPassword(event.target.value);
          }}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClassName} htmlFor="profile-new-password">
            {t('profile.password.next')}
          </label>
          <input
            id="profile-new-password"
            type="password"
            autoComplete="new-password"
            value={form.state.newPassword}
            onChange={(event): void => {
              form.setNewPassword(event.target.value);
            }}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClassName} htmlFor="profile-confirm-password">
            {t('profile.password.confirm')}
          </label>
          <input
            id="profile-confirm-password"
            type="password"
            autoComplete="new-password"
            value={form.state.confirmPassword}
            onChange={(event): void => {
              form.setConfirmPassword(event.target.value);
            }}
            className={inputClassName}
          />
        </div>
      </div>

      {form.state.errorMessage !== null ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {form.state.errorMessage}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isFilled || form.isSubmitting}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {form.isSubmitting
            ? t('profile.password.submitting')
            : t('profile.password.submit')}
        </button>
      </div>
    </form>
  );
}
