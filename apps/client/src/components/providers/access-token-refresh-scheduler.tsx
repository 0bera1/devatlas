'use client';

import { authApi } from '@/api/auth/authApi';
import { useAuth } from '@/components/providers/auth-provider';
import { ACCESS_TOKEN_REFRESH_INTERVAL_MS } from '@/lib/auth/refresh-interval';
import { useEffect, useRef } from 'react';

/**
 * Varsayılan: 10 dakikada bir refresh token ile yeni access + refresh çifti alır.
 */
export function AccessTokenRefreshScheduler(): null {
  const { refreshToken, isReady, setSession, clearSession } = useAuth();
  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const tick = async (): Promise<void> => {
      const current = refreshTokenRef.current;
      if (current === null) {
        return;
      }
      try {
        const result = await authApi.refresh({ refreshToken: current });
        setSession({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      } catch {
        clearSession();
      }
    };

    const intervalId = window.setInterval(() => {
      void tick();
    }, ACCESS_TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isReady, setSession, clearSession]);

  return null;
}
