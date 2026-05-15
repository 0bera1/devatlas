"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseModule = void 0;
const common_1 = require("@nestjs/common");
const knowledge_base_controller_1 = require("./knowledge-base.controller");
const knowledge_base_repository_1 = require("./knowledge-base.repository");
const knowledge_base_service_1 = require("./knowledge-base.service");
const knowledge_repository_interface_1 = require("./interfaces/knowledge-repository.interface");
const knowledge_service_interface_1 = require("./interfaces/knowledge-service.interface");
const knowledgeRepositoryProvider = {
    provide: knowledge_repository_interface_1.KNOWLEDGE_REPOSITORY,
    useClass: knowledge_base_repository_1.KnowledgeBaseRepository,
};
const knowledgeServiceProvider = {
    provide: knowledge_service_interface_1.KNOWLEDGE_SERVICE,
    useClass: knowledge_base_service_1.KnowledgeBaseService,
};
let KnowledgeBaseModule = class KnowledgeBaseModule {
};
exports.KnowledgeBaseModule = KnowledgeBaseModule;
exports.KnowledgeBaseModule = KnowledgeBaseModule = __decorate([
    (0, common_1.Module)({
        controllers: [knowledge_base_controller_1.KnowledgeBaseController],
        providers: [knowledgeRepositoryProvider, knowledgeServiceProvider],
    })
], KnowledgeBaseModule);
//# sourceMappingURL=knowledge-base.module.js.map