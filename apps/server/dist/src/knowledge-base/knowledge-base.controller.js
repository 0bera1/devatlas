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
exports.KnowledgeBaseController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const knowledge_service_interface_1 = require("./interfaces/knowledge-service.interface");
let KnowledgeBaseController = class KnowledgeBaseController {
    knowledgeService;
    constructor(knowledgeService) {
        this.knowledgeService = knowledgeService;
    }
    async listDocuments() {
        return this.knowledgeService.listDocuments();
    }
    async getDocument(slug) {
        return this.knowledgeService.getDocumentBySlug(slug);
    }
    async listDiagrams() {
        return this.knowledgeService.listDiagrams();
    }
    async getDiagram(slug) {
        return this.knowledgeService.getDiagramBySlug(slug);
    }
    async listFlows() {
        return this.knowledgeService.listFlows();
    }
    async getFlow(slug) {
        return this.knowledgeService.getFlowBySlug(slug);
    }
};
exports.KnowledgeBaseController = KnowledgeBaseController;
__decorate([
    (0, common_1.Get)('documents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "listDocuments", null);
__decorate([
    (0, common_1.Get)('documents/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Get)('diagrams'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "listDiagrams", null);
__decorate([
    (0, common_1.Get)('diagrams/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "getDiagram", null);
__decorate([
    (0, common_1.Get)('flows'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "listFlows", null);
__decorate([
    (0, common_1.Get)('flows/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeBaseController.prototype, "getFlow", null);
exports.KnowledgeBaseController = KnowledgeBaseController = __decorate([
    (0, common_1.Controller)('knowledge'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Inject)(knowledge_service_interface_1.KNOWLEDGE_SERVICE)),
    __metadata("design:paramtypes", [Object])
], KnowledgeBaseController);
//# sourceMappingURL=knowledge-base.controller.js.map