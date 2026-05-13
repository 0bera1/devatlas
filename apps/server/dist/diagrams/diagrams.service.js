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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagramsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const search_preview_1 = require("../documents/utils/search-preview");
const user_repository_interface_1 = require("../users/interfaces/user-repository.interface");
const user_activity_service_interface_1 = require("../user-activity/interfaces/user-activity-service.interface");
const search_constants_1 = require("./constants/search.constants");
const diagram_repository_interface_1 = require("./interfaces/diagram-repository.interface");
let DiagramsService = class DiagramsService {
    diagramRepository;
    userRepository;
    userActivityService;
    constructor(diagramRepository, userRepository, userActivityService) {
        this.diagramRepository = diagramRepository;
        this.userRepository = userRepository;
        this.userActivityService = userActivityService;
    }
    async createDiagram(ownerId, command) {
        const created = await this.diagramRepository.insertDiagram({
            ownerId,
            title: command.title,
            visibility: command.visibility,
        });
        await this.userActivityService.recordActivity(ownerId);
        return { ...created, viewerAccess: 'owner' };
    }
    async listDiagramsForUser(userId) {
        return this.diagramRepository.selectDiagramSummariesForUser(userId);
    }
    async getDiagram(viewerUserId, diagramId) {
        const diagram = await this.diagramRepository.selectDiagramByIdForUser(diagramId, viewerUserId);
        if (diagram === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        const viewerAccess = await this.resolveViewerAccess(diagram, diagramId, viewerUserId);
        return { ...diagram, viewerAccess };
    }
    async saveDiagramGraph(actorUserId, diagramId, command) {
        const nodeIds = new Set();
        for (const n of command.nodes) {
            if (nodeIds.has(n.id)) {
                throw new common_1.BadRequestException(`Duplicate node id: ${n.id}`);
            }
            nodeIds.add(n.id);
        }
        const nodes = command.nodes.map((n) => ({
            id: n.id,
            label: n.label,
            type: n.type,
            x: n.x,
            y: n.y,
            width: n.width ?? null,
            height: n.height ?? null,
        }));
        const edges = [];
        for (const e of command.edges) {
            if (!nodeIds.has(e.from)) {
                throw new common_1.BadRequestException(`Edge references unknown from node: ${e.from}`);
            }
            if (!nodeIds.has(e.to)) {
                throw new common_1.BadRequestException(`Edge references unknown to node: ${e.to}`);
            }
            edges.push({
                fromNodeId: e.from,
                toNodeId: e.to,
                label: e.label,
                type: e.type ?? 'smoothstep',
                animated: e.animated ?? false,
            });
        }
        const updated = await this.diagramRepository.replaceDiagramGraph(diagramId, actorUserId, nodes, edges);
        if (updated === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        const viewerAccess = await this.resolveViewerAccess(updated, diagramId, actorUserId);
        await this.userActivityService.recordActivity(actorUserId);
        return { ...updated, viewerAccess };
    }
    async patchDiagram(ownerId, diagramId, patch) {
        if (patch.title === undefined && patch.visibility === undefined) {
            throw new common_1.BadRequestException('Provide at least one field: title or visibility.');
        }
        const updated = await this.diagramRepository.updateDiagramPatchByIdAndOwnerId(diagramId, ownerId, patch);
        if (updated === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        return { ...updated, viewerAccess: 'owner' };
    }
    async addFavorite(userId, diagramId) {
        const accessible = await this.diagramRepository.selectDiagramByIdForUser(diagramId, userId);
        if (accessible === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        try {
            await this.diagramRepository.insertDiagramFavorite(userId, diagramId);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Diagram already favorited');
            }
            throw error;
        }
    }
    async removeDiagram(ownerId, diagramId) {
        const removed = await this.diagramRepository.deleteDiagramByIdAndOwnerId(diagramId, ownerId);
        if (!removed) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
    }
    async searchPublicDiagrams(rawQuery) {
        const trimmed = rawQuery.trim();
        if (trimmed.length === 0) {
            return [];
        }
        const rows = await this.diagramRepository.selectPublicDiagramsByQuery(trimmed, search_constants_1.SEARCH_DIAGRAMS_LIMIT);
        return rows.map((row) => ({
            kind: 'diagram',
            id: row.id,
            title: row.title,
            preview: (0, search_preview_1.buildSearchPreview)(row.nodeLabels.join('\n'), search_preview_1.SEARCH_PREVIEW_MAX_CHARS),
            ownerId: row.ownerId,
            author: {
                id: row.owner.id,
                name: row.owner.name,
                email: row.owner.email,
            },
            visibility: row.visibility,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
    }
    async getRelatedDiagrams(diagramId, viewerUserId) {
        const source = viewerUserId === null
            ? await this.diagramRepository.selectDiagramByIdPublicOnly(diagramId)
            : await this.diagramRepository.selectDiagramByIdForUser(diagramId, viewerUserId);
        if (source === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        return this.diagramRepository.selectPublicRelatedDiagramsBySharedNodeLabels(diagramId, search_constants_1.RELATED_DIAGRAMS_LIMIT);
    }
    async addDiagramCollaboratorByEmail(ownerId, diagramId, email) {
        const owned = await this.diagramRepository.selectDiagramByIdAndOwnerId(diagramId, ownerId);
        if (owned === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        const invitee = await this.userRepository.findPublicByEmailNormalized(email);
        if (invitee === null) {
            throw new common_1.NotFoundException('No user found with that email address.');
        }
        if (invitee.id === owned.ownerId) {
            throw new common_1.BadRequestException('The diagram owner is already a member.');
        }
        try {
            await this.diagramRepository.insertDiagramCollaborator(diagramId, invitee.id);
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002') {
                throw new common_1.ConflictException('This user is already a collaborator.');
            }
            throw err;
        }
        const list = await this.diagramRepository.selectDiagramCollaborators(diagramId);
        return [...list];
    }
    async removeDiagramCollaborator(ownerId, diagramId, targetUserId) {
        const owned = await this.diagramRepository.selectDiagramByIdAndOwnerId(diagramId, ownerId);
        if (owned === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        const removed = await this.diagramRepository.deleteDiagramCollaborator(diagramId, targetUserId);
        if (!removed) {
            throw new common_1.NotFoundException('Collaborator not found on this diagram.');
        }
        const list = await this.diagramRepository.selectDiagramCollaborators(diagramId);
        return [...list];
    }
    async listDiagramCollaborators(ownerId, diagramId) {
        const owned = await this.diagramRepository.selectDiagramByIdAndOwnerId(diagramId, ownerId);
        if (owned === null) {
            throw new common_1.NotFoundException(`Diagram with id "${diagramId}" not found`);
        }
        return this.diagramRepository.selectDiagramCollaborators(diagramId);
    }
    async resolveViewerAccess(diagram, diagramId, viewerUserId) {
        if (diagram.ownerId === viewerUserId) {
            return 'owner';
        }
        const isCollab = await this.diagramRepository.selectIsDiagramCollaborator(diagramId, viewerUserId);
        if (isCollab) {
            return 'collaborator';
        }
        return 'viewer';
    }
};
exports.DiagramsService = DiagramsService;
exports.DiagramsService = DiagramsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(diagram_repository_interface_1.DIAGRAM_REPOSITORY)),
    __param(1, (0, common_1.Inject)(user_repository_interface_1.USER_REPOSITORY)),
    __param(2, (0, common_1.Inject)(user_activity_service_interface_1.USER_ACTIVITY_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DiagramsService);
//# sourceMappingURL=diagrams.service.js.map