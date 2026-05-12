"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CollaborationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const diagrams_service_interface_1 = require("../diagrams/interfaces/diagrams-service.interface");
const documents_service_interface_1 = require("../documents/interfaces/documents-service.interface");
let CollaborationGateway = CollaborationGateway_1 = class CollaborationGateway {
    jwtService;
    diagramsService;
    documentsService;
    server;
    constructor(jwtService, diagramsService, documentsService) {
        this.jwtService = jwtService;
        this.diagramsService = diagramsService;
        this.documentsService = documentsService;
    }
    afterInit(server) {
        server.use((socket, next) => {
            void this.verifySocket(socket, next);
        });
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
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
    async handleJoinDiagram(body, client) {
        const diagramId = this.readId(body, 'diagramId');
        try {
            await this.diagramsService.getDiagram(client.data.userId, diagramId);
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException) {
                throw new websockets_1.WsException('Diagram not found');
            }
            throw new websockets_1.WsException('Join failed');
        }
        const room = CollaborationGateway_1.diagramRoom(diagramId);
        await client.join(room);
        const diagramSockets = await this.server.in(room).fetchSockets();
        client.emit('diagram-room-snapshot', {
            peerCount: Math.max(0, diagramSockets.length - 1),
        });
        client.to(room).emit('diagram-peer-joined', {
            userId: client.data.userId,
        });
    }
    handleLeaveDiagram(body, client) {
        const diagramId = this.readId(body, 'diagramId');
        const room = CollaborationGateway_1.diagramRoom(diagramId);
        void client.leave(room);
        client.to(room).emit('diagram-peer-left', {
            userId: client.data.userId,
        });
    }
    handleNodeMove(body, client) {
        const parsed = this.readNodeMove(body);
        const room = CollaborationGateway_1.diagramRoom(parsed.diagramId);
        if (!client.rooms.has(room)) {
            throw new websockets_1.WsException('Not in diagram room');
        }
        client.to(room).emit('node-move', {
            diagramId: parsed.diagramId,
            nodeId: parsed.nodeId,
            x: parsed.x,
            y: parsed.y,
            userId: client.data.userId,
        });
    }
    async handleJoinDocument(body, client) {
        const documentId = this.readId(body, 'documentId');
        try {
            await this.documentsService.getDocument(client.data.userId, documentId);
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException) {
                throw new websockets_1.WsException('Document not found');
            }
            throw new websockets_1.WsException('Join failed');
        }
        const room = CollaborationGateway_1.documentRoom(documentId);
        await client.join(room);
        const documentSockets = await this.server.in(room).fetchSockets();
        client.emit('document-room-snapshot', {
            peerCount: Math.max(0, documentSockets.length - 1),
        });
        client.to(room).emit('document-peer-joined', {
            userId: client.data.userId,
        });
    }
    handleLeaveDocument(body, client) {
        const documentId = this.readId(body, 'documentId');
        const room = CollaborationGateway_1.documentRoom(documentId);
        void client.leave(room);
        client.to(room).emit('document-peer-left', {
            userId: client.data.userId,
        });
    }
    handleDocumentSelection(body, client) {
        const parsed = this.readDocumentSelection(body);
        const room = CollaborationGateway_1.documentRoom(parsed.documentId);
        if (!client.rooms.has(room)) {
            throw new websockets_1.WsException('Not in document room');
        }
        client.to(room).emit('document-selection', {
            documentId: parsed.documentId,
            userId: client.data.userId,
            anchor: parsed.anchor,
            focus: parsed.focus,
        });
    }
    async verifySocket(socket, next) {
        try {
            const token = CollaborationGateway_1.extractToken(socket);
            const payload = await this.jwtService.verifyAsync(token);
            socket.data.userId = payload.sub;
            socket.data.email = payload.email;
            next();
        }
        catch {
            next(new Error('Unauthorized'));
        }
    }
    static extractToken(socket) {
        const authUnknown = socket.handshake.auth;
        if (this.isRecord(authUnknown) &&
            typeof authUnknown.token === 'string' &&
            authUnknown.token.length > 0) {
            return authUnknown.token;
        }
        const qRaw = socket.handshake.query?.token;
        let fromQuery = '';
        if (Array.isArray(qRaw)) {
            const first = qRaw[0];
            fromQuery = typeof first === 'string' ? first : '';
        }
        else if (typeof qRaw === 'string') {
            fromQuery = qRaw;
        }
        if (fromQuery.length > 0) {
            return fromQuery;
        }
        const bearerRaw = socket.handshake.headers.authorization;
        const bearer = typeof bearerRaw === 'string' ? bearerRaw : '';
        if (bearer.startsWith('Bearer ')) {
            return bearer.slice(7);
        }
        throw new Error('No token');
    }
    static isRecord(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
    readId(body, key) {
        if (!CollaborationGateway_1.isRecord(body)) {
            throw new websockets_1.WsException('Invalid payload');
        }
        const idRaw = body[key];
        if (typeof idRaw !== 'string' || idRaw.trim().length === 0) {
            throw new websockets_1.WsException('Invalid payload');
        }
        return idRaw.trim();
    }
    readNodeMove(body) {
        if (!CollaborationGateway_1.isRecord(body)) {
            throw new websockets_1.WsException('Invalid payload');
        }
        const diagramId = body.diagramId;
        const nodeId = body.nodeId;
        const x = body.x;
        const y = body.y;
        if (typeof diagramId !== 'string' ||
            diagramId.length === 0 ||
            typeof nodeId !== 'string' ||
            nodeId.length === 0 ||
            typeof x !== 'number' ||
            typeof y !== 'number' ||
            Number.isNaN(x) ||
            Number.isNaN(y)) {
            throw new websockets_1.WsException('Invalid payload');
        }
        return { diagramId, nodeId, x, y };
    }
    readDocumentSelection(body) {
        if (!CollaborationGateway_1.isRecord(body)) {
            throw new websockets_1.WsException('Invalid payload');
        }
        const documentId = body.documentId;
        const anchor = body.anchor;
        const focus = body.focus;
        if (typeof documentId !== 'string' ||
            documentId.length === 0 ||
            typeof anchor !== 'number' ||
            typeof focus !== 'number' ||
            !Number.isFinite(anchor) ||
            !Number.isFinite(focus) ||
            anchor < 0 ||
            focus < 0) {
            throw new websockets_1.WsException('Invalid payload');
        }
        return {
            documentId,
            anchor: Math.floor(anchor),
            focus: Math.floor(focus),
        };
    }
    static diagramRoom(diagramId) {
        return `diagram:${diagramId}`;
    }
    static documentRoom(documentId) {
        return `document:${documentId}`;
    }
};
exports.CollaborationGateway = CollaborationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], CollaborationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-diagram'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleJoinDiagram", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-diagram'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleLeaveDiagram", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('node-move'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleNodeMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-document'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleJoinDocument", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-document'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleLeaveDocument", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('document-selection'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleDocumentSelection", null);
exports.CollaborationGateway = CollaborationGateway = CollaborationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'collaboration',
    }),
    __param(1, (0, common_1.Inject)(diagrams_service_interface_1.DIAGRAMS_SERVICE)),
    __param(2, (0, common_1.Inject)(documents_service_interface_1.DOCUMENTS_SERVICE)),
    __metadata("design:paramtypes", [jwt_1.JwtService, Object, Object])
], CollaborationGateway);
//# sourceMappingURL=collaboration.gateway.js.map