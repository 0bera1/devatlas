import type { DiagramRecord, SaveDiagramGraphBody } from '@/domains/diagram/diagramDomains';
import {
  DiagramPersistence,
  type DiagramPersistencePort,
} from '@/diagram-engine/persistence/diagram-persistence';

/** `diagramApi` ile uyumlu ince sarmalayıcı — IOC / test için port enjekte edilir. */
export function createDiagramPersistenceFromApi(api: {
  readonly getById: (
    accessToken: string,
    diagramId: string,
  ) => Promise<DiagramRecord>;
  readonly saveGraph: (
    accessToken: string,
    diagramId: string,
    body: SaveDiagramGraphBody,
  ) => Promise<DiagramRecord>;
}): DiagramPersistence {
  const port: DiagramPersistencePort = {
    loadDiagramRecord: (token, id) => api.getById(token, id),
    saveDiagramGraph: (token, id, body) => api.saveGraph(token, id, body),
  };
  return new DiagramPersistence(port);
}
