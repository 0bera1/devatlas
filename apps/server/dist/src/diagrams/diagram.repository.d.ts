import type { Visibility } from '@prisma/client';
import { type IPrismaService } from '../prisma/interfaces/prisma-service.interface';
import type { DiagramRecord } from './interfaces/diagram-record.interface';
import type { DiagramCollaboratorEntry } from './interfaces/diagram-collaborator-entry.interface';
import type { CreateDiagramInput, IDiagramRepository, SaveDiagramGraphInputEdge, SaveDiagramGraphInputNode } from './interfaces/diagram-repository.interface';
import type { DiagramSearchRow } from './interfaces/diagram-search-row.interface';
import type { DiagramSummary } from './interfaces/diagram-summary.interface';
export declare class DiagramRepository implements IDiagramRepository {
    private readonly prisma;
    constructor(prisma: IPrismaService);
    insertDiagram(input: CreateDiagramInput): Promise<DiagramRecord>;
    selectDiagramSummariesForUser(userId: string): Promise<DiagramSummary[]>;
    selectDiagramByIdAndOwnerId(id: string, ownerId: string): Promise<DiagramRecord | null>;
    selectDiagramByIdForUser(id: string, userId: string): Promise<DiagramRecord | null>;
    selectDiagramByIdPublicOnly(id: string): Promise<DiagramRecord | null>;
    selectIsDiagramCollaborator(diagramId: string, userId: string): Promise<boolean>;
    replaceDiagramGraph(diagramId: string, actorUserId: string, nodes: readonly SaveDiagramGraphInputNode[], edges: readonly SaveDiagramGraphInputEdge[]): Promise<DiagramRecord | null>;
    updateDiagramPatchByIdAndOwnerId(id: string, ownerId: string, patch: {
        title?: string;
        visibility?: Visibility;
    }): Promise<DiagramRecord | null>;
    deleteDiagramByIdAndOwnerId(id: string, ownerId: string): Promise<boolean>;
    insertDiagramFavorite(userId: string, diagramId: string): Promise<void>;
    selectPublicDiagramsByQuery(searchTerm: string, take: number): Promise<DiagramSearchRow[]>;
    selectPublicRelatedDiagramsBySharedNodeLabels(sourceDiagramId: string, take: number): Promise<DiagramSummary[]>;
    insertDiagramCollaborator(diagramId: string, userId: string): Promise<void>;
    deleteDiagramCollaborator(diagramId: string, userId: string): Promise<boolean>;
    selectDiagramCollaborators(diagramId: string): Promise<readonly DiagramCollaboratorEntry[]>;
}
