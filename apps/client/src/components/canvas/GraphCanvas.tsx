'use client';

import { GraphEngine } from '@/lib/graphEngine';
import { deriveScenePhysics } from '@/lib/sceneMath';
import { useTheme } from '@/components/providers/theme-provider';
import { useSceneStore } from '@/store/useSceneStore';
import { DEFAULT_GRAPH_NODE_COUNT } from '@/components/canvas/NodeSystem';
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type ReactNode,
} from 'react';

/**
 * Tam ekran tek canvas — store’daki progress fizik girdisi olarak okunur.
 */
export function GraphCanvas(): ReactNode {
  const { resolvedDark } = useTheme();
  const resolvedDarkRef = useRef<boolean>(resolvedDark);
  resolvedDarkRef.current = resolvedDark;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  const resize = useCallback((): void => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) {
      return;
    }
    const dpr: number = Math.min(window.devicePixelRatio ?? 1, 2);
    const rect: DOMRect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    engineRef.current?.setSize(rect.width, rect.height);
  }, []);

  useEffect(() => {
    engineRef.current = new GraphEngine(DEFAULT_GRAPH_NODE_COUNT);
    resize();
    const ro: ResizeObserver = new ResizeObserver(() => {
      resize();
    });
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (canvas?.parentElement) {
      ro.observe(canvas.parentElement);
    }
    const onResize = (): void => {
      resize();
    };
    window.addEventListener('resize', onResize);

    const loop = (now: number): void => {
      const last: number = lastRef.current || now;
      const dt: number = Math.min(0.05, (now - last) / 1000);
      lastRef.current = now;
      const { progress, interactionBoost } = useSceneStore.getState();
      const state = deriveScenePhysics(progress, interactionBoost);
      const ctaOrbit: number =
        state.ctaLock * (0.4 + state.scroll * 0.5);
      engineRef.current?.step(dt, state, ctaOrbit);
      const ctx: CanvasRenderingContext2D | null =
        canvasRef.current?.getContext('2d') ?? null;
      if (ctx && engineRef.current) {
        engineRef.current.draw(
          ctx,
          state,
          ctaOrbit,
          resolvedDarkRef.current,
        );
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);

    return (): void => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [resize]);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>): void => {
      const rect: DOMRect = event.currentTarget.getBoundingClientRect();
      const nx: number = (event.clientX - rect.left) / rect.width;
      const ny: number = (event.clientY - rect.top) / rect.height;
      engineRef.current?.setPointer(nx, ny);
    },
    [],
  );

  const onPointerLeave = useCallback((): void => {
    engineRef.current?.setPointer(null, null);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      />
    </div>
  );
}
