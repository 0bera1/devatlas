'use client';

import { HttpRequestError, isHttpNetworkError } from '@/api/http/execute-request';
import { useAuth } from '@/components/providers/auth-provider';
import { useLoginMutation } from '@/features/auth/mutations/useAuthMutation';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type LoginStatus = 'idle' | 'loading' | 'error';

export interface UseLoginResult {
  submit: (email: string, password: string) => Promise<void>;
  status: LoginStatus;
  errorMessage: string | null;
  clearError: () => void;
}

export function useLogin(): UseLoginResult {
  const router = useRouter();
  const { setSession } = useAuth();
  const { t } = useTranslations();
  const mutation = useLoginMutation();

  const clearError = useCallback(() => {
    mutation.reset();
  }, [mutation]);

  const submit = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await mutation.mutateAsync({ email, password });
        setSession({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
        router.push('/');
        router.refresh();
      } catch {
        /* hata mutation.state + errorMessage ile yansır */
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

  const status: LoginStatus = mutation.isPending
    ? 'loading'
    : mutation.isError
      ? 'error'
      : 'idle';

  return { submit, status, errorMessage, clearError };
}
