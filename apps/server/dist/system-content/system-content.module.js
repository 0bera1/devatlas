"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemContentModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const system_content_controller_1 = require("./system-content.controller");
const system_content_repository_1 = require("./system-content.repository");
const system_content_service_1 = require("./system-content.service");
const system_content_repository_interface_1 = require("./interfaces/system-content-repository.interface");
const system_content_service_interface_1 = require("./interfaces/system-content-service.interface");
const systemContentRepositoryProvider = {
    provide: system_content_repository_interface_1.SYSTEM_CONTENT_REPOSITORY,
    useClass: system_content_repository_1.SystemContentRepository,
};
const systemContentServiceProvider = {
    provide: system_content_service_interface_1.SYSTEM_CONTENT_SERVICE,
    useClass: system_content_service_1.SystemContentService,
};
let SystemContentModule = class SystemContentModule {
};
exports.SystemContentModule = SystemContentModule;
exports.SystemContentModule = SystemContentModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        controllers: [system_content_controller_1.SystemContentController],
        providers: [systemContentRepositoryProvider, systemContentServiceProvider],
    })
], SystemContentModule);
//# sourceMappingURL=system-content.module.js.map