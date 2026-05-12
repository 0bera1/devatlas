'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { isNetworkFailure } from '@/lib/api/api-error';
import { registerRequest } from '@/lib/api/auth-api';
import { useTranslations } from '@/hooks/use-translations';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export type RegisterStatus = 'idle' | 'loading' | 'error';

export interface RegisterFormValues {
  email: string;
  password: string;
  name: string;
  birthDate: string;
}

export interface UseRegisterResult {
  submit: (values: RegisterFormValues) => Promise<void>;
  status: RegisterStatus;
  errorMessage: string | null;
  clearError: () => void;
}

function toIsoBirthDate(dateInput: string): string {
  const parsed: Date = new Date(`${dateInput}T12:00:00`);
  return parsed.toISOString();
}

export function useRegister(): UseRegisterResult {
  const router = useRouter();
  const { setSession } = useAuth();
  const { t } = useTranslations();
  const [status, setStatus] = useState<RegisterStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  const submit = useCallback(
    async (values: RegisterFormValues) => {
      setStatus('loading');
      setErrorMessage(null);
      const payload = {
        email: values.email.trim(),
        password: values.password,
        name: values.name.trim() || undefined,
        birthDate: toIsoBirthDate(values.birthDate),
      };
      const result = await registerRequest(payload);
      if (!result.ok) {
        setStatus('error');
        setErrorMessage(
          isNetworkFailure(result) ? t('errors.network') : result.error,
        );
        return;
      }
      setSession({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      });
      setStatus('idle');
      router.push('/');
      router.refresh();
    },
    [router, setSession, t],
  );

  return { submit, status, errorMessage, clearError };
}
