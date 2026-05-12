import type { Visibility } from '@prisma/client';
import type { PublicSearchDiagramHit } from '../documents/interfaces/public-search-hit.interface';
import { type IUserRepository } from '../users/interfaces/user-repository.interface';
import type { DiagramCollaboratorEntry } from './interfaces/diagram-collaborator-entry.interface';
import type { DiagramRecord } from './interfaces/diagram-record.interface';
import { type IDiagramRepository } from './interfaces/diagram-repository.interface';
import type { DiagramSummary } from './interfaces/diagram-summary.interface';
import type { CreateDiagramCommand, IDiagramsService, SaveDiagramGraphCommand } from './interfaces/diagrams-service.interface';
export declare class DiagramsService implements IDiagramsService {
    private readonly diagramRepository;
    private readonly userRepository;
    constructor(diagramRepository: IDiagramRepository, userRepository: IUserRepository);
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
    private resolveViewerAccess;
}
