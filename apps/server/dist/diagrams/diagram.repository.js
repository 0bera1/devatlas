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
exports.DiagramRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
const diagramFullSelect = {
    id: true,
    title: true,
    ownerId: true,
    visibility: true,
    createdAt: true,
    updatedAt: true,
    nodes: {
        orderBy: { id: 'asc' },
        select: {
            id: true,
            diagramId: true,
            label: true,
            type: true,
            x: true,
            y: true,
        },
    },
    edges: {
        orderBy: { id: 'asc' },
        select: {
            id: true,
            diagramId: true,
            fromNodeId: true,
            toNodeId: true,
            label: true,
        },
    },
};
function mapPrismaDiagramToRecord(row) {
    const nodes = row.nodes.map((n) => ({
        id: n.id,
        diagramId: n.diagramId,
        label: n.label,
        type: n.type,
        x: n.x,
        y: n.y,
    }));
    const edges = row.edges.map((e) => ({
        id: e.id,
        diagramId: e.diagramId,
        fromNodeId: e.fromNodeId,
        toNodeId: e.toNodeId,
        label: e.label,
    }));
    return {
        id: row.id,
        title: row.title,
        ownerId: row.ownerId,
        visibility: row.visibility,
        viewerAccess: 'viewer',
        nodes,
        edges,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
let DiagramRepository = class DiagramRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async insertDiagram(input) {
        const row = await this.prisma.diagram.create({
            data: {
                title: input.title,
                ownerId: input.ownerId,
                visibility: input.visibility ?? client_1.Visibility.PRIVATE,
            },
            select: diagramFullSelect,
        });
        return mapPrismaDiagramToRecord(row);
    }
    async selectDiagramSummariesForUser(userId) {
        const rows = await this.prisma.diagram.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { collaborators: { some: { userId } } },
                ],
            },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                ownerId: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { nodes: true } },
            },
        });
        return rows.map((r) => ({
            id: r.id,
            title: r.title,
            ownerId: r.ownerId,
            visibility: r.visibility,
            accessRole: r.ownerId === userId ? 'owner' : 'collaborator',
            nodeCount: r._count.nodes,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        }));
    }
    async selectDiagramByIdAndOwnerId(id, ownerId) {
        const row = await this.prisma.diagram.findFirst({
            where: { id, ownerId },
            select: diagramFullSelect,
        });
        return row === null ? null : mapPrismaDiagramToRecord(row);
    }
    async selectDiagramByIdForUser(id, userId) {
        const row = await this.prisma.diagram.findFirst({
            where: {
                id,
                OR: [
                    { visibility: client_1.Visibility.PUBLIC },
                    { ownerId: userId },
                    { collaborators: { some: { userId } } },
                ],
            },
            select: diagramFullSelect,
        });
        return row === null ? null : mapPrismaDiagramToRecord(row);
    }
    async selectDiagramByIdPublicOnly(id) {
        const row = await this.prisma.diagram.findFirst({
            where: { id, visibility: client_1.Visibility.PUBLIC },
            select: diagramFullSelect,
        });
        return row === null ? null : mapPrismaDiagramToRecord(row);
    }
    async selectIsDiagramCollaborator(diagramId, userId) {
        const row = await this.prisma.diagramCollaborator.findUnique({
            where: {
                diagramId_userId: {
                    diagramId,
                    userId,
                },
            },
            select: { diagramId: true },
        });
        return row !== null;
    }
    async replaceDiagramGraph(diagramId, actorUserId, nodes, edges) {
        const allowed = await this.prisma.diagram.findFirst({
            where: {
                id: diagramId,
                OR: [
                    { ownerId: actorUserId },
                    { collaborators: { some: { userId: actorUserId } } },
                ],
            },
            select: { id: true },
        });
        if (allowed === null) {
            return null;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.edge.deleteMany({ where: { diagramId } });
            await tx.node.deleteMany({ where: { diagramId } });
            if (nodes.length > 0) {
                await tx.node.createMany({
                    data: nodes.map((n) => ({
                        id: n.id,
                        diagramId,
                        label: n.label,
                        type: n.type,
                        x: n.x,
                        y: n.y,
                    })),
                });
            }
            if (edges.length > 0) {
                await tx.edge.createMany({
                    data: edges.map((e) => ({
                        diagramId,
                        fromNodeId: e.fromNodeId,
                        toNodeId: e.toNodeId,
                        label: e.label ?? null,
                    })),
                });
            }
        });
        const after = await this.prisma.diagram.findUnique({
            where: { id: diagramId },
            select: diagramFullSelect,
        });
        return after === null ? null : mapPrismaDiagramToRecord(after);
    }
    async updateDiagramPatchByIdAndOwnerId(id, ownerId, patch) {
        const existing = await this.selectDiagramByIdAndOwnerId(id, ownerId);
        if (existing === null) {
            return null;
        }
        const data = {};
        if (patch.title !== undefined) {
            data.title = patch.title;
        }
        if (patch.visibility !== undefined) {
            data.visibility = patch.visibility;
        }
        const row = await this.prisma.diagram.update({
            where: { id },
            data,
            select: diagramFullSelect,
        });
        return mapPrismaDiagramToRecord(row);
    }
    async selectPublicDiagramsByQuery(searchTerm, take) {
        const rows = await this.prisma.diagram.findMany({
            where: {
                visibility: client_1.Visibility.PUBLIC,
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                    {
                        nodes: {
                            some: {
                                label: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                ],
            },
            take,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                ownerId: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                nodes: {
                    select: { label: true },
                    take: 16,
                },
            },
        });
        return rows.map((r) => ({
            id: r.id,
            title: r.title,
            ownerId: r.ownerId,
            visibility: r.visibility,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            owner: r.owner,
            nodeLabels: r.nodes.map((n) => n.label),
        }));
    }
    async selectPublicRelatedDiagramsBySharedNodeLabels(sourceDiagramId, take) {
        const source = await this.prisma.diagram.findUnique({
            where: { id: sourceDiagramId },
            select: {
                nodes: { select: { label: true } },
            },
        });
        if (source === null) {
            return [];
        }
        const labelSet = new Set();
        for (const n of source.nodes) {
            const trimmed = n.label.trim();
            if (trimmed.length > 0) {
                labelSet.add(trimmed);
            }
        }
        const labels = [...labelSet];
        if (labels.length === 0) {
            return [];
        }
        const orFilters = labels.map((label) => ({
            nodes: {
                some: {
                    label: { equals: label, mode: 'insensitive' },
                },
            },
        }));
        const rows = await this.prisma.diagram.findMany({
            where: {
                id: { not: sourceDiagramId },
                visibility: client_1.Visibility.PUBLIC,
                OR: orFilters,
            },
            take,
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                ownerId: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { nodes: true } },
            },
        });
        return rows.map((r) => ({
            id: r.id,
            title: r.title,
            ownerId: r.ownerId,
            visibility: r.visibility,
            accessRole: 'viewer',
            nodeCount: r._count.nodes,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        }));
    }
    async insertDiagramCollaborator(diagramId, userId) {
        await this.prisma.diagramCollaborator.create({
            data: {
                diagramId,
                userId,
            },
        });
    }
    async deleteDiagramCollaborator(diagramId, userId) {
        const result = await this.prisma.diagramCollaborator.deleteMany({
            where: { diagramId, userId },
        });
        return result.count > 0;
    }
    async selectDiagramCollaborators(diagramId) {
        const rows = await this.prisma.diagramCollaborator.findMany({
            where: { diagramId },
            orderBy: { createdAt: 'asc' },
            select: {
                userId: true,
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        });
        return rows.map((r) => ({
            userId: r.userId,
            email: r.user.email,
            name: r.user.name,
        }));
    }
};
exports.DiagramRepository = DiagramRepository;
exports.DiagramRepository = DiagramRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], DiagramRepository);
//# sourceMappingURL=diagram.repository.js.map