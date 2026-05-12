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
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_document_dto_1 = require("./dto/create-document.dto");
const list_documents_query_dto_1 = require("./dto/list-documents-query.dto");
const patch_document_dto_1 = require("./dto/patch-document.dto");
const update_document_dto_1 = require("./dto/update-document.dto");
const documents_service_interface_1 = require("./interfaces/documents-service.interface");
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
let DocumentsController = DocumentsController_1 = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async create(req, dto) {
        const owner = DocumentsController_1.requireUser(req);
        return this.documentsService.createDocument(owner.id, dto.title);
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
    async findOne(req, id) {
        const owner = DocumentsController_1.requireUser(req);
        return this.documentsService.getDocument(owner.id, id);
    }
    async updateContent(req, id, dto) {
        const owner = DocumentsController_1.requireUser(req);
        return this.documentsService.updateDocumentContent(owner.id, id, dto.content);
    }
    async patchTitle(req, id, dto) {
        const owner = DocumentsController_1.requireUser(req);
        return this.documentsService.updateDocumentTitle(owner.id, id, dto.title);
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
};
exports.DocumentsController = DocumentsController;
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
], DocumentsController.prototype, "patchTitle", null);
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
    __metadata("design:paramtypes", [Object])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map