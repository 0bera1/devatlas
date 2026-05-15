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
exports.KnowledgeBaseService = void 0;
const common_1 = require("@nestjs/common");
const knowledge_repository_interface_1 = require("./interfaces/knowledge-repository.interface");
let KnowledgeBaseService = class KnowledgeBaseService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async listDocuments() {
        return this.repository.selectDocumentsOrdered();
    }
    async getDocumentBySlug(slug) {
        const row = await this.repository.selectDocumentBySlug(slug);
        if (row === null) {
            throw new common_1.NotFoundException(`Knowledge document "${slug}" not found`);
        }
        return row;
    }
    async listDiagrams() {
        return this.repository.selectDiagramsOrdered();
    }
    async getDiagramBySlug(slug) {
        const row = await this.repository.selectDiagramBySlug(slug);
        if (row === null) {
            throw new common_1.NotFoundException(`Knowledge diagram "${slug}" not found`);
        }
        return row;
    }
    async listFlows() {
        return this.repository.selectFlowsOrdered();
    }
    async getFlowBySlug(slug) {
        const row = await this.repository.selectFlowBySlug(slug);
        if (row === null) {
            throw new common_1.NotFoundException(`Knowledge flow "${slug}" not found`);
        }
        return row;
    }
};
exports.KnowledgeBaseService = KnowledgeBaseService;
exports.KnowledgeBaseService = KnowledgeBaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(knowledge_repository_interface_1.KNOWLEDGE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], KnowledgeBaseService);
//# sourceMappingURL=knowledge-base.service.js.map