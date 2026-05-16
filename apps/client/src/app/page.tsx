'use client';

import { HomeShell } from '@/components/home/home-shell';
import { SceneController } from '@/components/scene/SceneController';
import { SceneViewport } from '@/components/scene/SceneViewport';
import type { ReactNode } from 'react';

export default function Home(): ReactNode {
  return (
    <HomeShell variant="cinematic">
      <SceneController>
        <SceneViewport />
      </SceneController>
    </HomeShell>
  );
}
