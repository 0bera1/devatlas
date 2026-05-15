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
var DocumentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_service_interface_1 = require("../auth/interfaces/auth-service.interface");
const create_document_dto_1 = require("./dto/create-document.dto");
const list_documents_query_dto_1 = require("./dto/list-documents-query.dto");
const patch_document_dto_1 = require("./dto/patch-document.dto");
const update_document_dto_1 = require("./dto/update-document.dto");
const documents_service_interface_1 = require("./interfaces/documents-service.interface");
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
let DocumentsController = DocumentsController_1 = class DocumentsController {
    documentsService;
    authService;
    constructor(documentsService, authService) {
        this.documentsService = documentsService;
        this.authService = authService;
    }
    async getPublicDocuments() {
        return this.documentsService.listPublicDocuments();
    }
    async recordDocumentView(id, authorization, anonymousIdHeader) {
        const bearer = DocumentsController_1.extractBearerToken(authorization);
        const subject = await this.authService.tryGetSubjectFromAccessToken(bearer);
        let viewerKey;
        let anonymousId;
        if (subject !== null) {
            viewerKey = `user:${subject}`;
        }
        else {
            const trimmedHeader = anonymousIdHeader !== undefined && anonymousIdHeader.trim().length > 0
                ? anonymousIdHeader.trim()
                : undefined;
            if (trimmedHeader === undefined) {
                const generated = (0, crypto_1.randomUUID)();
                anonymousId = generated;
                viewerKey = `anon:${generated}`;
            }
            else {
                viewerKey = `anon:${trimmedHeader}`;
            }
        }
        const counted = await this.documentsService.recordPublicDocumentView(id, viewerKey);
        return {
            counted,
            anonymousId,
        };
    }
    async favoriteDocument(req, id) {
        const user = DocumentsController_1.requireUser(req);
        await this.documentsService.addFavorite(user.id, id);
    }
    async create(req, dto) {
        const owner = DocumentsController_1.requireUser(req);
        return this.documentsService.createDocument(owner.id, {
            title: dto.title,
            visibility: dto.visibility,
            tags: dto.tags,
            categoryName: dto.categoryName,
        });
    }
    async findAll(req, query) {
        const owner = DocumentsController_1.requireUser(req);
        const page = query.page ?? DEFAULT_PAGE;
        const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
        const trimmedQuery = query.q?.trim();
        const titleQuery = trimmedQuery !== undefined && trimmedQuery.length > 0
            ? trimmedQuery
            : null;
        return this.documentsService.listDocuments(owner.id, {
            page,
            pageSize,
            titleQuery,
        });
    }
    async getRelatedDocuments(id, authorization) {
        const bearer = DocumentsController_1.extractBearerToken(authorization);
        const subject = await this.authService.tryGetSubjectFromAccessToken(bearer);
        return this.documentsService.getRelatedDocuments(id, subject);
    }
    async findOne(req, id) {
        const user = DocumentsController_1.requireUser(req);
        return this.documentsService.getDocument(user.id, id);
    }
    async updateContent(req, id, dto) {
        const owner = DocumentsController_1.requireUser(req);
        return this.documentsService.updateDocumentContent(owner.id, id, dto.content);
    }
    async patchDocument(req, id, dto) {
        const owner = DocumentsController_1.requireUser(req);
        return this.documentsService.patchDocument(owner.id, id, {
            title: dto.title,
            visibility: dto.visibility,
            categoryName: dto.categoryName,
        });
    }
    async remove(req, id) {
        const owner = DocumentsController_1.requireUser(req);
        await this.documentsService.removeDocument(owner.id, id);
    }
    static requireUser(req) {
        if (req.user === undefined) {
            throw new common_1.UnauthorizedException();
        }
        return req.user;
    }
    static extractBearerToken(authorization) {
        if (authorization === undefined) {
            return undefined;
        }
        const trimmed = authorization.trim();
        if (!trimmed.startsWith('Bearer ')) {
            return undefined;
        }
        const token = trimmed.slice(7).trim();
        return token.length > 0 ? token : undefined;
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)('public'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getPublicDocuments", null);
__decorate([
    (0, common_1.Post)(':id/view'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-anonymous-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "recordDocumentView", null);
__decorate([
    (0, common_1.Post)(':id/favorite'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "favoriteDocument", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_document_dto_1.CreateDocumentDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_documents_query_dto_1.ListDocumentsQueryDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/related'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getRelatedDocuments", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_document_dto_1.UpdateDocumentDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patch_document_dto_1.PatchDocumentDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "patchDocument", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "remove", null);
exports.DocumentsController = DocumentsController = DocumentsController_1 = __decorate([
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Inject)(documents_service_interface_1.DOCUMENTS_SERVICE)),
    __param(1, (0, common_1.Inject)(auth_service_interface_1.AUTH_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map