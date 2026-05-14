'use client';

import { AuthGoogleButton } from '@/components/auth/auth-google-button';
import { AuthOrDivider } from '@/components/auth/auth-or-divider';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useRegister } from '@/hooks/auth/use-register';
import { useTranslations } from '@/hooks/i18n/use-translations';
import type { FormEvent } from 'react';
import { useState } from 'react';

export function RegisterForm() {
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const { submit, status, errorMessage, clearError } = useRegister();
  const busy: boolean = status === 'loading';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    await submit({ email, password, name, birthDate });
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
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        disabled={busy}
        required
        minLength={8}
        variant="authImmersive"
        passwordToggleable
      />
      <p className="-mt-2 text-xs text-zinc-500">{t('auth.register.passwordHint')}</p>
      <AuthTextField
        id="name"
        label={t('auth.register.name')}
        type="text"
        autoComplete="name"
        value={name}
        onChange={setName}
        disabled={busy}
        variant="authImmersive"
      />
      <AuthTextField
        id="birthDate"
        label={t('auth.register.birthDate')}
        type="date"
        value={birthDate}
        onChange={setBirthDate}
        disabled={busy}
        required
        variant="authImmersive"
      />

      <AuthOrDivider />

      <AuthGoogleButton />

      <button
        type="submit"
        disabled={busy}
        className="flex w-full justify-center rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-amber-500/15 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {busy ? t('auth.register.submitting') : t('auth.register.submit')}
      </button>
    </form>
  );
}
