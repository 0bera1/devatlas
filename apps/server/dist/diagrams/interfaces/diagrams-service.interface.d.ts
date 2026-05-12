import type { Visibility } from '@prisma/client';
import type { DiagramCollaboratorEntry } from './diagram-collaborator-entry.interface';
import type { DiagramRecord } from './diagram-record.interface';
import type { DiagramSummary } from './diagram-summary.interface';
import type { PublicSearchDiagramHit } from '../../documents/interfaces/public-search-hit.interface';
export declare const DIAGRAMS_SERVICE: unique symbol;
export interface CreateDiagramCommand {
    readonly title: string;
    readonly visibility?: Visibility;
}
export interface SaveDiagramGraphCommand {
    readonly nodes: readonly {
        readonly id: string;
        readonly label: string;
        readonly type: string;
        readonly x: number;
        readonly y: number;
    }[];
    readonly edges: readonly {
        readonly from: string;
        readonly to: string;
        readonly label?: string | null;
    }[];
}
export interface IDiagramsService {
    createDiagram(ownerId: string, command: CreateDiagramCommand): Promise<DiagramRecord>;
    listDiagramsForUser(userId: string): Promise<DiagramSummary[]>;
    getDiagram(viewerUserId: string, diagramId: string): Promise<DiagramRecord>;
    saveDiagramGraph(actorUserId: string, diagramId: string, command: SaveDiagramGraphCommand): Promise<DiagramRecord>;
    patchDiagram(ownerId: string, diagramId: string, patch: {
        title?: string;
        visibility?: Visibility;
    }): Promise<DiagramRecord>;
    searchPublicDiagrams(rawQuery: string): Promise<PublicSearchDiagramHit[]>;
    getRelatedDiagrams(diagramId: string, viewerUserId: string | null): Promise<DiagramSummary[]>;
    addDiagramCollaboratorByEmail(ownerId: string, diagramId: string, email: string): Promise<DiagramCollaboratorEntry[]>;
    removeDiagramCollaborator(ownerId: string, diagramId: string, targetUserId: string): Promise<DiagramCollaboratorEntry[]>;
    listDiagramCollaborators(ownerId: string, diagramId: string): Promise<readonly DiagramCollaboratorEntry[]>;
}
