'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { refreshRequest } from '@/lib/api/auth-api';
import { ACCESS_TOKEN_REFRESH_INTERVAL_MS } from '@/lib/auth/refresh-interval';

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
      const result = await refreshRequest({ refreshToken: current });
      if (!result.ok) {
        clearSession();
        return;
      }
      setSession({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      });
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
