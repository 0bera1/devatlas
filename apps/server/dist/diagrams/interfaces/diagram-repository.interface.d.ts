import type { Visibility } from '@prisma/client';
import type { DiagramCollaboratorEntry } from './diagram-collaborator-entry.interface';
import type { DiagramRecord } from './diagram-record.interface';
import type { DiagramSearchRow } from './diagram-search-row.interface';
import type { DiagramSummary } from './diagram-summary.interface';
export declare const DIAGRAM_REPOSITORY: unique symbol;
export interface CreateDiagramInput {
    readonly ownerId: string;
    readonly title: string;
    readonly visibility?: Visibility;
}
export interface SaveDiagramGraphInputNode {
    readonly id: string;
    readonly label: string;
    readonly type: string;
    readonly x: number;
    readonly y: number;
}
export interface SaveDiagramGraphInputEdge {
    readonly fromNodeId: string;
    readonly toNodeId: string;
    readonly label?: string | null;
}
export interface IDiagramRepository {
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
    selectPublicDiagramsByQuery(searchTerm: string, take: number): Promise<DiagramSearchRow[]>;
    selectPublicRelatedDiagramsBySharedNodeLabels(sourceDiagramId: string, take: number): Promise<DiagramSummary[]>;
    insertDiagramCollaborator(diagramId: string, userId: string): Promise<void>;
    deleteDiagramCollaborator(diagramId: string, userId: string): Promise<boolean>;
    selectDiagramCollaborators(diagramId: string): Promise<readonly DiagramCollaboratorEntry[]>;
}
