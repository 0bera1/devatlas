'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { loginRequest } from '@/lib/api/auth-api';
import { useAuth } from '@/components/providers/auth-provider';

export type LoginStatus = 'idle' | 'loading' | 'error';

export interface UseLoginResult {
  submit: (email: string, password: string) => Promise<void>;
  status: LoginStatus;
  errorMessage: string | null;
  clearError: () => void;
}

export function useLogin(): UseLoginResult {
  const router = useRouter();
  const { setToken } = useAuth();
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
        setErrorMessage(result.error);
        return;
      }
      setToken(result.data.accessToken);
      setStatus('idle');
      router.push('/');
      router.refresh();
    },
    [router, setToken],
  );

  return { submit, status, errorMessage, clearError };
}
