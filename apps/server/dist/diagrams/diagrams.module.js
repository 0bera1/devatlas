"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagramsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const diagram_repository_1 = require("./diagram.repository");
const diagrams_controller_1 = require("./diagrams.controller");
const diagrams_service_1 = require("./diagrams.service");
const diagram_repository_interface_1 = require("./interfaces/diagram-repository.interface");
const diagrams_service_interface_1 = require("./interfaces/diagrams-service.interface");
const diagramRepositoryProvider = {
    provide: diagram_repository_interface_1.DIAGRAM_REPOSITORY,
    useClass: diagram_repository_1.DiagramRepository,
};
const diagramsServiceProvider = {
    provide: diagrams_service_interface_1.DIAGRAMS_SERVICE,
    useClass: diagrams_service_1.DiagramsService,
};
let DiagramsModule = class DiagramsModule {
};
exports.DiagramsModule = DiagramsModule;
exports.DiagramsModule = DiagramsModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule), users_module_1.UsersModule],
        controllers: [diagrams_controller_1.DiagramsController],
        providers: [diagramRepositoryProvider, diagramsServiceProvider],
        exports: [diagramsServiceProvider],
    })
], DiagramsModule);
//# sourceMappingURL=diagrams.module.js.map