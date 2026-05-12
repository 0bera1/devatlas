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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const feed_constants_1 = require("./constants/feed.constants");
const related_constants_1 = require("./constants/related.constants");
const search_constants_1 = require("./constants/search.constants");
const search_preview_1 = require("./utils/search-preview");
const document_repository_interface_1 = require("./interfaces/document-repository.interface");
const engagement_repository_interface_1 = require("./interfaces/engagement-repository.interface");
const normalize_category_name_1 = require("./utils/normalize-category-name");
const normalize_document_tag_names_1 = require("./utils/normalize-document-tag-names");
const utc_date_bucket_1 = require("./utils/utc-date-bucket");
let DocumentsService = class DocumentsService {
    documentRepository;
    engagementRepository;
    constructor(documentRepository, engagementRepository) {
        this.documentRepository = documentRepository;
        this.engagementRepository = engagementRepository;
    }
    async createDocument(ownerId, command) {
        const tagNames = (0, normalize_document_tag_names_1.normalizeDocumentTagNames)(command.tags);
        const categoryName = (0, normalize_category_name_1.normalizeCategoryName)(command.categoryName);
        return this.documentRepository.insertDocument({
            ownerId,
            title: command.title,
            visibility: command.visibility,
            tagNames,
            ...(categoryName !== undefined ? { categoryName } : {}),
        });
    }
    async listDocuments(ownerId, params) {
        const page = params.page;
        const pageSize = params.pageSize;
        const skip = (page - 1) * pageSize;
        let total;
        let items;
        switch (params.titleQuery) {
            case null: {
                total = await this.documentRepository.countAllDocumentsByOwnerId(ownerId);
                items = await this.documentRepository.selectDocumentsByOwnerIdPage(ownerId, skip, pageSize);
                break;
            }
            default: {
                const titleSearch = params.titleQuery;
                total =
                    await this.documentRepository.countDocumentsByOwnerIdAndTitleContains(ownerId, titleSearch);
                items =
                    await this.documentRepository.selectDocumentsByOwnerIdAndTitleContainsPage(ownerId, titleSearch, skip, pageSize);
                break;
            }
        }
        const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
        return {
            items,
            total,
            page,
            pageSize,
            totalPages,
        };
    }
    async listPublicDocuments() {
        return this.documentRepository.selectPublicDocumentsOrdered();
    }
    async getDocument(userId, id) {
        const document = await this.documentRepository.selectDocumentByIdForUser(id, userId);
        if (document === null) {
            throw new common_1.NotFoundException(`Document with id "${id}" not found`);
        }
        return document;
    }
    async updateDocumentContent(ownerId, id, content) {
        const updated = await this.documentRepository.updateDocumentContentByIdAndOwnerId(id, ownerId, content);
        if (updated === null) {
            throw new common_1.NotFoundException(`Document with id "${id}" not found`);
        }
        return updated;
    }
    async updateDocumentTitle(ownerId, id, title) {
        const updated = await this.documentRepository.updateDocumentTitleByIdAndOwnerId(id, ownerId, title);
        if (updated === null) {
            throw new common_1.NotFoundException(`Document with id "${id}" not found`);
        }
        return updated;
    }
    async patchDocument(ownerId, id, patch) {
        const repoPatch = {};
        if (patch.title !== undefined) {
            repoPatch.title = patch.title;
        }
        if (patch.visibility !== undefined) {
            repoPatch.visibility = patch.visibility;
        }
        if (patch.categoryName !== undefined) {
            switch (patch.categoryName) {
                case null:
                    repoPatch.categoryName = null;
                    break;
                default: {
                    const normalized = (0, normalize_category_name_1.normalizeCategoryName)(patch.categoryName);
                    repoPatch.categoryName =
                        normalized === undefined ? null : normalized;
                    break;
                }
            }
        }
        if (repoPatch.title === undefined &&
            repoPatch.visibility === undefined &&
            repoPatch.categoryName === undefined) {
            throw new common_1.BadRequestException('Provide at least one field: title, visibility, or categoryName.');
        }
        const updated = await this.documentRepository.updateDocumentPatchByIdAndOwnerId(id, ownerId, repoPatch);
        if (updated === null) {
            throw new common_1.NotFoundException(`Document with id "${id}" not found`);
        }
        return updated;
    }
    async removeDocument(ownerId, id) {
        const deletedCount = await this.documentRepository.deleteDocumentsByIdAndOwnerId(id, ownerId);
        if (deletedCount === 0) {
            throw new common_1.NotFoundException(`Document with id "${id}" not found`);
        }
    }
    async getLatestPublicFeed() {
        return this.documentRepository.selectPublicFeedLatest(feed_constants_1.FEED_DEFAULT_LIMIT);
    }
    async getTrendingPublicFeed() {
        return this.documentRepository.selectPublicFeedTrending(feed_constants_1.FEED_DEFAULT_LIMIT);
    }
    async recordPublicDocumentView(documentId, viewerKey) {
        return this.engagementRepository.tryCountPublicDocumentView(documentId, viewerKey, (0, utc_date_bucket_1.startOfUtcDay)(new Date()));
    }
    async addFavorite(userId, documentId) {
        const doc = await this.documentRepository.selectDocumentByIdForUser(documentId, userId);
        if (doc === null) {
            throw new common_1.NotFoundException(`Document with id "${documentId}" not found`);
        }
        try {
            await this.engagementRepository.insertFavorite(userId, documentId);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Document already favorited');
            }
            throw error;
        }
    }
    async searchPublicDocuments(rawQuery) {
        const trimmed = rawQuery.trim();
        if (trimmed.length === 0) {
            return [];
        }
        const rows = await this.documentRepository.selectPublicDocumentsByQuery(trimmed, search_constants_1.SEARCH_PUBLIC_DOCUMENTS_LIMIT);
        return rows.map(row => ({
            kind: 'document',
            id: row.id,
            title: row.title,
            preview: (0, search_preview_1.buildSearchPreview)(row.content, search_preview_1.SEARCH_PREVIEW_MAX_CHARS),
            favoriteCount: row.favoriteCount,
            viewCount: row.viewCount,
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
    async getRelatedDocuments(documentId, viewerUserId) {
        const source = viewerUserId === null
            ? await this.documentRepository.selectDocumentByIdPublicOnly(documentId)
            : await this.documentRepository.selectDocumentByIdForUser(documentId, viewerUserId);
        if (source === null) {
            throw new common_1.NotFoundException(`Document with id "${documentId}" not found`);
        }
        return this.documentRepository.selectPublicRelatedDocumentsBySharedTagsAndCategory(documentId, related_constants_1.RELATED_PUBLIC_DOCUMENTS_LIMIT);
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(document_repository_interface_1.DOCUMENT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(engagement_repository_interface_1.ENGAGEMENT_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map