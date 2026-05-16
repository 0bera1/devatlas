'use client';

import { GraphCanvas } from '@/components/canvas/GraphCanvas';
import { CTA } from '@/components/ui/CTA';
import { FlowTable } from '@/components/ui/FlowTable';
import { HeroOverlay } from '@/components/ui/HeroOverlay';
import { InterviewGlass } from '@/components/ui/InterviewGlass';
import { ScenarioCards } from '@/components/ui/ScenarioCards';
import { computeCameraStyle, deriveScenePhysics } from '@/lib/sceneMath';
import { useSceneStore } from '@/store/useSceneStore';
import { useMemo, type ReactNode } from 'react';

import { useScrollProgress } from './useScrollProgress';

/**
 * Tek sahne: arka plan canvas + kamera rig + tüm UI beat’leri.
 */
export function SceneViewport(): ReactNode {
  const progress: number = useScrollProgress();
  const interactionBoost: number = useSceneStore(
    (state) => state.interactionBoost,
  );

  const physics = useMemo(
    () => deriveScenePhysics(progress, interactionBoost),
    [progress, interactionBoost],
  );

  const cameraStyle = useMemo(
    () => computeCameraStyle(physics),
    [physics],
  );

  return (
    <>
      <GraphCanvas />
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ perspective: '1400px' }}
      >
        <div
          className="relative h-full w-full max-w-7xl transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={cameraStyle}
        >
          <HeroOverlay physics={physics} />
          <ScenarioCards physics={physics} />
          <FlowTable physics={physics} />
          <InterviewGlass physics={physics} />
          <CTA physics={physics} />
        </div>
      </div>
    </>
  );
}
