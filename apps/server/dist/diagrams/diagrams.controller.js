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
var DiagramsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagramsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const auth_service_interface_1 = require("../auth/interfaces/auth-service.interface");
const add_diagram_collaborator_dto_1 = require("./dto/add-diagram-collaborator.dto");
const create_diagram_dto_1 = require("./dto/create-diagram.dto");
const patch_diagram_dto_1 = require("./dto/patch-diagram.dto");
const save_diagram_dto_1 = require("./dto/save-diagram.dto");
const diagrams_service_interface_1 = require("./interfaces/diagrams-service.interface");
let DiagramsController = DiagramsController_1 = class DiagramsController {
    diagramsService;
    authService;
    constructor(diagramsService, authService) {
        this.diagramsService = diagramsService;
        this.authService = authService;
    }
    async create(req, dto) {
        const owner = DiagramsController_1.requireUser(req);
        return this.diagramsService.createDiagram(owner.id, {
            title: dto.title,
            visibility: dto.visibility,
        });
    }
    async favoriteDiagram(req, id) {
        const user = DiagramsController_1.requireUser(req);
        await this.diagramsService.addFavorite(user.id, id);
    }
    async list(req) {
        const owner = DiagramsController_1.requireUser(req);
        return this.diagramsService.listDiagramsForUser(owner.id);
    }
    async listCollaborators(req, id) {
        const owner = DiagramsController_1.requireUser(req);
        return this.diagramsService.listDiagramCollaborators(owner.id, id);
    }
    async addCollaborator(req, id, dto) {
        const owner = DiagramsController_1.requireUser(req);
        return this.diagramsService.addDiagramCollaboratorByEmail(owner.id, id, dto.email);
    }
    async removeCollaborator(req, id, userId) {
        const owner = DiagramsController_1.requireUser(req);
        return this.diagramsService.removeDiagramCollaborator(owner.id, id, userId);
    }
    async getRelatedDiagrams(id, authorization) {
        const bearer = DiagramsController_1.extractBearerToken(authorization);
        const subject = await this.authService.tryGetSubjectFromAccessToken(bearer);
        return this.diagramsService.getRelatedDiagrams(id, subject);
    }
    async getOne(req, id) {
        const user = DiagramsController_1.requireUser(req);
        return this.diagramsService.getDiagram(user.id, id);
    }
    async saveGraph(req, id, dto) {
        const actor = DiagramsController_1.requireUser(req);
        return this.diagramsService.saveDiagramGraph(actor.id, id, {
            nodes: dto.nodes,
            edges: dto.edges,
        });
    }
    async patchDiagram(req, id, dto) {
        const owner = DiagramsController_1.requireUser(req);
        return this.diagramsService.patchDiagram(owner.id, id, {
            title: dto.title,
            visibility: dto.visibility,
        });
    }
    async remove(req, id) {
        const owner = DiagramsController_1.requireUser(req);
        await this.diagramsService.removeDiagram(owner.id, id);
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
exports.DiagramsController = DiagramsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_diagram_dto_1.CreateDiagramDto]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/favorite'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "favoriteDiagram", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id/collaborators'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "listCollaborators", null);
__decorate([
    (0, common_1.Post)(':id/collaborators'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_diagram_collaborator_dto_1.AddDiagramCollaboratorDto]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "addCollaborator", null);
__decorate([
    (0, common_1.Delete)(':id/collaborators/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "removeCollaborator", null);
__decorate([
    (0, common_1.Get)(':id/related'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "getRelatedDiagrams", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, save_diagram_dto_1.SaveDiagramBodyDto]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "saveGraph", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, patch_diagram_dto_1.PatchDiagramDto]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "patchDiagram", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiagramsController.prototype, "remove", null);
exports.DiagramsController = DiagramsController = DiagramsController_1 = __decorate([
    (0, common_1.Controller)('diagrams'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Inject)(diagrams_service_interface_1.DIAGRAMS_SERVICE)),
    __param(1, (0, common_1.Inject)(auth_service_interface_1.AUTH_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], DiagramsController);
//# sourceMappingURL=diagrams.controller.js.map