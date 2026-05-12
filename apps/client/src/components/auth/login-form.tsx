'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useLogin } from '@/hooks/use-login';
import { useTranslations } from '@/hooks/use-translations';

export function LoginForm() {
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { submit, status, errorMessage, clearError } = useLogin();
  const busy: boolean = status === 'loading';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    await submit(email, password);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {errorMessage !== null ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
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
      />
      <button
        type="submit"
        disabled={busy}
        className="flex w-full justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {busy ? t('auth.login.submitting') : t('auth.login.submit')}
      </button>
    </form>
  );
}
