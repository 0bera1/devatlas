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
var ProfileController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const activity_query_dto_1 = require("./dto/activity-query.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const profile_service_interface_1 = require("./interfaces/profile-service.interface");
const ONE_YEAR_DAYS = 365;
let ProfileController = ProfileController_1 = class ProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getMe(req) {
        const user = ProfileController_1.requireUser(req);
        return this.profileService.getProfile(user.id);
    }
    async updateMe(req, dto) {
        const user = ProfileController_1.requireUser(req);
        return this.profileService.updateProfile(user.id, {
            firstName: dto.firstName,
            lastName: dto.lastName,
            birthDate: dto.birthDate,
        });
    }
    async changePassword(req, dto) {
        const user = ProfileController_1.requireUser(req);
        await this.profileService.changePassword(user.id, {
            currentPassword: dto.currentPassword,
            newPassword: dto.newPassword,
        });
    }
    async getFavoriteDocuments(req) {
        const user = ProfileController_1.requireUser(req);
        return this.profileService.listFavoriteDocuments(user.id);
    }
    async getFavoriteDiagrams(req) {
        const user = ProfileController_1.requireUser(req);
        return this.profileService.listFavoriteDiagrams(user.id);
    }
    async getActivity(req, query) {
        const user = ProfileController_1.requireUser(req);
        const today = new Date();
        const defaultFrom = new Date(today);
        defaultFrom.setUTCDate(defaultFrom.getUTCDate() - ONE_YEAR_DAYS);
        const from = query.from ?? defaultFrom;
        const to = query.to ?? today;
        return this.profileService.getActivity(user.id, from, to);
    }
    static requireUser(req) {
        if (req.user === undefined) {
            throw new common_1.UnauthorizedException();
        }
        return req.user;
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('me/favorites/documents'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getFavoriteDocuments", null);
__decorate([
    (0, common_1.Get)('me/favorites/diagrams'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getFavoriteDiagrams", null);
__decorate([
    (0, common_1.Get)('me/activity'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, activity_query_dto_1.ActivityQueryDto]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getActivity", null);
exports.ProfileController = ProfileController = ProfileController_1 = __decorate([
    (0, common_1.Controller)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Inject)(profile_service_interface_1.PROFILE_SERVICE)),
    __metadata("design:paramtypes", [Object])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map