'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { LandingPage } from '@/components/home/landing-page';
import { LandingStory } from '@/components/home/landing-story';
import { usePrefersReducedMotion } from '@/components/home/use-prefers-reduced-motion';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export default function Home(): ReactNode {
  const { token, isReady } = useAuth();
  const router = useRouter();
  const reducedMotion: boolean = usePrefersReducedMotion();

  // Giriş yapmış kullanıcı doğrudan günün ekranına gider.
  useEffect(() => {
    if (isReady && token !== null) {
      router.replace('/today');
    }
  }, [isReady, token, router]);

  if (isReady && token !== null) {
    return null;
  }

  // Hareket azaltma tercihi açıksa kaydırmalı sahne yerine sade, sabit tanıtım gösterilir.
  return reducedMotion ? <LandingPage /> : <LandingStory />;
}
