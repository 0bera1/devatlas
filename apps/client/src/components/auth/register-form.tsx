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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const { submit, status, errorMessage, clearError } = useRegister();
  const busy: boolean = status === 'loading';

  const namesValid: boolean =
    firstName.trim().length > 0 && lastName.trim().length > 0;

  const submitDisabled: boolean =
    busy ||
    email.trim().length === 0 ||
    password.length < 8 ||
    birthDate.length === 0 ||
    !namesValid;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setFirstNameError(null);
    setLastNameError(null);

    if (firstName.trim().length === 0) {
      setFirstNameError(t('auth.validation.firstNameRequired'));
      return;
    }
    if (lastName.trim().length === 0) {
      setLastNameError(t('auth.validation.lastNameRequired'));
      return;
    }

    await submit({ email, password, firstName, lastName, birthDate });
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
        id="firstName"
        label={t('auth.register.firstName')}
        type="text"
        autoComplete="given-name"
        value={firstName}
        onChange={(v: string) => {
          setFirstName(v);
          if (firstNameError !== null) {
            setFirstNameError(null);
          }
        }}
        disabled={busy}
        required
        variant="authImmersive"
        errorText={firstNameError}
      />
      <AuthTextField
        id="lastName"
        label={t('auth.register.lastName')}
        type="text"
        autoComplete="family-name"
        value={lastName}
        onChange={(v: string) => {
          setLastName(v);
          if (lastNameError !== null) {
            setLastNameError(null);
          }
        }}
        disabled={busy}
        required
        variant="authImmersive"
        errorText={lastNameError}
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
        disabled={submitDisabled}
        className="flex w-full justify-center rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-amber-500/15 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {busy ? t('auth.register.submitting') : t('auth.register.submit')}
      </button>
    </form>
  );
}
