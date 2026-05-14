'use client';

import { AuthGoogleButton } from '@/components/auth/auth-google-button';
import { AuthOrDivider } from '@/components/auth/auth-or-divider';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useToast } from '@/components/providers/toast-provider';
import { useLogin } from '@/hooks/auth/use-login';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { FormEvent } from 'react';
import { useState } from 'react';

export function LoginForm() {
  const { t } = useTranslations();
  const { showSuccess } = useToast();
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
    showSuccess(t('auth.forgotPasswordSoon'));
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errorMessage !== null ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/35 bg-red-950/50 px-4 py-3 text-sm text-red-100"
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
        variant="authImmersive"
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
        variant="authImmersive"
        passwordToggleable
      />
      <div className="-mt-1 flex justify-end">
        <button
          type="button"
          onClick={handleForgotClick}
          className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded"
        >
          {t('auth.login.forgotPassword')}
        </button>
      </div>

      <AuthOrDivider />

      <AuthGoogleButton />

      <button
        type="submit"
        disabled={busy}
        className="flex w-full justify-center rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-amber-500/15 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {busy ? t('auth.login.submitting') : t('auth.login.submit')}
      </button>
    </form>
  );
}
