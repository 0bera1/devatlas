"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const document_repository_1 = require("./document.repository");
const documents_controller_1 = require("./documents.controller");
const documents_service_1 = require("./documents.service");
const document_repository_interface_1 = require("./interfaces/document-repository.interface");
const documents_service_interface_1 = require("./interfaces/documents-service.interface");
const documentRepositoryProvider = {
    provide: document_repository_interface_1.DOCUMENT_REPOSITORY,
    useClass: document_repository_1.DocumentRepository,
};
const documentsServiceProvider = {
    provide: documents_service_interface_1.DOCUMENTS_SERVICE,
    useClass: documents_service_1.DocumentsService,
};
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        controllers: [documents_controller_1.DocumentsController],
        providers: [documentRepositoryProvider, documentsServiceProvider],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map