import type { Request } from 'express';
import { type IAuthService } from '../auth/interfaces/auth-service.interface';
import { AddDiagramCollaboratorDto } from './dto/add-diagram-collaborator.dto';
import { CreateDiagramDto } from './dto/create-diagram.dto';
import { PatchDiagramDto } from './dto/patch-diagram.dto';
import { SaveDiagramBodyDto } from './dto/save-diagram.dto';
import type { DiagramCollaboratorEntry } from './interfaces/diagram-collaborator-entry.interface';
import type { DiagramRecord } from './interfaces/diagram-record.interface';
import type { DiagramSummary } from './interfaces/diagram-summary.interface';
import { type IDiagramsService } from './interfaces/diagrams-service.interface';
export declare class DiagramsController {
    private readonly diagramsService;
    private readonly authService;
    constructor(diagramsService: IDiagramsService, authService: IAuthService);
    create(req: Request, dto: CreateDiagramDto): Promise<DiagramRecord>;
    list(req: Request): Promise<DiagramSummary[]>;
    listCollaborators(req: Request, id: string): Promise<readonly DiagramCollaboratorEntry[]>;
    addCollaborator(req: Request, id: string, dto: AddDiagramCollaboratorDto): Promise<DiagramCollaboratorEntry[]>;
    removeCollaborator(req: Request, id: string, userId: string): Promise<DiagramCollaboratorEntry[]>;
    getRelatedDiagrams(id: string, authorization: string | undefined): Promise<DiagramSummary[]>;
    getOne(req: Request, id: string): Promise<DiagramRecord>;
    saveGraph(req: Request, id: string, dto: SaveDiagramBodyDto): Promise<DiagramRecord>;
    patchDiagram(req: Request, id: string, dto: PatchDiagramDto): Promise<DiagramRecord>;
    private static requireUser;
    private static extractBearerToken;
}
