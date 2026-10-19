'use client';

import { AuthGoogleButton } from '@/components/auth/auth-google-button';
import { AuthOrDivider } from '@/components/auth/auth-or-divider';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useLogin } from '@/hooks/auth/use-login';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { FormEvent } from 'react';
import { useState } from 'react';

export function LoginForm() {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { submit, status, errorMessage, clearError } = useLogin();
  const busy: boolean = status === 'loading';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    await submit(email, password);
  };

  const handleForgotClick = (): void => {
    router.push('/forgot-password');
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMessage !== null ? (
        <div
          role="alert"
          className="rounded-xl border border-red-300/60 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {errorMessage}
        </div>
      ) : null}
      <AuthTextField
        id="email"
        label={t('auth.login.email')}
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        disabled={busy}
        required
      />
      <AuthTextField
        id="password"
        label={t('auth.login.password')}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        disabled={busy}
        required
        minLength={1}
        passwordToggleable
      />
      <div className="-mt-1 flex justify-end">
        <button
          type="button"
          onClick={handleForgotClick}
          className="text-sm font-medium text-[var(--foreground)] underline underline-offset-4 transition-colors hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
        >
          {t('auth.login.forgotPassword')}
        </button>
      </div>

      <AuthOrDivider />

      <AuthGoogleButton />

      <button
        type="submit"
        disabled={busy}
        className="flex w-full justify-center rounded-xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {busy ? t('auth.login.submitting') : t('auth.login.submit')}
      </button>
    </form>
  );
}
