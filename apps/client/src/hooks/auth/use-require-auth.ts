'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface UseRequireAuthResult {
  canRender: boolean;
}

export function useRequireAuth(): UseRequireAuthResult {
  const { token, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && token === null) {
      router.replace('/login');
    }
  }, [isReady, token, router]);

  return {
    canRender: isReady && token !== null,
  };
}
