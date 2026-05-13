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
var IntelligenceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_service_interface_1 = require("../auth/interfaces/auth-service.interface");
const auto_tag_request_dto_1 = require("./dto/auto-tag-request.dto");
const generate_diagram_request_dto_1 = require("./dto/generate-diagram-request.dto");
const intelligence_service_interface_1 = require("./interfaces/intelligence-service.interface");
let IntelligenceController = IntelligenceController_1 = class IntelligenceController {
    intelligenceService;
    authService;
    constructor(intelligenceService, authService) {
        this.intelligenceService = intelligenceService;
        this.authService = authService;
    }
    async getDiagramResources(id, authorization) {
        const bearer = IntelligenceController_1.extractBearerToken(authorization);
        const subject = await this.authService.tryGetSubjectFromAccessToken(bearer);
        return this.intelligenceService.getDiagramResources(id, subject);
    }
    extractAutoTags(body) {
        const tags = this.intelligenceService.extractAutoTagsFromSource({
            title: body.title,
            content: body.content,
            extraKeywords: body.extraKeywords,
        });
        return { tags };
    }
    generateDiagram(body) {
        return this.intelligenceService.generateDiagramFromPrompt(body.prompt);
    }
    async getRelatedInterviewQuestionsForDocument(id, authorization) {
        const bearer = IntelligenceController_1.extractBearerToken(authorization);
        const subject = await this.authService.tryGetSubjectFromAccessToken(bearer);
        return this.intelligenceService.getRelatedInterviewQuestionsForDocument(id, subject);
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
exports.IntelligenceController = IntelligenceController;
__decorate([
    (0, common_1.Get)('diagrams/:id/resources'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getDiagramResources", null);
__decorate([
    (0, common_1.Post)('auto-tags'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auto_tag_request_dto_1.AutoTagRequestDto]),
    __metadata("design:returntype", Object)
], IntelligenceController.prototype, "extractAutoTags", null);
__decorate([
    (0, common_1.Post)('diagrams/generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_diagram_request_dto_1.GenerateDiagramRequestDto]),
    __metadata("design:returntype", Object)
], IntelligenceController.prototype, "generateDiagram", null);
__decorate([
    (0, common_1.Get)('documents/:id/interview-questions'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntelligenceController.prototype, "getRelatedInterviewQuestionsForDocument", null);
exports.IntelligenceController = IntelligenceController = IntelligenceController_1 = __decorate([
    (0, common_1.Controller)('intelligence'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Inject)(intelligence_service_interface_1.INTELLIGENCE_SERVICE)),
    __param(1, (0, common_1.Inject)(auth_service_interface_1.AUTH_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], IntelligenceController);
//# sourceMappingURL=intelligence.controller.js.map