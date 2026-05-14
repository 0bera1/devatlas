'use client';

import { HttpRequestError, isHttpNetworkError } from '@/api/http/execute-request';
import { useAuth } from '@/components/providers/auth-provider';
import { useRegisterMutation } from '@/features/auth/mutations/useAuthMutation';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

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
  const mutation = useRegisterMutation();

  const clearError = useCallback(() => {
    mutation.reset();
  }, [mutation]);

  const submit = useCallback(
    async (values: RegisterFormValues) => {
      try {
        const result = await mutation.mutateAsync({
          email: values.email.trim(),
          password: values.password,
          name: values.name.trim() || undefined,
          birthDate: toIsoBirthDate(values.birthDate),
        });
        setSession({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
        router.push('/');
        router.refresh();
      } catch {
        /* hata mutation.state ile yansır */
      }
    },
    [mutation, router, setSession],
  );

  const errorMessage = useMemo((): string | null => {
    if (!mutation.isError || mutation.error === null) {
      return null;
    }
    const err: Error = mutation.error;
    if (isHttpNetworkError(err)) {
      return t('errors.network');
    }
    if (err instanceof HttpRequestError) {
      return err.message;
    }
    return err.message;
  }, [mutation.isError, mutation.error, t]);

  const status: RegisterStatus = mutation.isPending
    ? 'loading'
    : mutation.isError
      ? 'error'
      : 'idle';

  return { submit, status, errorMessage, clearError };
}
