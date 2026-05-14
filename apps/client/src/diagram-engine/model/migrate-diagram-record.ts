import type { DiagramEdgeRecord, DiagramNodeRecord, DiagramRecord } from '@/domains/diagramDomains';

function cloneRecord(record: DiagramRecord): DiagramRecord {
  return {
    ...record,
    nodes: record.nodes.map(
      (n: DiagramNodeRecord): DiagramNodeRecord => ({ ...n }),
    ),
    edges: record.edges.map(
      (e: DiagramEdgeRecord): DiagramEdgeRecord => ({ ...e }),
    ),
  };
}

/** Eski `db` tipini kanonik `database` stringine taşır (API gövdesi ile uyum). */
export function normalizeDiagramRecordWireTypes(
  record: DiagramRecord,
): DiagramRecord {
  const next: DiagramRecord = cloneRecord(record);
  const nodes: DiagramNodeRecord[] = next.nodes.map(
    (n: DiagramNodeRecord): DiagramNodeRecord => {
      if (n.type === 'db') {
        return { ...n, type: 'database' };
      }
      return n;
    },
  );
  return { ...next, nodes };
}

/**
 * Bilinmeyen / eski payload’ları `DiagramRecord` biçimine getirir.
 * Şimdilik yalnızca dar doğrulama; ileride şema yükseltmeleri burada toplanır.
 */
export function migrateLegacyDiagramInput(input: unknown): DiagramRecord {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Geçersiz diyagram girdisi');
  }
  const r = input as Partial<DiagramRecord>;
  if (
    typeof r.id !== 'string' ||
    typeof r.title !== 'string' ||
    !Array.isArray(r.nodes) ||
    !Array.isArray(r.edges)
  ) {
    throw new Error('Eksik diyagram alanları');
  }
  return normalizeDiagramRecordWireTypes(r as DiagramRecord);
}
