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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const user_repository_interface_1 = require("../users/interfaces/user-repository.interface");
const user_activity_service_interface_1 = require("../user-activity/interfaces/user-activity-service.interface");
const profile_repository_interface_1 = require("./interfaces/profile-repository.interface");
const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
let ProfileService = class ProfileService {
    userRepository;
    profileRepository;
    userActivityService;
    constructor(userRepository, profileRepository, userActivityService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.userActivityService = userActivityService;
    }
    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (user === null) {
            throw new common_1.NotFoundException(`User with id "${userId}" not found`);
        }
        return user;
    }
    async updateProfile(userId, command) {
        if (command.name === undefined && command.birthDate === undefined) {
            throw new common_1.BadRequestException('Provide at least one field: name or birthDate.');
        }
        const updated = await this.userRepository.updateProfileById(userId, {
            name: command.name,
            birthDate: command.birthDate,
        });
        if (updated === null) {
            throw new common_1.NotFoundException(`User with id "${userId}" not found`);
        }
        return updated;
    }
    async changePassword(userId, command) {
        if (command.newPassword.length < MIN_PASSWORD_LENGTH) {
            throw new common_1.BadRequestException(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        }
        if (command.newPassword === command.currentPassword) {
            throw new common_1.BadRequestException('New password must be different from the current password.');
        }
        const currentHash = await this.userRepository.selectPasswordHashById(userId);
        if (currentHash === null) {
            throw new common_1.NotFoundException(`User with id "${userId}" not found`);
        }
        const matches = await bcrypt.compare(command.currentPassword, currentHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Current password is incorrect.');
        }
        const newHash = await bcrypt.hash(command.newPassword, BCRYPT_SALT_ROUNDS);
        const updated = await this.userRepository.updatePasswordHashById(userId, newHash);
        if (!updated) {
            throw new common_1.NotFoundException(`User with id "${userId}" not found`);
        }
    }
    async listFavoriteDocuments(userId) {
        return this.profileRepository.selectFavoriteDocumentsByUserId(userId);
    }
    async listFavoriteDiagrams(userId) {
        return this.profileRepository.selectFavoriteDiagramsByUserId(userId);
    }
    async getActivity(userId, fromInclusive, toInclusive) {
        return this.userActivityService.getActivityInRange(userId, fromInclusive, toInclusive);
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(profile_repository_interface_1.PROFILE_REPOSITORY)),
    __param(2, (0, common_1.Inject)(user_activity_service_interface_1.USER_ACTIVITY_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ProfileService);
//# sourceMappingURL=profile.service.js.map