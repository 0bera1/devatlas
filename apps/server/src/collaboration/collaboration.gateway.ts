import { Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { DIAGRAMS_SERVICE } from '../diagrams/interfaces/diagrams-service.interface';
import type { IDiagramsService } from '../diagrams/interfaces/diagrams-service.interface';
import { DOCUMENTS_SERVICE } from '../documents/interfaces/documents-service.interface';
import type { IDocumentsService } from '../documents/interfaces/documents-service.interface';

@WebSocketGateway({
  namespace: 'collaboration',
})
export class CollaborationGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  public server!: Server;

  public constructor(
    private readonly jwtService: JwtService,
    @Inject(DIAGRAMS_SERVICE)
    private readonly diagramsService: IDiagramsService,
    @Inject(DOCUMENTS_SERVICE)
    private readonly documentsService: IDocumentsService,
  ) {}

  public afterInit(server: Server): void {
    server.use((socket, next) => {
      void this.verifySocket(socket, next);
    });
  }

  public handleDisconnect(client: Socket): void {
    const userId: string | undefined = client.data.userId as string | undefined;
    if (userId === undefined) {
      return;
    }
    for (const room of client.rooms) {
      if (room === client.id) {
        continue;
      }
      if (room.startsWith('document:')) {
        client.to(room).emit('document-peer-left', { userId });
      }
      if (room.startsWith('diagram:')) {
        client.to(room).emit('diagram-peer-left', { userId });
      }
    }
  }

  @SubscribeMessage('join-diagram')
  public async handleJoinDiagram(
    @MessageBody() body: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const diagramId: string = this.readId(body, 'diagramId');
    try {
      await this.diagramsService.getDiagram(client.data.userId, diagramId);
    } catch (err: unknown) {
      if (err instanceof NotFoundException) {
        throw new WsException('Diagram not found');
      }
      throw new WsException('Join failed');
    }
    const room: string = CollaborationGateway.diagramRoom(diagramId);
    await client.join(room);
    const diagramSockets = await this.server.in(room).fetchSockets();
    client.emit('diagram-room-snapshot', {
      peerCount: Math.max(0, diagramSockets.length - 1),
    });
    client.to(room).emit('diagram-peer-joined', {
      userId: client.data.userId as string,
    });
  }

  @SubscribeMessage('leave-diagram')
  public handleLeaveDiagram(
    @MessageBody() body: unknown,
    @ConnectedSocket() client: Socket,
  ): void {
    const diagramId: string = this.readId(body, 'diagramId');
    const room: string = CollaborationGateway.diagramRoom(diagramId);
    void client.leave(room);
    client.to(room).emit('diagram-peer-left', {
      userId: client.data.userId as string,
    });
  }

  @SubscribeMessage('node-move')
  public handleNodeMove(
    @MessageBody() body: unknown,
    @ConnectedSocket() client: Socket,
  ): void {
    const parsed = this.readNodeMove(body);
    const room: string = CollaborationGateway.diagramRoom(parsed.diagramId);
    if (!client.rooms.has(room)) {
      throw new WsException('Not in diagram room');
    }
    client.to(room).emit('node-move', {
      diagramId: parsed.diagramId,
      nodeId: parsed.nodeId,
      x: parsed.x,
      y: parsed.y,
      userId: client.data.userId as string,
    });
  }

  @SubscribeMessage('join-document')
  public async handleJoinDocument(
    @MessageBody() body: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const documentId: string = this.readId(body, 'documentId');
    try {
      await this.documentsService.getDocument(client.data.userId, documentId);
    } catch (err: unknown) {
      if (err instanceof NotFoundException) {
        throw new WsException('Document not found');
      }
      throw new WsException('Join failed');
    }
    const room: string = CollaborationGateway.documentRoom(documentId);
    await client.join(room);
    const documentSockets = await this.server.in(room).fetchSockets();
    client.emit('document-room-snapshot', {
      peerCount: Math.max(0, documentSockets.length - 1),
    });
    client.to(room).emit('document-peer-joined', {
      userId: client.data.userId as string,
    });
  }

  @SubscribeMessage('leave-document')
  public handleLeaveDocument(
    @MessageBody() body: unknown,
    @ConnectedSocket() client: Socket,
  ): void {
    const documentId: string = this.readId(body, 'documentId');
    const room: string = CollaborationGateway.documentRoom(documentId);
    void client.leave(room);
    client.to(room).emit('document-peer-left', {
      userId: client.data.userId as string,
    });
  }

  @SubscribeMessage('document-selection')
  public handleDocumentSelection(
    @MessageBody() body: unknown,
    @ConnectedSocket() client: Socket,
  ): void {
    const parsed = this.readDocumentSelection(body);
    const room: string = CollaborationGateway.documentRoom(parsed.documentId);
    if (!client.rooms.has(room)) {
      throw new WsException('Not in document room');
    }
    client.to(room).emit('document-selection', {
      documentId: parsed.documentId,
      userId: client.data.userId as string,
      anchor: parsed.anchor,
      focus: parsed.focus,
    });
  }

  private async verifySocket(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      const token: string = CollaborationGateway.extractToken(socket);
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      socket.data.userId = payload.sub;
      socket.data.email = payload.email;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  }

  private static extractToken(socket: Socket): string {
    const authUnknown: unknown = socket.handshake.auth;
    if (
      this.isRecord(authUnknown) &&
      typeof authUnknown.token === 'string' &&
      authUnknown.token.length > 0
    ) {
      return authUnknown.token;
    }
    const qRaw: unknown = socket.handshake.query?.token;
    let fromQuery = '';
   
    if (Array.isArray(qRaw)) {
      const first: unknown = qRaw[0];
      fromQuery = typeof first === 'string' ? first : '';
    } else if (typeof qRaw === 'string') {
      fromQuery = qRaw;
    }
    if (fromQuery.length > 0) {
      return fromQuery;
    }
    const bearerRaw: unknown = socket.handshake.headers.authorization;
    const bearer: string = typeof bearerRaw === 'string' ? bearerRaw : '';
    if (bearer.startsWith('Bearer ')) {
      return bearer.slice(7);
    }
    throw new Error('No token');
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private readId(body: unknown, key: string): string {
    if (!CollaborationGateway.isRecord(body)) {
      throw new WsException('Invalid payload');
    }
    const idRaw: unknown = body[key];
    if (typeof idRaw !== 'string' || idRaw.trim().length === 0) {
      throw new WsException('Invalid payload');
    }
    return idRaw.trim();
  }

  private readNodeMove(body: unknown): {
    diagramId: string;
    nodeId: string;
    x: number;
    y: number;
  } {
    if (!CollaborationGateway.isRecord(body)) {
      throw new WsException('Invalid payload');
    }
    const diagramId = body.diagramId;
    const nodeId = body.nodeId;
    const x = body.x;
    const y = body.y;
    if (
      typeof diagramId !== 'string' ||
      diagramId.length === 0 ||
      typeof nodeId !== 'string' ||
      nodeId.length === 0 ||
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      Number.isNaN(x) ||
      Number.isNaN(y)
    ) {
      throw new WsException('Invalid payload');
    }
    return { diagramId, nodeId, x, y };
  }

  private readDocumentSelection(body: unknown): {
    documentId: string;
    anchor: number;
    focus: number;
  } {
    if (!CollaborationGateway.isRecord(body)) {
      throw new WsException('Invalid payload');
    }
    const documentId = body.documentId;
    const anchor = body.anchor;
    const focus = body.focus;
    if (
      typeof documentId !== 'string' ||
      documentId.length === 0 ||
      typeof anchor !== 'number' ||
      typeof focus !== 'number' ||
      !Number.isFinite(anchor) ||
      !Number.isFinite(focus) ||
      anchor < 0 ||
      focus < 0
    ) {
      throw new WsException('Invalid payload');
    }
    return {
      documentId,
      anchor: Math.floor(anchor),
      focus: Math.floor(focus),
    };
  }

  private static diagramRoom(diagramId: string): string {
    return `diagram:${diagramId}`;
  }

  private static documentRoom(documentId: string): string {
    return `document:${documentId}`;
  }
}
