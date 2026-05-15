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
exports.DocumentRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_interface_1 = require("../prisma/interfaces/prisma-service.interface");
const documentRecordSelect = {
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
};
const documentSearchRowSelect = {
    id: true,
    title: true,
    content: true,
    ownerId: true,
    visibility: true,
    viewCount: true,
    favoriteCount: true,
    createdAt: true,
    updatedAt: true,
    owner: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};
let DocumentRepository = class DocumentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async insertDocument(input) {
        const tagNames = input.tagNames;
        const documentTagCreates = tagNames !== undefined && tagNames.length > 0
            ? tagNames.map((name) => ({
                tag: {
                    connectOrCreate: {
                        where: { name },
                        create: { name },
                    },
                },
            }))
            : undefined;
        const data = {
            title: input.title,
            owner: { connect: { id: input.ownerId } },
            visibility: input.visibility ?? client_1.Visibility.PRIVATE,
        };
        if (documentTagCreates !== undefined) {
            data.documentTags = { create: [...documentTagCreates] };
        }
        if (input.categoryName !== undefined) {
            data.category = {
                connectOrCreate: {
                    where: { name: input.categoryName },
                    create: { name: input.categoryName },
                },
            };
        }
        return this.prisma.document.create({
            data,
            select: documentRecordSelect,
        });
    }
    async countAllDocumentsByOwnerId(ownerId) {
        return this.prisma.document.count({
            where: { ownerId },
        });
    }
    async countDocumentsByOwnerIdAndTitleContains(ownerId, titleSearch) {
        return this.prisma.document.count({
            where: {
                ownerId,
                title: {
                    contains: titleSearch,
                    mode: 'insensitive',
                },
            },
        });
    }
    async selectDocumentsByOwnerIdPage(ownerId, skip, take) {
        return this.prisma.document.findMany({
            where: { ownerId },
            select: documentRecordSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }
    async selectDocumentsByOwnerIdAndTitleContainsPage(ownerId, titleSearch, skip, take) {
        return this.prisma.document.findMany({
            where: {
                ownerId,
                title: {
                    contains: titleSearch,
                    mode: 'insensitive',
                },
            },
            select: documentRecordSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }
    async selectDocumentByIdForUser(id, userId) {
        return this.prisma.document.findFirst({
            where: {
                id,
                OR: [
                    { visibility: client_1.Visibility.PUBLIC },
                    { ownerId: userId },
                ],
            },
            select: documentRecordSelect,
        });
    }
    async selectDocumentByIdPublicOnly(id) {
        return this.prisma.document.findFirst({
            where: { id, visibility: client_1.Visibility.PUBLIC },
            select: documentRecordSelect,
        });
    }
    async selectDocumentByIdAndOwnerId(id, ownerId) {
        return this.prisma.document.findFirst({
            where: { id, ownerId },
            select: documentRecordSelect,
        });
    }
    async selectPublicDocumentsOrdered() {
        return this.prisma.document.findMany({
            where: { visibility: client_1.Visibility.PUBLIC },
            orderBy: { createdAt: 'desc' },
            select: documentRecordSelect,
        });
    }
    async selectPublicFeedLatest(take) {
        return this.prisma.document.findMany({
            where: { visibility: client_1.Visibility.PUBLIC },
            orderBy: { createdAt: 'desc' },
            take,
            select: documentRecordSelect,
        });
    }
    async selectPublicFeedTrending(take) {
        return this.prisma.document.findMany({
            where: { visibility: client_1.Visibility.PUBLIC },
            orderBy: [
                { favoriteCount: 'desc' },
                { viewCount: 'desc' },
            ],
            take,
            select: documentRecordSelect,
        });
    }
    async selectPublicDocumentsByQuery(searchTerm, take) {
        return this.prisma.document.findMany({
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
                        content: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                    {
                        documentTags: {
                            some: {
                                tag: {
                                    name: {
                                        contains: searchTerm,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                    },
                    {
                        category: {
                            name: {
                                contains: searchTerm,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            },
            take,
            orderBy: {
                favoriteCount: 'desc',
            },
            select: documentSearchRowSelect,
        });
    }
    async selectPublicRelatedDocumentsBySharedTagsAndCategory(sourceDocumentId, take) {
        const source = await this.prisma.document.findUnique({
            where: { id: sourceDocumentId },
            select: {
                categoryId: true,
                documentTags: {
                    select: {
                        tag: { select: { name: true } },
                    },
                },
            },
        });
        if (source === null) {
            return [];
        }
        const tagNames = source.documentTags.map((row) => row.tag.name);
        if (tagNames.length === 0) {
            return [];
        }
        return this.prisma.document.findMany({
            where: {
                id: { not: sourceDocumentId },
                visibility: client_1.Visibility.PUBLIC,
                categoryId: source.categoryId,
                documentTags: {
                    some: {
                        tag: {
                            name: { in: tagNames },
                        },
                    },
                },
            },
            orderBy: { favoriteCount: 'desc' },
            take,
            select: documentRecordSelect,
        });
    }
    async updateDocumentContentByIdAndOwnerId(id, ownerId, content) {
        const existing = await this.selectDocumentByIdAndOwnerId(id, ownerId);
        if (existing === null) {
            return null;
        }
        return this.prisma.document.update({
            where: { id },
            data: { content },
            select: documentRecordSelect,
        });
    }
    async updateDocumentTitleByIdAndOwnerId(id, ownerId, title) {
        return this.updateDocumentPatchByIdAndOwnerId(id, ownerId, { title });
    }
    async updateDocumentPatchByIdAndOwnerId(id, ownerId, patch) {
        const existing = await this.selectDocumentByIdAndOwnerId(id, ownerId);
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
        if (patch.categoryName !== undefined) {
            switch (patch.categoryName) {
                case null:
                    data.category = { disconnect: true };
                    break;
                default:
                    data.category = {
                        connectOrCreate: {
                            where: { name: patch.categoryName },
                            create: { name: patch.categoryName },
                        },
                    };
                    break;
            }
        }
        return this.prisma.document.update({
            where: { id },
            data,
            select: documentRecordSelect,
        });
    }
    async deleteDocumentsByIdAndOwnerId(id, ownerId) {
        const result = await this.prisma.document.deleteMany({
            where: { id, ownerId },
        });
        return result.count;
    }
};
exports.DocumentRepository = DocumentRepository;
exports.DocumentRepository = DocumentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_interface_1.PRISMA_SERVICE)),
    __metadata("design:paramtypes", [Object])
], DocumentRepository);
//# sourceMappingURL=document.repository.js.map