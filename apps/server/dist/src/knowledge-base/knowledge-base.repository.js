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
exports.KnowledgeBaseRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
const knowledge_narrative_locale_util_1 = require("./knowledge-narrative-locale.util");
const documentSummarySelect = {
    id: true,
    slug: true,
    title: true,
    summary: true,
    sortOrder: true,
    createdAt: true,
    updatedAt: true,
};
const diagramSummarySelect = {
    id: true,
    slug: true,
    title: true,
    description: true,
    narrativeTr: true,
    narrativeEn: true,
    sortOrder: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { nodes: true } },
};
const diagramFullSelect = {
    id: true,
    slug: true,
    title: true,
    description: true,
    narrativeTr: true,
    narrativeEn: true,
    sortOrder: true,
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
            width: true,
            height: true,
            relatedDiagramId: true,
            extras: true,
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
            type: true,
            animated: true,
        },
    },
};
const flowSummarySelect = {
    id: true,
    slug: true,
    title: true,
    description: true,
    narrativeTr: true,
    narrativeEn: true,
    sortOrder: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { steps: true } },
};
let KnowledgeBaseRepository = class KnowledgeBaseRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async selectDocumentsOrdered() {
        return this.prisma.systemDocument.findMany({
            select: documentSummarySelect,
            orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        });
    }
    async selectDocumentBySlug(slug) {
        return this.prisma.systemDocument.findUnique({
            where: { slug },
            select: { ...documentSummarySelect, content: true },
        });
    }
    async selectDiagramsOrdered(locale) {
        const rows = await this.prisma.systemDiagram.findMany({
            select: diagramSummarySelect,
            orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        });
        return rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            description: row.description,
            narrative: (0, knowledge_narrative_locale_util_1.pickKnowledgeNarrative)(row.narrativeTr, row.narrativeEn, locale),
            sortOrder: row.sortOrder,
            nodeCount: row._count.nodes,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
    }
    async selectDiagramBySlug(slug, locale) {
        const row = await this.prisma.systemDiagram.findUnique({
            where: { slug },
            select: diagramFullSelect,
        });
        if (row === null) {
            return null;
        }
        const nodes = row.nodes.map((n) => ({
            id: n.id,
            diagramId: n.diagramId,
            label: n.label,
            type: n.type,
            x: n.x,
            y: n.y,
            width: n.width,
            height: n.height,
            relatedDiagramId: n.relatedDiagramId,
            extras: n.extras ?? null,
        }));
        const edges = row.edges.map((e) => ({
            id: e.id,
            diagramId: e.diagramId,
            fromNodeId: e.fromNodeId,
            toNodeId: e.toNodeId,
            label: e.label,
            type: e.type,
            animated: e.animated,
        }));
        return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            description: row.description,
            narrative: (0, knowledge_narrative_locale_util_1.pickKnowledgeNarrative)(row.narrativeTr, row.narrativeEn, locale),
            sortOrder: row.sortOrder,
            nodeCount: nodes.length,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            nodes,
            edges,
        };
    }
    async selectFlowsOrdered(locale) {
        const rows = await this.prisma.systemFlow.findMany({
            select: flowSummarySelect,
            orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        });
        return rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            description: row.description,
            narrative: (0, knowledge_narrative_locale_util_1.pickKnowledgeNarrative)(row.narrativeTr, row.narrativeEn, locale),
            sortOrder: row.sortOrder,
            stepCount: row._count.steps,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
    }
    async selectFlowBySlug(slug, locale) {
        const row = await this.prisma.systemFlow.findUnique({
            where: { slug },
            select: {
                ...flowSummarySelect,
                steps: {
                    orderBy: { stepOrder: 'asc' },
                    select: {
                        id: true,
                        stepOrder: true,
                        label: true,
                        narrativeTr: true,
                        narrativeEn: true,
                        diagramId: true,
                        diagram: { select: { slug: true, title: true } },
                    },
                },
            },
        });
        if (row === null) {
            return null;
        }
        const steps = row.steps.map((s) => ({
            id: s.id,
            stepOrder: s.stepOrder,
            label: s.label,
            narrative: (0, knowledge_narrative_locale_util_1.pickKnowledgeNarrative)(s.narrativeTr, s.narrativeEn, locale),
            diagramId: s.diagramId,
            diagramSlug: s.diagram.slug,
            diagramTitle: s.diagram.title,
        }));
        return {
            id: row.id,
            slug: row.slug,
            title: row.title,
            description: row.description,
            narrative: (0, knowledge_narrative_locale_util_1.pickKnowledgeNarrative)(row.narrativeTr, row.narrativeEn, locale),
            sortOrder: row.sortOrder,
            stepCount: steps.length,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            steps,
        };
    }
};
exports.KnowledgeBaseRepository = KnowledgeBaseRepository;
exports.KnowledgeBaseRepository = KnowledgeBaseRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], KnowledgeBaseRepository);
//# sourceMappingURL=knowledge-base.repository.js.map