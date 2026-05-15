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
exports.IntelligenceRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
const intelligence_constants_1 = require("./constants/intelligence.constants");
const diagramRecommendationSelect = {
    id: true,
    title: true,
    ownerId: true,
    visibility: true,
    favoriteCount: true,
    createdAt: true,
    updatedAt: true,
    nodes: {
        select: { label: true },
        take: intelligence_constants_1.RELATED_NODE_LABEL_LIMIT,
    },
    _count: { select: { nodes: true } },
};
const documentRecommendationSelect = {
    id: true,
    title: true,
    content: true,
    ownerId: true,
    visibility: true,
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    viewCount: true,
    favoriteCount: true,
    createdAt: true,
    updatedAt: true,
    documentTags: {
        select: {
            tag: {
                select: {
                    name: true,
                },
            },
        },
    },
};
let IntelligenceRepository = class IntelligenceRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async selectAccessibleDiagramId(diagramId, viewerUserId) {
        const accessFilter = viewerUserId === null
            ? { visibility: client_1.Visibility.PUBLIC }
            : {
                OR: [
                    { visibility: client_1.Visibility.PUBLIC },
                    { ownerId: viewerUserId },
                    { collaborators: { some: { userId: viewerUserId } } },
                ],
            };
        const row = await this.prisma.diagram.findFirst({
            where: {
                id: diagramId,
                ...accessFilter,
            },
            select: { id: true },
        });
        return row?.id ?? null;
    }
    async selectNodeLabelsByDiagramId(diagramId) {
        return this.prisma.node.findMany({
            where: { diagramId },
            select: { label: true },
            orderBy: { id: 'asc' },
        });
    }
    async selectPublicDiagramCandidatesByKeywords(sourceDiagramId, keywords, take) {
        const keywordFilters = this.buildDiagramKeywordFilters(keywords);
        if (keywordFilters.length === 0) {
            return [];
        }
        return this.prisma.diagram.findMany({
            where: {
                id: { not: sourceDiagramId },
                visibility: client_1.Visibility.PUBLIC,
                OR: keywordFilters,
            },
            take,
            orderBy: { updatedAt: 'desc' },
            select: diagramRecommendationSelect,
        });
    }
    async selectPublicDocumentCandidatesByKeywords(keywords, take, interviewOnly) {
        const keywordFilters = this.buildDocumentKeywordFilters(keywords);
        if (keywordFilters.length === 0) {
            return [];
        }
        const markerFilters = interviewOnly
            ? this.buildDocumentInterviewMarkerFilters()
            : [];
        const where = {
            visibility: client_1.Visibility.PUBLIC,
            AND: markerFilters.length > 0
                ? [{ OR: keywordFilters }, { OR: markerFilters }]
                : [{ OR: keywordFilters }],
        };
        return this.prisma.document.findMany({
            where,
            take,
            orderBy: [
                { favoriteCount: 'desc' },
                { viewCount: 'desc' },
            ],
            select: documentRecommendationSelect,
        });
    }
    async selectPublicTechnologyDiagramCandidatesByKeywords(sourceDiagramId, keywords, take) {
        return this.selectPublicDiagramCandidatesByKeywords(sourceDiagramId, keywords, take);
    }
    async selectAccessibleDocumentTags(documentId, viewerUserId) {
        const accessFilter = viewerUserId === null
            ? { visibility: client_1.Visibility.PUBLIC }
            : {
                OR: [
                    { visibility: client_1.Visibility.PUBLIC },
                    { ownerId: viewerUserId },
                ],
            };
        const row = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                ...accessFilter,
            },
            select: {
                id: true,
                category: { select: { name: true } },
                documentTags: {
                    select: {
                        tag: { select: { name: true } },
                    },
                },
            },
        });
        if (row === null) {
            return null;
        }
        const tagNames = row.documentTags
            .map((entry) => entry.tag.name)
            .filter((name) => typeof name === 'string' && name.length > 0);
        return {
            id: row.id,
            tagNames,
            categoryName: row.category?.name ?? null,
        };
    }
    buildDiagramKeywordFilters(keywords) {
        return keywords.map((keyword) => ({
            nodes: {
                some: {
                    label: {
                        equals: keyword,
                        mode: 'insensitive',
                    },
                },
            },
        }));
    }
    buildDocumentKeywordFilters(keywords) {
        const filters = [];
        for (const keyword of keywords) {
            filters.push({
                title: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            }, {
                content: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            }, {
                documentTags: {
                    some: {
                        tag: {
                            name: {
                                contains: keyword,
                                mode: 'insensitive',
                            },
                        },
                    },
                },
            }, {
                category: {
                    name: {
                        contains: keyword,
                        mode: 'insensitive',
                    },
                },
            });
        }
        return filters;
    }
    buildDocumentInterviewMarkerFilters() {
        const filters = [];
        for (const marker of intelligence_constants_1.INTERVIEW_MARKERS) {
            filters.push({
                title: {
                    contains: marker,
                    mode: 'insensitive',
                },
            }, {
                content: {
                    contains: marker,
                    mode: 'insensitive',
                },
            });
        }
        return filters;
    }
};
exports.IntelligenceRepository = IntelligenceRepository;
exports.IntelligenceRepository = IntelligenceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], IntelligenceRepository);
//# sourceMappingURL=intelligence.repository.js.map