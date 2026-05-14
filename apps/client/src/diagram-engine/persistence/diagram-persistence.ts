import type {
  DiagramRecord,
  SaveDiagramGraphBody,
} from '@/domains/diagram/diagramDomains';

/**
 * REST / transport üzerinden diyagram kaydı; React dışı senaryolarda da kullanılabilir.
 */
export interface DiagramPersistencePort {
  readonly loadDiagramRecord: (
    accessToken: string,
    diagramId: string,
  ) => Promise<DiagramRecord>;
  readonly saveDiagramGraph: (
    accessToken: string,
    diagramId: string,
    body: SaveDiagramGraphBody,
  ) => Promise<DiagramRecord>;
}

export class DiagramPersistence {
  public constructor(private readonly port: DiagramPersistencePort) {}

  public async load(
    accessToken: string,
    diagramId: string,
  ): Promise<DiagramRecord> {
    return this.port.loadDiagramRecord(accessToken, diagramId);
  }

  public async saveGraph(
    accessToken: string,
    diagramId: string,
    body: SaveDiagramGraphBody,
  ): Promise<DiagramRecord> {
    return this.port.saveDiagramGraph(accessToken, diagramId, body);
  }
}
