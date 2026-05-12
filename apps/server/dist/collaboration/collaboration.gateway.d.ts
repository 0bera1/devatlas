import { JwtService } from '@nestjs/jwt';
import { OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { IDiagramsService } from '../diagrams/interfaces/diagrams-service.interface';
import type { IDocumentsService } from '../documents/interfaces/documents-service.interface';
export declare class CollaborationGateway implements OnGatewayInit, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly diagramsService;
    private readonly documentsService;
    server: Server;
    constructor(jwtService: JwtService, diagramsService: IDiagramsService, documentsService: IDocumentsService);
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleJoinDiagram(body: unknown, client: Socket): Promise<void>;
    handleLeaveDiagram(body: unknown, client: Socket): void;
    handleNodeMove(body: unknown, client: Socket): void;
    handleJoinDocument(body: unknown, client: Socket): Promise<void>;
    handleLeaveDocument(body: unknown, client: Socket): void;
    handleDocumentSelection(body: unknown, client: Socket): void;
    private verifySocket;
    private static extractToken;
    private static isRecord;
    private readId;
    private readNodeMove;
    private readDocumentSelection;
    private static diagramRoom;
    private static documentRoom;
}
