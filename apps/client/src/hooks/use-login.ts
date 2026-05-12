'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { isNetworkFailure } from '@/lib/api/api-error';
import { loginRequest } from '@/lib/api/auth-api';
import { useTranslations } from '@/hooks/use-translations';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

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
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  const submit = useCallback(
    async (email: string, password: string) => {
      setStatus('loading');
      setErrorMessage(null);
      const result = await loginRequest({ email, password });
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
