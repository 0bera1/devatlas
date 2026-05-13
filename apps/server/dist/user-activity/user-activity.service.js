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
var UserActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivityService = void 0;
const common_1 = require("@nestjs/common");
const utc_date_bucket_1 = require("../documents/utils/utc-date-bucket");
const user_activity_repository_interface_1 = require("./interfaces/user-activity-repository.interface");
let UserActivityService = UserActivityService_1 = class UserActivityService {
    userActivityRepository;
    logger = new common_1.Logger(UserActivityService_1.name);
    constructor(userActivityRepository) {
        this.userActivityRepository = userActivityRepository;
    }
    async recordActivity(userId) {
        if (userId.trim().length === 0) {
            return;
        }
        const today = (0, utc_date_bucket_1.startOfUtcDay)(new Date());
        try {
            await this.userActivityRepository.upsertIncrementByUserAndDate(userId, today);
        }
        catch (error) {
            this.logger.warn(`Failed to record user activity for user "${userId}": ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    async getActivityInRange(userId, fromInclusive, toInclusive) {
        return this.userActivityRepository.selectActivityInRange(userId, (0, utc_date_bucket_1.startOfUtcDay)(fromInclusive), (0, utc_date_bucket_1.startOfUtcDay)(toInclusive));
    }
};
exports.UserActivityService = UserActivityService;
exports.UserActivityService = UserActivityService = UserActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_activity_repository_interface_1.USER_ACTIVITY_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UserActivityService);
//# sourceMappingURL=user-activity.service.js.map