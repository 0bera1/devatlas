'use client';

import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { memo, type ReactElement } from 'react';

export interface LandingScrollEdgeData {
  readonly drawT: number;
}

function readDrawT(data: EdgeProps['data']): number {
  if (typeof data !== 'object' || data === null || !('drawT' in data)) {
    return 0;
  }
  const v: number = Number((data as unknown as LandingScrollEdgeData).drawT);
  if (Number.isNaN(v)) {
    return 0;
  }
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Scroll ile beslenen `drawT` (0→1) ile kenar yolu yavaşça “çizilir”.
 */
export const LandingScrollDrawEdge = memo(function LandingScrollDrawEdge(
  props: EdgeProps,
): ReactElement {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    data,
  } = props;

  const drawT: number = readDrawT(data);

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const approxLen: number = Math.max(
    140,
    Math.hypot(sourceX - targetX, sourceY - targetY) * 1.48,
  );
  const dashOffset: number = approxLen * (1 - drawT);

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{
        ...(typeof style === 'object' && style !== null && !Array.isArray(style)
          ? style
          : {}),
        strokeDasharray: approxLen,
        strokeDashoffset: dashOffset,
      }}
    />
  );
});
