'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { HomeShell } from '@/components/home/home-shell';
import { SceneController } from '@/components/scene/SceneController';
import { SceneViewport } from '@/components/scene/SceneViewport';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export default function Home(): ReactNode {
  const { token, isReady } = useAuth();
  const router = useRouter();

  // Giriş yapmış kullanıcı doğrudan günün ekranına gider.
  useEffect(() => {
    if (isReady && token !== null) {
      router.replace('/today');
    }
  }, [isReady, token, router]);

  if (isReady && token !== null) {
    return null;
  }

  return (
    <HomeShell variant="cinematic">
      <SceneController>
        <SceneViewport />
      </SceneController>
    </HomeShell>
  );
}
