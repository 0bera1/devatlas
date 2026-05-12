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
const document_repository_interface_1 = require("./interfaces/document-repository.interface");
let DocumentsService = class DocumentsService {
    documentRepository;
    constructor(documentRepository) {
        this.documentRepository = documentRepository;
    }
    async createDocument(ownerId, title, visibility) {
        return this.documentRepository.insertDocument({
            ownerId,
            title,
            visibility,
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
        if (patch.title === undefined && patch.visibility === undefined) {
            throw new common_1.BadRequestException('Provide at least one field: title or visibility.');
        }
        const updated = await this.documentRepository.updateDocumentPatchByIdAndOwnerId(id, ownerId, patch);
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
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(document_repository_interface_1.DOCUMENT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map