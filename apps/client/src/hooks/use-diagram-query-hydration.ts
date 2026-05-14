'use client';

import { getDiagramRecordSyncFingerprint } from '@/diagram-engine/core/diagram-record.adapter';
import type { DiagramEngine } from '@/diagram-engine/core/diagram-engine';
import type { DiagramRecord } from '@/domains/diagramDomains';
import { useLayoutEffect, useRef } from 'react';

/**
 * Sunucudan gelen diyagram kaydı ile motor store’u senkronlar (parmak izi ile gereksiz hydrate önlenir).
 */
export function useDiagramQueryHydration(
  data: DiagramRecord | undefined,
  diagramRouteId: string,
  engine: DiagramEngine,
): void {
  const lastFingerprintRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (data === undefined) {
      lastFingerprintRef.current = null;
      engine.dehydrate();
      return;
    }
    const recordId: string = String(data.id).trim();
    const routeId: string = String(diagramRouteId).trim();
    if (recordId.length === 0 || recordId !== routeId) {
      lastFingerprintRef.current = null;
      engine.dehydrate();
      return;
    }
    const fingerprint: string = getDiagramRecordSyncFingerprint(data);
    if (lastFingerprintRef.current === fingerprint) {
      return;
    }
    lastFingerprintRef.current = fingerprint;
    engine.hydrateFromRecord(data);
  }, [data, diagramRouteId, engine]);
}
